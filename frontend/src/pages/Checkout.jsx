import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { ChevronRight, CreditCard, Truck, Receipt, Tag } from "lucide-react";
import AddressManagement from "../components/AddressManagement";
import toast from "react-hot-toast";
import API_URL from "../config/apiConfig";

const Checkout = () => {
  const { cartItems, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const savedUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [formData, setFormData] = useState({
    fullName: savedUser.fullName || "",
    phone: savedUser.phone || "",
    email: savedUser.email || "",
    address: "",
    note: "",
    paymentMethod: "COD",
  });

  // Location/Shipping state
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [locationSelection, setLocationSelection] = useState({
    provinceId: "",
    districtId: "",
    wardCode: "",
  });
  const [shippingFee, setShippingFee] = useState(null);

  // saved addresses and modal
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(`${API_URL}/api/locations/provinces`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setProvinces(d.provinces || d.provinces || d);
      })
      .catch(() => {});
  }, []);

  // load saved addresses for logged in users (to show address management)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/addresses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const ct = res.headers.get("content-type") || "";
        if (!res.ok) return;
        if (ct.includes("application/json")) {
          const data = await res.json();
          if (data.success) {
            setSavedAddresses((data.addresses || []).map((a) => ({ ...a, id: a._id || a.id })));
            // pick default address as selected initially
            const def =
              (data.addresses || []).find((x) => x.isDefault) || (data.addresses || [])[0];
            if (def) {
              setSelectedAddress(def);
              // push district/ward into locationSelection so shipping can calculate
              setLocationSelection((s) => ({
                ...s,
                districtId: def.districtId || def.district_id || "",
                wardCode: def.wardCode || def.ward_code || "",
              }));
              setFormData((s) => ({
                ...s,
                fullName: def.fullName || s.fullName,
                phone: def.phone || s.phone,
                address:
                  (def.street || "") +
                  (def.ward ? ", " + def.ward : "") +
                  (def.district ? ", " + def.district : "") +
                  (def.province ? ", " + def.province : ""),
              }));
            }
          }
        }
      } catch (e) {}
    })();
  }, []);

  useEffect(() => {
    if (locationSelection.provinceId) {
      fetch(`${API_URL}/api/locations/districts?provinceId=${locationSelection.provinceId}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.success) setDistricts(d.districts || d);
        })
        .catch(() => {});
    }
  }, [locationSelection.provinceId]);

  useEffect(() => {
    if (locationSelection.districtId) {
      fetch(`${API_URL}/api/locations/wards?districtId=${locationSelection.districtId}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.success) setWards(d.wards || d);
        })
        .catch(() => {});
    }
  }, [locationSelection.districtId]);

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    if (name === "provinceId")
      setLocationSelection({ provinceId: value, districtId: "", wardCode: "" });
    else if (name === "districtId")
      setLocationSelection((s) => ({ ...s, districtId: value, wardCode: "" }));
    else setLocationSelection((s) => ({ ...s, [name]: value }));
  };

  const calculateShipping = async () => {
    const weight = cartItems.reduce((sum, it) => sum + (it.weight || 300) * (it.quantity || 1), 0);
    if (!locationSelection.districtId || !locationSelection.wardCode) return;
    try {
      const res = await fetch(`${API_URL}/api/shipping/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to_district_id: Number(locationSelection.districtId),
          to_ward_code: locationSelection.wardCode,
          weight,
        }),
      });
      const data = await res.json();
      if (data.success && data.result) {
        const raw = data.result.data || data.result;
        if (Array.isArray(raw) && raw.length)
          setShippingFee(raw[0].total || raw[0].shipping_fee || 0);
        else if (raw && raw.total) setShippingFee(raw.total);
      }
    } catch (e) {}
  };

  // Auto-calculate shipping when ward selection changes or cart changes
  useEffect(() => {
    if (locationSelection.wardCode) {
      calculateShipping();
    } else {
      setShippingFee(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationSelection.wardCode, cartItems]);

  // when user selects an address from modal, update state and trigger shipping calc
  const handleSelectAddress = (addr) => {
    setSelectedAddress(addr);
    setShowAddressModal(false);
    setFormData((s) => ({
      ...s,
      fullName: addr.fullName || s.fullName,
      phone: addr.phone || s.phone,
      address:
        (addr.street || "") +
        (addr.ward ? ", " + addr.ward : "") +
        (addr.district ? ", " + addr.district : "") +
        (addr.province ? ", " + addr.province : ""),
    }));
    setLocationSelection((s) => ({
      ...s,
      districtId: addr.districtId || addr.district_id || "",
      wardCode: addr.wardCode || addr.ward_code || "",
    }));
  };
  // 3. Xử lý thay đổi input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- LOGIC MÃ GIẢM GIÁ ---
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCode, setAppliedCode] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [availablePromos, setAvailablePromos] = useState([]);

  useEffect(() => {
    const fetchPromos = async () => {
      try {
        const res = await fetch(`${API_URL}/api/promotions/active-banner`);
        const data = await res.json();
        if (data.success) {
          setAvailablePromos(data.promos);
        }
      } catch (error) {
        console.error("Lỗi lấy danh sách khuyến mãi:", error);
      }
    };
    fetchPromos();
  }, []);

  const handleApplyPromo = async (codeOverride) => {
    const codeToApply = codeOverride || promoCode;
    if (!codeToApply.trim()) return;

    // Nếu mã đang click là mã đã áp dụng -> Huỷ bỏ
    if (appliedCode === codeToApply) {
      handleCancelPromo();
      return;
    }

    setIsApplying(true);
    try {
      const res = await fetch(`${API_URL}/api/promotions/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codeToApply, orderValue: totalPrice }),
      });
      const data = await res.json();
      if (data.success) {
        setDiscount(data.discountAmount);
        setAppliedCode(data.code);
        setPromoCode(data.code);
        toast.success(
          `Áp dụng mã thành công! Bạn được giảm ${data.discountAmount.toLocaleString()}đ`,
        );
      } else {
        toast.error(data.message || "Mã giảm giá không hợp lệ");
        setDiscount(0);
        setAppliedCode("");
      }
    } catch (e) {
      toast.error("Lỗi kết nối máy chủ khuyến mãi");
    } finally {
      setIsApplying(false);
    }
  };

  const handleCancelPromo = () => {
    setDiscount(0);
    setAppliedCode("");
    setPromoCode("");
    toast.success("Đã huỷ bỏ mã giảm giá");
  };

  // --- TỔNG TIỀN SAU GIẢM GIÁ ---
  // --- TỔNG TIỀN CUỐI CÙNG (Gồm ship, trừ giảm giá) ---
  const finalPrice = totalPrice + (shippingFee || 0) - discount;

  const handleOrder = async () => {
    // console.log("formData", formData);
    // require either a selectedAddress or filled address textarea
    if (!formData.fullName || !formData.phone || (!formData.address && !selectedAddress)) {
      toast.error("Vui lòng điền đầy đủ các thông tin có dấu (*)");
      return;
    }

    const orderData = {
      userId: savedUser.id || savedUser._id || null,
      customerInfo: {
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        address: selectedAddress
          ? (selectedAddress.street || "") +
            (selectedAddress.ward ? ", " + selectedAddress.ward : "") +
            (selectedAddress.district ? ", " + selectedAddress.district : "") +
            (selectedAddress.province ? ", " + selectedAddress.province : "")
          : formData.address,
        note: formData.note,
      },
      items: cartItems,
      totalPrice: totalPrice + (shippingFee || 0),
      discountAmount: discount,
      promoCode: appliedCode,
      paymentMethod: formData.paymentMethod,
      shippingInfo: {
        shippingFee: shippingFee || 0,
        province: selectedAddress
          ? selectedAddress.province || null
          : provinces.find(
              (p) => String(p.ProvinceID || p.province_id) === String(locationSelection.provinceId),
            ) || null,
        district: selectedAddress
          ? selectedAddress.district || null
          : districts.find(
              (d) => String(d.DistrictID || d.district_id) === String(locationSelection.districtId),
            ) || null,
        ward: selectedAddress
          ? selectedAddress.ward || null
          : wards.find(
              (w) => String(w.WardCode || w.code) === String(locationSelection.wardCode),
            ) || null,
        to_district_id: Number(locationSelection.districtId) || undefined,
        to_ward_code: locationSelection.wardCode || undefined,
        weight: cartItems.reduce((sum, it) => sum + (it.weight || 300) * (it.quantity || 1), 0),
      },
    };

    try {
      const res = await fetch(`${API_URL}/api/orders/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      const data = await res.json();

      if (data.success) {
        if (formData.paymentMethod === "VNPAY") {
          // GỌI API LẤY LINK VNPAY VỚI SỐ TIỀN ĐÃ GIẢM
          const resVnpay = await fetch(`${API_URL}/api/orders/vnpay-payment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              amount: finalPrice, // SỐ TIỀN ĐÃ BAO GỒM PHÍ VẬN CHUYỂN VÀ TRỪ GIẢM GIÁ
              orderId: data.orderId,
            }),
          });
          const vnpayData = await resVnpay.json();
          if (vnpayData.vnpUrl) {
            window.location.href = vnpayData.vnpUrl;
            return; // Dừng lại ở đây, không redirect về trang chủ
          }
        } else {
          // THANH TOÁN KHI NHẬN HÀNG (COD)
          toast.success("Đặt hàng thành công! Đơn hàng của bạn đang được xử lý.");
          if (clearCart) clearCart();

          // Chạy lưu địa chỉ ngầm (nếu có logic AddressManagement lồng vào)
          await (async () => {
            try {
              if (token && savedAddresses.length === 0 && !selectedAddress) {
                const provinceObj = provinces.find(
                  (p) =>
                    String(p.ProvinceID || p.province_id) === String(locationSelection.provinceId),
                );
                const districtObj = districts.find(
                  (d) =>
                    String(d.DistrictID || d.district_id) === String(locationSelection.districtId),
                );
                const wardObj = wards.find(
                  (w) => String(w.WardCode || w.code) === String(locationSelection.wardCode),
                );
                const body = {
                  fullName: formData.fullName,
                  phone: formData.phone,
                  street: formData.address,
                  ward: wardObj ? wardObj.WardName || wardObj.name : undefined,
                  wardCode: locationSelection.wardCode || undefined,
                  district: districtObj ? districtObj.DistrictName || districtObj.name : undefined,
                  districtId:
                    locationSelection.districtId ||
                    (districtObj ? districtObj.DistrictID || districtObj.district_id : null),
                  province: provinceObj ? provinceObj.ProvinceName || provinceObj.name : undefined,
                  provinceId:
                    locationSelection.provinceId ||
                    (provinceObj ? provinceObj.ProvinceID || provinceObj.province_id : null),
                  isDefault: true,
                };
                await fetch(`${API_URL}/api/addresses`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify(body),
                });
              }
            } catch (e) {
              console.error("Save address after order failed", e);
            }
          })();

          navigate("/");
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      } else {
        toast.error(data.message || "Đặt hàng thất bại");
      }
    } catch (error) {
      toast.error("Lỗi kết nối hệ thống đặt hàng!");
    }
  };

  return (
    <div className="bg-[#f7f4ef] min-h-screen pb-20 font-sans text-[#3e2714]">
      <div className="px-4 pt-4 mx-auto max-w-300">
        <div className="flex justify-center mb-12">
          <SectionHeading title="Thanh toán đơn hàng" />
        </div>

        <div className="flex flex-col gap-10 lg:flex-row">
          {/* CỘT TRÁI: THÔNG TIN GIAO HÀNG */}
          <div className="space-y-8 flex-2">
            <div className="relative p-8 overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl">
              <div className="flex items-center gap-2 mb-6 text-primary">
                <Truck size={24} />
                <h3 className="text-xl font-bold tracking-tight uppercase">Thông tin giao hàng</h3>
              </div>

              <div className="grid grid-cols-1 gap-5 text-sm md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="block mb-2 font-medium text-gray-500">
                    Họ và tên người nhận <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Nhập họ và tên"
                    className="w-full p-3 transition-all border border-gray-200 rounded-lg outline-none focus:border-secondary bg-gray-50/50"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-medium text-gray-500">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Nhập số điện thoại"
                    className="w-full p-3 transition-all border border-gray-200 rounded-lg outline-none focus:border-secondary bg-gray-50/50"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-medium text-gray-500">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    className="w-full p-3 transition-all border border-gray-200 rounded-lg outline-none focus:border-secondary bg-gray-50/50"
                  />
                </div>
                {savedAddresses.length > 0 ? (
                  <div className="md:col-span-2 p-4 border rounded-lg bg-[#fffefc]">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-gray-800">Địa chỉ giao hàng</div>
                        <div className="mt-2 text-sm text-gray-600">
                          {selectedAddress ? (
                            <>
                              <div className="font-bold">
                                {selectedAddress.fullName}{" "}
                                {selectedAddress.isDefault && (
                                  <span className="ml-2 text-xs px-2 py-1 rounded-full bg-[#fde0df] text-primary">
                                    Mặc định
                                  </span>
                                )}
                              </div>
                              <div className="text-xs">{selectedAddress.phone}</div>
                              <div className="mt-2 text-sm">
                                {(selectedAddress.street || "") +
                                  (selectedAddress.ward ? ", " + selectedAddress.ward : "") +
                                  (selectedAddress.district
                                    ? ", " + selectedAddress.district
                                    : "") +
                                  (selectedAddress.province ? ", " + selectedAddress.province : "")}
                              </div>
                            </>
                          ) : (
                            <div className="text-sm text-gray-600">Chưa chọn địa chỉ</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowAddressModal(true)}
                          className="px-4 py-2 border rounded-2xl hover:bg-gray-50"
                        >
                          Thay đổi
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="md:col-span-2">
                      <label className="block mb-2 font-medium text-gray-500">
                        Tỉnh/Thành <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="provinceId"
                        value={locationSelection.provinceId}
                        onChange={handleLocationChange}
                        className="w-full p-3 border border-gray-200 rounded-lg outline-none"
                      >
                        <option value="">Chọn tỉnh/thành</option>
                        {provinces.map((p) => (
                          <option
                            key={p.ProvinceID || p.province_id}
                            value={p.ProvinceID || p.province_id}
                          >
                            {p.ProvinceName || p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block mb-2 font-medium text-gray-500">
                        Quận/Huyện <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="districtId"
                        value={locationSelection.districtId}
                        onChange={handleLocationChange}
                        className="w-full p-3 border border-gray-200 rounded-lg outline-none"
                      >
                        <option value="">Chọn quận/huyện</option>
                        {districts.map((d) => (
                          <option
                            key={d.DistrictID || d.district_id}
                            value={d.DistrictID || d.district_id}
                          >
                            {d.DistrictName || d.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block mb-2 font-medium text-gray-500">
                        Xã/Phường <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="wardCode"
                        value={locationSelection.wardCode}
                        onChange={handleLocationChange}
                        className="w-full p-3 border border-gray-200 rounded-lg outline-none"
                      >
                        <option value="">Chọn xã/phường</option>
                        {wards.map((w) => (
                          <option key={w.WardCode || w.code} value={w.WardCode || w.code}>
                            {w.WardName || w.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block mb-2 font-medium text-gray-500">
                        Địa chỉ chi tiết <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Số nhà, tên đường, phường/xã..."
                        className="w-full h-24 p-3 transition-all border border-gray-200 rounded-lg outline-none focus:border-secondary bg-gray-50/50"
                      ></textarea>
                    </div>
                  </>
                )}

                <div className="md:col-span-2">
                  {shippingFee !== null && (
                    <div className="mt-2 text-sm">
                      Phí vận chuyển ước tính: <strong>{shippingFee.toLocaleString()}đ</strong>
                    </div>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-2 font-medium text-gray-500">Ghi chú đơn hàng</label>
                  <input
                    type="text"
                    name="note"
                    value={formData.note}
                    onChange={handleChange}
                    placeholder="Ví dụ: Giao giờ hành chính..."
                    className="w-full p-3 transition-all border border-gray-200 rounded-lg outline-none focus:border-secondary bg-gray-50/50"
                  />
                </div>
              </div>
            </div>

            {/* PHƯƠNG THỨC THANH TOÁN */}
            <div className="p-8 bg-white border border-gray-200 shadow-sm rounded-xl">
              <div className="flex items-center gap-2 mb-6 text-primary">
                <CreditCard size={24} />
                <h3 className="text-xl font-bold tracking-tight uppercase">
                  Phương thức thanh toán
                </h3>
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-4 p-4 transition-all border-2 border-gray-100 cursor-pointer rounded-xl hover:border-secondary has-checked:border-secondary has-checked:bg-orange-50/30">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={formData.paymentMethod === "COD"}
                    onChange={handleChange}
                    className="w-5 h-5 accent-primary"
                  />
                  <div>
                    <p className="font-bold text-gray-800">Thanh toán khi nhận hàng (COD)</p>
                    <p className="text-xs italic text-gray-500">
                      Quý khách thanh toán bằng tiền mặt cho bưu tá.
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-4 p-4 transition-all border-2 border-gray-100 cursor-pointer rounded-xl hover:border-secondary has-checked:border-secondary has-checked:bg-blue-50/30">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="VNPAY"
                    checked={formData.paymentMethod === "VNPAY"}
                    onChange={handleChange}
                    className="w-5 h-5 accent-primary"
                  />
                  <div className="flex items-center gap-3">
                    <img src="/vnpay.png" alt="VNPAY" className="object-contain w-12 h-6" />
                    <span className="font-bold text-gray-800">Thanh toán qua VNPAY-QR</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: TỔNG KẾT & MÃ GIẢM GIÁ */}
          <div className="flex-1">
            <div className="sticky p-8 overflow-hidden bg-white border shadow-lg rounded-xl border-secondary/30 top-28">
              <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.toptal.com/designers/subtlepatterns/uploads/paper.png')]"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-2 pb-4 mb-6 border-b border-gray-200 border-dashed text-primary">
                  <Receipt size={22} />
                  <h3 className="text-lg font-bold uppercase">Đơn hàng của bạn</h3>
                </div>

                <div className="max-h-62.5 overflow-y-auto pr-2 custom-scrollbar mb-6 space-y-4">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between pb-3 text-sm border-b border-gray-50"
                    >
                      <div className="flex-1 pr-4">
                        <p className="font-bold text-gray-800 line-clamp-2">{item.name}</p>
                        <p className="text-xs text-gray-400">SL: {item.quantity}</p>
                      </div>
                      <span className="font-bold text-primary">
                        {(item.price * item.quantity).toLocaleString()}đ
                      </span>
                    </div>
                  ))}
                </div>

                {/* --- NHẬP MÃ GIẢM GIÁ --- */}
                <div className="mb-6 p-4 bg-[#f7f4ef] rounded-2xl border border-dashed border-primary/30 shadow-inner">
                  <p className="text-[10px] font-black text-[#88694f] uppercase mb-2 flex items-center gap-1">
                    <Tag size={12} /> Mã khuyến mãi
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="NHẬP MÃ..."
                      className="flex-1 p-2 text-xs font-bold uppercase border border-gray-300 rounded-lg outline-none focus:border-primary"
                    />
                    <button
                      onClick={() => handleApplyPromo()}
                      disabled={isApplying}
                      className={`${appliedCode && promoCode === appliedCode ? "bg-stone-500" : "bg-primary"} text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase hover:bg-black transition-all disabled:bg-gray-400`}
                    >
                      {isApplying
                        ? "..."
                        : appliedCode && promoCode === appliedCode
                          ? "HUỶ BỎ"
                          : "ÁP DỤNG"}
                    </button>
                  </div>
                  {discount > 0 && (
                    <p className="text-[10px] text-green-600 font-bold mt-2 italic flex items-center gap-1 animate-pulse">
                      ✓ Đã giảm: -{discount.toLocaleString()}đ ({appliedCode})
                    </p>
                  )}

                  {/* DANH SÁCH MÃ GIẢM GIÁ KHẢ DỤNG */}
                  {availablePromos.length > 0 && (
                    <div className="pt-4 mt-4 border-t border-gray-200 border-dashed">
                      <p className="text-[9px] font-black text-[#88694f] uppercase mb-3 text-center">
                        Mã giảm giá dành cho bạn
                      </p>
                      <div className="space-y-2">
                        {availablePromos.map((promo) => (
                          <div
                            key={promo._id}
                            onClick={() => handleApplyPromo(promo.code)}
                            className={`p-3 rounded-xl border-2 transition-all cursor-pointer group flex items-center justify-between ${
                              appliedCode === promo.code
                                ? "border-primary bg-red-50"
                                : "border-white bg-white hover:border-secondary shadow-sm"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
                                <Tag size={16} />
                              </div>
                              <div>
                                <p className="text-[11px] font-black text-primary uppercase">
                                  {promo.code}
                                </p>
                                <p className="text-[9px] font-bold text-gray-500 line-clamp-1">
                                  {promo.description}
                                </p>
                              </div>
                            </div>
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApplyPromo(promo.code);
                              }}
                              className={`text-[9px] font-black px-3 py-1 rounded-full transition-all ${
                                appliedCode === promo.code
                                  ? "bg-primary text-white"
                                  : "bg-gray-100 text-[#88694f] group-hover:bg-secondary group-hover:text-white"
                              }`}
                            >
                              {appliedCode === promo.code ? "ĐÃ ÁP DỤNG" : "ÁP DỤNG"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* TỔNG TIỀN CHI TIẾT */}
                <div className="pb-6 space-y-3 text-sm border-b border-secondary/20">
                  <div className="flex justify-between italic text-gray-500">
                    <span>Tạm tính:</span>
                    <span className="font-bold text-gray-800">{totalPrice.toLocaleString()}đ</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between italic font-medium text-green-600">
                      <span>Giảm giá:</span>
                      <span>-{discount.toLocaleString()}đ</span>
                    </div>
                  )}
                  <div className="flex justify-between italic text-gray-500">
                    <span>Phí vận chuyển:</span>
                    <span className="text-[#00b14f] font-bold uppercase text-[10px]">Miễn phí</span>
                  </div>
                </div>

                <div className="flex justify-between py-6">
                  <span className="text-lg font-bold text-gray-800">TỔNG CỘNG:</span>
                  <span className="text-2xl font-black text-primary">
                    {finalPrice.toLocaleString()}đ
                  </span>
                </div>

                <button
                  onClick={handleOrder}
                  className="flex items-center justify-center w-full gap-2 py-4 text-lg font-bold text-white transition-all rounded-full shadow-lg bg-primary hover:bg-red-800 shadow-red-100 active:scale-95"
                >
                  XÁC NHẬN ĐẶT HÀNG
                </button>

                <p className="text-[10px] text-gray-400 mt-6 text-center leading-relaxed">
                  Bằng cách nhấn đặt hàng, bạn đồng ý với{" "}
                  <span className="font-bold underline cursor-pointer text-primary">
                    Điều khoản dịch vụ
                  </span>
                </p>
                <div className="flex justify-center mt-4">
                  <Link to="/cart" className="text-[#88694f] text-xs font-bold hover:underline">
                    ← Quay về giỏ hàng
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Address management modal */}
        {showAddressModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-3xl p-6">
              <div className="relative bg-white shadow-lg rounded-2xl">
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="font-bold">Địa chỉ của tôi</h3>
                  <button onClick={() => setShowAddressModal(false)} className="px-3 py-1">
                    ✕
                  </button>
                </div>
                <div className="p-6">
                  <AddressManagement
                    user={savedUser}
                    selectable={true}
                    onSelect={handleSelectAddress}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SectionHeading = ({ title }) => (
  <div className="relative flex items-center justify-center z-1">
    <div className="absolute h-px top-1/2 -left-25 -right-25 bg-primary z-1"></div>
    <div className="border-primary relative z-2 flex w-fit items-center border-t border-b p-px bg-[#f7f4ef]">
      <img
        alt=""
        src="https://honglam.vn/_next/static/media/btn47-bg-left-hover-solid.5a0f365f.png"
        className="absolute -top-px -left-3 h-[calc(100%+2px)] w-3.5 object-contain"
      />
      <div className="bg-primary px-10 py-2 min-w-62.5 md:min-w-87.5">
        <h3 className="text-xl font-bold tracking-wider text-center text-white uppercase md:text-2xl">
          {title}
        </h3>
      </div>
      <img
        alt=""
        src="https://honglam.vn/_next/static/media/btn47-bg-right-hover-solid.81fa6bf3.png"
        className="absolute -top-px -right-3 h-[calc(100%+2px)] w-3.5 object-contain"
      />
    </div>
  </div>
);

export default Checkout;
