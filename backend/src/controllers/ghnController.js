const Order = require("../models/Order");
const ghnService = require("../services/ghnService");
const calculateShippingFee = require('../utils/shippingFee');
const logger = require("../utils/logger");

// 1. Tạo đơn hàng trên GHN — dùng `ghnService.createOrder`
exports.createGHNOrder = async (orderId) => {
    try {
        const order = await Order.findById(orderId);
        if (!order) return null;

        // build payload from order.shipping with env fallbacks
        const ship = order.shipping || {};
        const to_name = order.customerInfo?.fullName || "Khách hàng";
        const to_phone = order.customerInfo?.phone;
        const to_address = ship.shippingAddressStructured?.detail || order.customerInfo?.address || "";

        // must have phone and district/ward to create GHN order
        let to_district_id = ship.shippingAddressStructured?.district?.id || ship.shippingAddressStructured?.district?.district_id || process.env.GHN_TO_DISTRICT_ID || process.env.GHN_SHOP_DISTRICT_ID;
        let to_ward_code = ship.shippingAddressStructured?.ward?.code || ship.shippingAddressStructured?.ward?.WardCode || process.env.GHN_TO_WARD_CODE || process.env.GHN_FROM_WARD_ID;

        // Try to resolve district/ward by name using GHN master-data if ids/codes missing
        try {
            if ((!to_district_id || !to_ward_code) && ship.shippingAddressStructured) {
                const ghn = require('../services/ghnService');
                // resolve province id if available by name
                let provinceId = ship.shippingAddressStructured?.province?.id;
                if (!provinceId && ship.shippingAddressStructured?.province?.name) {
                    const provinces = await ghn.getProvinces();
                    const foundProvince = (provinces || []).find(p => String(p.ProvinceName || p.name || p.ProvinceName).toLowerCase().includes(String(ship.shippingAddressStructured.province.name).toLowerCase()));
                    if (foundProvince) provinceId = foundProvince.ProvinceID || foundProvince.province_id || foundProvince.id || foundProvince.ProvinceID;
                }

                // resolve district id by name if missing
                if (!to_district_id && ship.shippingAddressStructured?.district?.name) {
                    if (provinceId) {
                        const districts = await ghn.getDistricts(provinceId);
                        const found = (districts || []).find(d => String(d.DistrictName || d.name || d.district_name).toLowerCase().includes(String(ship.shippingAddressStructured.district.name).toLowerCase()));
                        if (found) to_district_id = found.DistrictID || found.district_id || found.id || found.DistrictID;
                    }
                }

                // resolve ward code by name if missing and district id available
                if (!to_ward_code && to_district_id && ship.shippingAddressStructured?.ward?.name) {
                    const wards = await ghn.getWards(Number(to_district_id));
                    const foundW = (wards || []).find(w => String(w.WardName || w.name || w.ward_name).toLowerCase().includes(String(ship.shippingAddressStructured.ward.name).toLowerCase()));
                    if (foundW) to_ward_code = foundW.WardCode || foundW.ward_code || foundW.code;
                }
            }
        } catch (errResolve) {
            logger.warn('GHN master-data resolution failed', { orderId, err: errResolve.message || errResolve });
        }

        const missing = [];
        if (!to_phone) missing.push('to_phone');
        if (!to_district_id) missing.push('to_district_id');
        if (!to_ward_code) missing.push('to_ward_code');
        if (missing.length > 0) {
            logger.warn("GHN create skipped: missing recipient phone/district/ward", { orderId, missing });
            throw new Error("Missing recipient fields for GHN: " + missing.join(', '));
        }

        // Determine payment type and COD/client paid amounts
        const pm = (order.paymentMethod || '').toUpperCase();
        const isCOD = pm === 'COD' || pm === 'CASH';
        const payment_type_id = isCOD ? 2 : 1; // 2 = COD, 1 = prepaid
        const cod_amount = isCOD ? Math.max(0, Number(order.totalPrice || 0)) : 0;
        const client_paid_amount = isCOD ? 0 : Math.max(0, Number(order.totalPrice || 0));

        const payload = {
            payment_type_id,
            cod_amount,
            client_paid_amount,
            note: `Order ${order._id}`,
            required_note: "CHOXEMHANGKHONGTHU",
            to_name,
            to_phone: String(to_phone),
            to_address,
            from_district_id: Number(process.env.GHN_FROM_DISTRICT_ID || process.env.GHN_SHOP_DISTRICT_ID || 0),
            from_ward_code: process.env.GHN_FROM_WARD_ID || undefined,
            to_district_id: Number(to_district_id),
            to_ward_code: String(to_ward_code),
            weight: ship.shippingWeight || Number(process.env.GHN_DEFAULT_WEIGHT || 500),
            length: ship.shippingDimensions?.length || Number(process.env.GHN_DEFAULT_LENGTH || 20),
            width: ship.shippingDimensions?.width || Number(process.env.GHN_DEFAULT_WIDTH || 15),
            height: ship.shippingDimensions?.height || Number(process.env.GHN_DEFAULT_HEIGHT || 5),
            service_type_id: ship.shippingServiceId || Number(process.env.GHN_SERVICE_TYPE_ID || process.env.GHN_SERVICE_ID) || undefined,
            items: (order.items || []).map((i) => ({ name: i.name, quantity: i.quantity || 1, price: i.price || 0 })),
        };

        logger.info('GHN create payload', { orderId, payload });
        // call centralized service
        const res = await ghnService.createOrder(payload);

        // parse response robustly
        const code = res?.code;
        const data = res?.data || res;
        if (code === 200 && data) {
            const orderCode = data.order_code || data.order_code_new || data.ghn_order_code || data.order?.order_code || data.order_code_return || data.code;
            if (!orderCode) {
                logger.warn("GHN returned success but no order_code", { res });
                throw new Error("No order_code in GHN response");
            }

            // persist to order (both top-level and nested shipping field)
            const orderDoc = await Order.findById(orderId);
            if (orderDoc) {
                orderDoc.ghnOrderCode = orderCode;
                orderDoc.status = "READY_TO_PICK";
                orderDoc.shipping = orderDoc.shipping || {};
                orderDoc.shipping.ghnOrderCode = orderCode;

                // attempt to map fee if present in response
                const fee = data.total_fee || data.total || data.fee || (data.data && (data.data.total_fee || data.data.total || data.data.fee));
                if (fee) {
                    // Apply same business adjustments as other code paths
                    try {
                        const adj = calculateShippingFee({ total: orderDoc.totalPrice || 0 }, Number(fee), { returnBreakdown: true });
                        orderDoc.shipping.shippingFee = Number(adj.shippingFee || 0);
                        orderDoc.shipping.shippingFeeBreakdown = adj;
                    } catch (e) {
                        orderDoc.shipping.shippingFee = Number(fee) || orderDoc.shipping.shippingFee;
                    }
                }

                orderDoc.trackingHistory = orderDoc.trackingHistory || [];
                orderDoc.trackingHistory.push({ status: "ready_to_pick", desc: `Đơn hàng đã được tạo trên GHN. Mã: ${orderCode}`, time: new Date() });

                await orderDoc.save();
            } else {
                // fallback: update by id
                await Order.findByIdAndUpdate(orderId, {
                    ghnOrderCode: orderCode,
                    status: "READY_TO_PICK",
                    $push: {
                        trackingHistory: {
                            status: "ready_to_pick",
                            desc: `Đơn hàng đã được tạo trên GHN. Mã: ${orderCode}`,
                            time: new Date(),
                        },
                    },
                });
            }

            logger.info("Created GHN order", { orderId, orderCode });
            return { orderCode, raw: res };
        }

        logger.warn("GHN createOrder returned non-200", { res });
        throw new Error("GHN createOrder failed");
    } catch (err) {
        logger.error("createGHNOrder error", err.message || err);
        throw err;
    }
};

// 2. Lấy hành trình thực tế từ máy chủ GHN
exports.getGHNTracking = async (orderCode) => {
    try {
        const response = await ghnService.getOrderDetail(orderCode);
        return response?.code === 200 ? response.data : null;
    } catch (error) {
        return null;
    }
};

// 3. Ép GHN chuyển trạng thái tiếp theo (Leadtime)
exports.leadtimeGHNOrder = async (orderCode) => {
    // Note: This logic seems specific to dev sandbox testing
    try {
        const axios = require('axios');
        const response = await axios.post(
            "https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/leadtime",
            {
                order_code: String(orderCode),
                to_district_id: 1442,
                to_ward_code: "20101",
            },
            {
                headers: {
                    Token: process.env.GHN_TOKEN,
                    ShopId: Number(process.env.GHN_SHOP_ID),
                    "Content-Type": "application/json",
                },
            },
        );
        return response.data;
    } catch (error) {
        return error.response?.data;
    }
};

// 4. Hủy đơn trên GHN (dùng bởi admin khi muốn hủy đơn đã tạo trên GHN)
exports.cancelGHNOrder = async (orderId) => {
    try {
        const order = await Order.findById(orderId);
        if (!order) return null;
        const orderCode = order.shipping?.ghnOrderCode || order.ghnOrderCode;
        if (!orderCode) throw new Error('No GHN order code to cancel');

        let res = await ghnService.cancelOrder({ order_code: String(orderCode) });
        // If GHN returns not-found or non-200, try alternative payload (order_codes array)
        if (!res || (typeof res.code !== 'undefined' && res.code !== 200)) {
            logger.warn('GHN cancel returned non-200, trying fallback payload', { orderId, res });
            try {
                const fallback = await ghnService.cancelOrder({ order_codes: [String(orderCode)] });
                if (fallback && (typeof fallback.code === 'undefined' || fallback.code === 200)) {
                    res = fallback;
                    logger.info('GHN cancel fallback succeeded', { orderId, res });
                } else {
                    logger.warn('GHN cancel fallback also failed', { orderId, fallback });
                }
            } catch (fbErr) {
                logger.error('GHN cancel fallback error', fbErr.message || fbErr);
            }
        }

        // persist cancellation locally
        const orderDoc = await Order.findById(orderId);
        if (orderDoc) {
            orderDoc.status = 'CANCELLED';
            orderDoc.shipping = orderDoc.shipping || {};
            orderDoc.shipping.shippingStatus = 'CANCELLED';
            orderDoc.shipping.shippingEvents = orderDoc.shipping.shippingEvents || [];
            const ghNote = res ? `GHN response: ${JSON.stringify(res).slice(0,500)}` : 'No GHN response';
            orderDoc.shipping.shippingEvents.push({ time: new Date(), status: 'CANCELLED', note: `Canceled via admin. ${ghNote}` });
            orderDoc.trackingHistory = orderDoc.trackingHistory || [];
            orderDoc.trackingHistory.push({ status: 'cancelled', desc: `Đơn hàng đã bị hủy bởi shop. ${ghNote}`, time: new Date() });
            await orderDoc.save();
        }

        return res;
    } catch (err) {
        logger.error('cancelGHNOrder error', err.message || err);
        throw err;
    }
};
