import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { ChevronRight, CreditCard, Truck, Receipt } from "lucide-react";
import AddressManagement from "../components/AddressManagement";
import toast from "react-hot-toast";

const Checkout = () => {
  const { cartItems, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  // 1. Lấy thông tin user từ localStorage nếu đã đăng nhập
  const savedUser = JSON.parse(localStorage.getItem("user") || "{}");

  // 2. State quản lý Form
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
  const [locationSelection, setLocationSelection] = useState({ provinceId: '', districtId: '', wardCode: '' });
  const [shippingFee, setShippingFee] = useState(null);

  // saved addresses and modal
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const token = localStorage.getItem('token');

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5175';
  useEffect(() => {
    fetch('/api/locations/provinces').then(r => r.json()).then(d => { if (d.success) setProvinces(d.provinces || d.provinces || d); }).catch(() => { });
  }, []);

  // load saved addresses for logged in users (to show address management)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/addresses`, { headers: { Authorization: `Bearer ${token}` } });
        const ct = res.headers.get('content-type') || '';
        if (!res.ok) return;
        if (ct.includes('application/json')) {
          const data = await res.json();
          if (data.success) {
            setSavedAddresses((data.addresses || []).map(a => ({ ...a, id: a._id || a.id })));
            // pick default address as selected initially
            const def = (data.addresses || []).find(x => x.isDefault) || (data.addresses || [])[0];
            if (def) {
              setSelectedAddress(def);
              // push district/ward into locationSelection so shipping can calculate
              setLocationSelection((s) => ({ ...s, districtId: def.districtId || def.district_id || '', wardCode: def.wardCode || def.ward_code || '' }));
              setFormData((s) => ({ ...s, fullName: def.fullName || s.fullName, phone: def.phone || s.phone, address: (def.street || '') + (def.ward ? ", " + def.ward : "") + (def.district ? ", " + def.district : "") + (def.province ? ", " + def.province : "") }));
            }
          }
        }
      } catch (e) { }
    })();
  }, []);

  useEffect(() => {
    if (locationSelection.provinceId) {
      fetch(`/api/locations/districts?provinceId=${locationSelection.provinceId}`).then(r => r.json()).then(d => { if (d.success) setDistricts(d.districts || d); }).catch(() => { });
    }
  }, [locationSelection.provinceId]);

  useEffect(() => {
    if (locationSelection.districtId) {
      fetch(`/api/locations/wards?districtId=${locationSelection.districtId}`).then(r => r.json()).then(d => { if (d.success) setWards(d.wards || d); }).catch(() => { });
    }
  }, [locationSelection.districtId]);

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    if (name === 'provinceId') setLocationSelection({ provinceId: value, districtId: '', wardCode: '' });
    else if (name === 'districtId') setLocationSelection((s) => ({ ...s, districtId: value, wardCode: '' }));
    else setLocationSelection((s) => ({ ...s, [name]: value }));
  };

  const calculateShipping = async () => {
    const weight = cartItems.reduce((sum, it) => sum + ((it.weight || 300) * (it.quantity || 1)), 0);
    if (!locationSelection.districtId || !locationSelection.wardCode) return;
    try {
      const res = await fetch('/api/shipping/calculate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to_district_id: Number(locationSelection.districtId), to_ward_code: locationSelection.wardCode, weight }) });
      const data = await res.json();
      if (data.success && data.result) {
        const raw = data.result.data || data.result;
        if (Array.isArray(raw) && raw.length) setShippingFee(raw[0].total || raw[0].shipping_fee || 0);
        else if (raw && raw.total) setShippingFee(raw.total);
      }
    } catch (e) { }
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
    setFormData((s) => ({ ...s, fullName: addr.fullName || s.fullName, phone: addr.phone || s.phone, address: (addr.street || '') + (addr.ward ? ", " + addr.ward : "") + (addr.district ? ", " + addr.district : "") + (addr.province ? ", " + addr.province : "") }));
    setLocationSelection((s) => ({ ...s, districtId: addr.districtId || addr.district_id || '', wardCode: addr.wardCode || addr.ward_code || '' }));
  };
  // 3. Xử lý thay đổi input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 4. Hàm xử lý đặt hàng
  const handleOrder = async () => {
    // Kiểm tra dữ liệu
    // require either a selectedAddress or filled address textarea
    if (!formData.fullName || !formData.phone || (!formData.address && !selectedAddress)) {
      toast.error("Vui lòng điền đầy đủ các thông tin có dấu (*)");
      return;
    }

    if (cartItems.length === 0) {
      alert("Giỏ hàng trống, không thể đặt hàng!");
      return;
    }

    // Chuẩn bị dữ liệu gửi lên Backend
    const orderData = {
      userId: savedUser.id || savedUser._id || null,
      customerInfo: {
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        address: selectedAddress ? ((selectedAddress.street || '') + (selectedAddress.ward ? ", " + selectedAddress.ward : "") + (selectedAddress.district ? ", " + selectedAddress.district : "") + (selectedAddress.province ? ", " + selectedAddress.province : "")) : formData.address,
        note: formData.note,
      },
      items: cartItems,
      // send grand total (subtotal + shipping) so backend has the final amount
      totalPrice: totalPrice + (shippingFee || 0),
      paymentMethod: formData.paymentMethod,
      shippingInfo: {
        // include shippingFee so backend can trust frontend-calculated fee when available
        shippingFee: shippingFee || 0,
        province: selectedAddress ? (selectedAddress.province || null) : (provinces.find(p => String(p.ProvinceID || p.province_id) === String(locationSelection.provinceId)) || null),
        district: selectedAddress ? (selectedAddress.district || null) : (districts.find(d => String(d.DistrictID || d.district_id) === String(locationSelection.districtId)) || null),
        ward: selectedAddress ? (selectedAddress.ward || null) : (wards.find(w => String(w.WardCode || w.code) === String(locationSelection.wardCode)) || null),
        to_district_id: Number(locationSelection.districtId) || undefined,
        to_ward_code: locationSelection.wardCode || undefined,
        weight: cartItems.reduce((sum, it) => sum + ((it.weight || 300) * (it.quantity || 1)), 0),
      }
    };

    try {
      const response = await fetch("http://localhost:5175/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (data.success) {
        alert("Đặt hàng thành công! Cảm ơn bạn đã ủng hộ Hồng Lam.");
        if (clearCart) clearCart(); // Xóa giỏ hàng nếu có hàm clear
        // If user is logged in and had no saved addresses, save this address in background
        (async () => {
          try {
            if (token && (savedAddresses.length === 0) && !selectedAddress) {
              // build address body similar to AddressManagement
              const provinceObj = provinces.find(p => String(p.ProvinceID || p.province_id) === String(locationSelection.provinceId));
              const districtObj = districts.find(d => String(d.DistrictID || d.district_id) === String(locationSelection.districtId));
              const wardObj = wards.find(w => String(w.WardCode || w.code) === String(locationSelection.wardCode));
              const body = {
                fullName: formData.fullName,
                phone: formData.phone,
                street: formData.address,
                ward: wardObj ? (wardObj.WardName || wardObj.name) : undefined,
                wardCode: locationSelection.wardCode || undefined,
                district: districtObj ? (districtObj.DistrictName || districtObj.name) : undefined,
                districtId: locationSelection.districtId || (districtObj ? (districtObj.DistrictID || districtObj.district_id) : null),
                province: provinceObj ? (provinceObj.ProvinceName || provinceObj.name) : undefined,
                provinceId: locationSelection.provinceId || (provinceObj ? (provinceObj.ProvinceID || provinceObj.province_id) : null),
                isDefault: true,
              };
              await fetch(`${API_BASE}/api/addresses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(body),
              });
            }
          } catch (e) {
            console.error('Save address after order failed', e);
          }
        })();

        navigate("/");
        window.location.reload(); // Reload để reset giỏ hàng hoàn toàn
      } else {
        alert("Có lỗi: " + data.message);
      }
    } catch (error) {
      alert("Lỗi kết nối đến Server!");
    }
  };

  return (
    <div className="bg-[#f7f4ef] min-h-screen pb-20 font-sans text-[#3e2714]">
      <div className="mx-auto max-w-[1200px] px-4 pt-4">
        <div className="flex justify-center mb-12">
          <SectionHeading title="Thanh toán đơn hàng" />
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          <div className="flex-[2] space-y-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 relative overflow-hidden">
              <div className="flex items-center gap-2 mb-6 text-[#9d0b0f]">
                <Truck size={24} />
                <h3 className="text-xl font-bold uppercase tracking-tight">
                  Thông tin giao hàng
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
                <div className="md:col-span-2">
                  <label className="block text-gray-500 mb-2 font-medium">
                    Họ và tên người nhận <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Nhập họ và tên"
                    className="w-full border border-gray-200 p-3 rounded-lg outline-none focus:border-[#faa519] transition-all bg-gray-50/50"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 mb-2 font-medium">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Nhập số điện thoại"
                    className="w-full border border-gray-200 p-3 rounded-lg outline-none focus:border-[#faa519] transition-all bg-gray-50/50"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 mb-2 font-medium">
                    Email (Để nhận thông tin đơn hàng)
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    className="w-full border border-gray-200 p-3 rounded-lg outline-none focus:border-[#faa519] transition-all bg-gray-50/50"
                  />
                </div>
                {savedAddresses.length > 0 ? (
                  <div className="md:col-span-2 p-4 border rounded-lg bg-[#fffefc]">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-gray-800">Địa chỉ giao hàng</div>
                        <div className="text-sm text-gray-600 mt-2">
                          {selectedAddress ? (
                            <>
                              <div className="font-bold">{selectedAddress.fullName} {selectedAddress.isDefault && (<span className="ml-2 text-xs px-2 py-1 rounded-full bg-[#fde0df] text-[#9d0b0f]">Mặc định</span>)}</div>
                              <div className="text-xs">{selectedAddress.phone}</div>
                              <div className="mt-2 text-sm">{(selectedAddress.street || '') + (selectedAddress.ward ? ', ' + selectedAddress.ward : '') + (selectedAddress.district ? ', ' + selectedAddress.district : '') + (selectedAddress.province ? ', ' + selectedAddress.province : '')}</div>
                            </>
                          ) : (
                            <div className="text-sm text-gray-600">Chưa chọn địa chỉ</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setShowAddressModal(true)} className="px-4 py-2 rounded-2xl border hover:bg-gray-50">Thay đổi</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="md:col-span-2">
                      <label className="block text-gray-500 mb-2 font-medium">
                        Tỉnh/Thành <span className="text-red-500">*</span>
                      </label>
                      <select name="provinceId" value={locationSelection.provinceId} onChange={handleLocationChange} className="w-full border border-gray-200 p-3 rounded-lg outline-none">
                        <option value="">Chọn tỉnh/thành</option>
                        {provinces.map(p => <option key={p.ProvinceID || p.province_id} value={p.ProvinceID || p.province_id}>{p.ProvinceName || p.name}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-500 mb-2 font-medium">Quận/Huyện <span className="text-red-500">*</span></label>
                      <select name="districtId" value={locationSelection.districtId} onChange={handleLocationChange} className="w-full border border-gray-200 p-3 rounded-lg outline-none">
                        <option value="">Chọn quận/huyện</option>
                        {districts.map(d => <option key={d.DistrictID || d.district_id} value={d.DistrictID || d.district_id}>{d.DistrictName || d.name}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-500 mb-2 font-medium">Xã/Phường <span className="text-red-500">*</span></label>
                      <select name="wardCode" value={locationSelection.wardCode} onChange={handleLocationChange} className="w-full border border-gray-200 p-3 rounded-lg outline-none">
                        <option value="">Chọn xã/phường</option>
                        {wards.map(w => <option key={w.WardCode || w.code} value={w.WardCode || w.code}>{w.WardName || w.name}</option>)}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-gray-500 mb-2 font-medium">Địa chỉ chi tiết <span className="text-red-500">*</span></label>
                      <textarea name="address" value={formData.address} onChange={handleChange} placeholder="Số nhà, tên đường, phường/xã..." className="w-full border border-gray-200 p-3 rounded-lg h-24 outline-none focus:border-[#faa519] transition-all bg-gray-50/50"></textarea>
                    </div>
                  </>
                )}

                <div className="md:col-span-2">
                  <button type="button" onClick={calculateShipping} className="px-4 py-2 bg-[#9d0b0f] text-white rounded">Tính phí vận chuyển</button>
                  {shippingFee !== null && <div className="mt-2 text-sm">Phí vận chuyển ước tính: <strong>{shippingFee.toLocaleString()}đ</strong></div>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-500 mb-2 font-medium">
                    Ghi chú đơn hàng
                  </label>
                  <input
                    type="text"
                    name="note"
                    value={formData.note}
                    onChange={handleChange}
                    placeholder="Ví dụ: Giao giờ hành chính..."
                    className="w-full border border-gray-200 p-3 rounded-lg outline-none focus:border-[#faa519] transition-all bg-gray-50/50"
                  />
                </div>
              </div>
            </div>

            {/* Khối Phương thức thanh toán */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-6 text-[#9d0b0f]">
                <CreditCard size={24} />
                <h3 className="text-xl font-bold uppercase tracking-tight">
                  Phương thức thanh toán
                </h3>
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-4 p-4 border-2 border-gray-100 rounded-xl cursor-pointer hover:border-[#faa519] has-[:checked]:border-[#faa519] has-[:checked]:bg-orange-50/30 transition-all">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={formData.paymentMethod === "COD"}
                    onChange={handleChange}
                    className="w-5 h-5 accent-[#9d0b0f]"
                  />
                  <div>
                    <p className="font-bold text-gray-800">
                      Thanh toán khi nhận hàng (COD)
                    </p>
                    <p className="text-xs text-gray-500 italic">
                      Quý khách thanh toán bằng tiền mặt cho nhân viên giao
                      hàng.
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-4 p-4 border-2 border-gray-100 rounded-xl cursor-pointer hover:border-[#faa519] has-[:checked]:border-[#faa519] has-[:checked]:bg-orange-50/30 transition-all">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Bank Transfer"
                    checked={formData.paymentMethod === "Bank Transfer"}
                    onChange={handleChange}
                    className="w-5 h-5 accent-[#9d0b0f]"
                  />
                  <div>
                    <p className="font-bold text-gray-800">
                      Chuyển khoản ngân hàng
                    </p>
                    <p className="text-xs text-gray-500 italic">
                      Thực hiện chuyển khoản vào số tài khoản của Hồng Lam.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: TỔNG KẾT ĐƠN HÀNG (DỮ LIỆU THẬT) */}
          <div className="flex-1">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-[#faa519]/30 sticky top-28 overflow-hidden">
              {/* Trang trí vân giấy ở nền */}
              <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.toptal.com/designers/subtlepatterns/uploads/paper.png')]"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6 text-[#9d0b0f] border-b border-dashed border-gray-200 pb-4">
                  <Receipt size={22} />
                  <h3 className="text-lg font-bold uppercase">
                    Đơn hàng của bạn
                  </h3>
                </div>

                {/* Danh sách sản phẩm từ CartContext */}
                <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar mb-6 space-y-4">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-start text-sm border-b border-gray-50 pb-3"
                    >
                      <div className="flex-1 pr-4">
                        <p className="font-bold text-gray-800 line-clamp-2">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          Số lượng: {item.quantity}
                        </p>
                      </div>
                      <span className="font-bold text-[#9d0b0f]">
                        {(item.price * item.quantity).toLocaleString()}đ
                      </span>
                    </div>
                  ))}
                </div>

                {/* Tính toán tiền */}
                <div className="space-y-3 text-sm pb-6 border-b border-[#faa519]/20">
                  <div className="flex justify-between text-gray-500 italic">
                    <span>Tạm tính:</span>
                    <span className="font-bold text-gray-800">
                      {totalPrice.toLocaleString()}đ
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-500 italic">
                    <span>Phí vận chuyển:</span>
                    <span className="text-[#00b14f] font-bold uppercase text-[10px]">
                      Miễn phí
                    </span>
                  </div>
                </div>

                <div className="flex justify-between py-6">
                  <span className="font-bold text-lg text-gray-800">
                    TỔNG CỘNG:
                  </span>
                  <span className="font-black text-2xl text-[#9d0b0f]">
                    {totalPrice.toLocaleString()}đ
                  </span>
                </div>

                <button
                  onClick={handleOrder}
                  className="w-full bg-[#9d0b0f] text-white py-4 rounded-full font-bold text-lg hover:bg-red-800 shadow-lg shadow-red-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  XÁC NHẬN ĐẶT HÀNG
                </button>

                <p className="text-[10px] text-gray-400 mt-6 text-center leading-relaxed">
                  Bằng cách nhấn đặt hàng, bạn đồng ý với{" "}
                  <span className="text-primary font-bold cursor-pointer underline">
                    Điều khoản dịch vụ
                  </span>{" "}
                  của chúng tôi
                </p>
                <div className="mt-4 flex justify-center">
                  <Link
                    to="/cart"
                    className="text-[#88694f] text-xs font-bold hover:underline"
                  >
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
              <div className="relative bg-white rounded-2xl shadow-lg">
                <div className="p-4 border-b flex items-center justify-between">
                  <h3 className="font-bold">Địa chỉ của tôi</h3>
                  <button onClick={() => setShowAddressModal(false)} className="px-3 py-1">✕</button>
                </div>
                <div className="p-6">
                  <AddressManagement user={savedUser} selectable={true} onSelect={handleSelectAddress} />
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
  <div className="relative z-[1] flex justify-center items-center">
    <div className="absolute top-1/2 left-[-100px] right-[-100px] h-[1px] bg-[#9d0b0f] z-[1]"></div>
    <div className="border-[#9d0b0f] relative z-[2] flex w-fit items-center border-t border-b p-[1px] bg-[#f7f4ef]">
      <img
        alt=""
        src="https://honglam.vn/_next/static/media/btn47-bg-left-hover-solid.5a0f365f.png"
        className="absolute -top-[1px] -left-[12px] h-[calc(100%+2px)] w-[14px] object-contain"
      />
      <div className="bg-[#9d0b0f] px-10 py-2 min-w-[250px] md:min-w-[350px]">
        <h3 className="text-xl md:text-2xl font-bold text-white uppercase tracking-wider text-center">
          {title}
        </h3>
      </div>
      <img
        alt=""
        src="https://honglam.vn/_next/static/media/btn47-bg-right-hover-solid.81fa6bf3.png"
        className="absolute -top-[1px] -right-[12px] h-[calc(100%+2px)] w-[14px] object-contain"
      />
    </div>
  </div>
);

export default Checkout;
