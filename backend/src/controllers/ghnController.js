const axios = require("axios");
const Order = require("../models/Order");

// 1. Tạo đơn hàng thật trên hệ thống GHN Sandbox
exports.createGHNOrder = async (orderId) => {
    try {
        const order = await Order.findById(orderId);
        if (!order) return;

        const ghnData = {
            payment_type_id: 2,
            note: "Hàng quà tặng Hồng ClickGo",
            required_note: "CHOXEMHANGKHONGTHU",
            to_name: order.customerInfo.fullName,
            to_phone: order.customerInfo.phone,
            to_address: order.customerInfo.address,

            // ĐỊA CHỈ GỬI: PHAN CHU TRINH, HOÀN KIẾM, HÀ NỘI
            from_district_id: 1442,
            from_ward_code: "20101",

            // ĐỊA CHỈ NHẬN: Cố định cùng Hoàn Kiếm - HN để đơn nhảy nhanh nhất
            to_district_id: 1442,
            to_ward_code: "20101",

            weight: 500,
            length: 10,
            width: 10,
            height: 10,
            service_type_id: 2,
            items: order.items.map((i) => ({
                name: i.name,
                quantity: i.quantity,
                price: i.price,
            })),
        };

        const response = await axios.post(process.env.GHN_API_URL, ghnData, {
            headers: {
                Token: process.env.GHN_TOKEN,
                ShopId: Number(process.env.GHN_SHOP_ID),
                "Content-Type": "application/json",
            },
        });

        if (response.data.code === 200) {
            const ghnRealCode = response.data.data.order_code;
            await Order.findByIdAndUpdate(orderId, {
                ghnOrderCode: ghnRealCode,
                status: "READY_TO_PICK",
                $push: {
                    trackingHistory: {
                        status: "ready_to_pick",
                        desc: `Đơn hàng đã được tạo tại kho Hà Nội. Mã: ${ghnRealCode}`,
                        time: new Date(),
                    },
                },
            });
            console.log("✅ Đã tạo đơn kho Hà Nội:", ghnRealCode);
        }
    } catch (error) {
        console.error("❌ LỖI TẠO ĐƠN:", error.response?.data || error.message);
    }
};

// 2. Lấy hành trình thực tế từ máy chủ GHN
exports.getGHNTracking = async (orderCode) => {
    try {
        const response = await axios.post(
            "https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/detail",
            { order_code: String(orderCode) },
            {
                headers: {
                    Token: process.env.GHN_TOKEN,
                    "Content-Type": "application/json",
                },
            },
        );
        return response.data.code === 200 ? response.data.data : null;
    } catch (error) {
        return null;
    }
};

// 3. Ép GHN chuyển trạng thái tiếp theo (Leadtime)
exports.leadtimeGHNOrder = async (orderCode) => {
    try {
        const response = await axios.post(
            "https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/leadtime",
            {
                order_code: String(orderCode),
                // PHẢI KHỚP VỚI to_district_id 1442 lúc createGHNOrder
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
