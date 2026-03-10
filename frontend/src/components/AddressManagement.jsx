import React, { useEffect, useState } from "react";
import { API_URL as apiBase } from "../apiConfig";
import { MapPin, Edit3, Trash2, PlusCircle } from "lucide-react";
import toast from "react-hot-toast";

const emptyForm = {
    id: null,
    fullName: "",
    phone: "",
    street: "",
    ward: "",
    district: "",
    province: "",
    isDefault: false,
};

// align with Checkout which uses `VITE_API_BASE`; support older `VITE_API_URL` too

export default function AddressManagement({ user, selectable = false, onSelect = null }) {
    const [addresses, setAddresses] = useState([]);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(false);

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const normalize = (list) =>
        (list || []).map((a) => ({ ...a, id: a._id || a.id }));

    // location lists
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    const pickName = (item) => item?.ProvinceName || item?.province_name || item?.name || item?.DistrictName || item?.district_name || item?.WardName || item?.ward_name || item?.label || item?.title;

    // explicit id pickers to avoid returning the wrong id field for different entity types
    const pickProvinceId = (item) => item?.ProvinceID ?? item?.province_id ?? item?.ProvinceId ?? item?.ProvinceCode ?? item?.id ?? '';
    const pickDistrictId = (item) => item?.DistrictID ?? item?.district_id ?? item?.DistrictCode ?? item?.id ?? '';
    const pickWardCode = (item) => item?.WardCode ?? item?.ward_code ?? item?.code ?? item?.id ?? '';

    // remove duplicate items by their normalized id (some GHN responses can include duplicates)
    const uniqueById = (list, idFn = (x) => (x ? String(x) : '')) => {
        if (!Array.isArray(list)) return [];
        const seen = new Set();
        return list.filter((it) => {
            const id = String(idFn(it) ?? '');
            if (!id) return false;
            if (seen.has(id)) return false;
            seen.add(id);
            return true;
        });
    };

    const fetchProvinces = async () => {
        try {
            const res = await fetch(`${apiBase}/api/locations/provinces`);
            const contentType = res.headers.get('content-type') || '';
            if (!res.ok) {
                const txt = contentType.includes('application/json') ? (await res.json()).message : await res.text();
                console.error('Failed load provinces', txt);
                return;
            }
            if (contentType.includes('application/json')) {
                const data = await res.json();
                if (data.success) setProvinces(Array.isArray(data.provinces) ? data.provinces : []);
            }
        } catch (err) {
            console.error('fetchProvinces', err);
        }
    };

    const fetchDistricts = async (provinceId) => {
        if (!provinceId) return setDistricts([]);
        try {
            const res = await fetch(`${apiBase}/api/locations/districts?provinceId=${provinceId}`);
            const contentType = res.headers.get('content-type') || '';
            if (!res.ok) {
                const txt = contentType.includes('application/json') ? (await res.json()).message : await res.text();
                console.error('Failed load districts', txt);
                return;
            }
            if (contentType.includes('application/json')) {
                const data = await res.json();
                if (data.success) setDistricts(Array.isArray(data.districts) ? data.districts : []);
            }
        } catch (err) {
            console.error('fetchDistricts', err);
        }
    };

    const fetchWards = async (districtId) => {
        if (!districtId) return setWards([]);
        try {
            const res = await fetch(`${apiBase}/api/locations/wards?districtId=${districtId}`);
            const contentType = res.headers.get('content-type') || '';
            if (!res.ok) {
                const txt = contentType.includes('application/json') ? (await res.json()).message : await res.text();
                console.error('Failed load wards', txt);
                return;
            }
            if (contentType.includes('application/json')) {
                const data = await res.json();
                if (data.success) setWards(Array.isArray(data.wards) ? data.wards : []);
            }
        } catch (err) {
            console.error('fetchWards', err);
        }
    };

    const loadAddresses = async () => {
        if (token && user && user._id) {
            try {
                setLoading(true);
                const res = await fetch(`${apiBase}/api/addresses`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const contentType = res.headers.get("content-type") || "";
                if (!res.ok) {
                    if (res.status === 401) {
                        // invalid token
                        localStorage.removeItem('token');
                        toast.error('Phiên đã hết hạn, vui lòng đăng nhập lại');
                        return;
                    }
                    if (contentType.includes("application/json")) {
                        const err = await res.json();
                        toast.error(err.message || "Lỗi khi tải địa chỉ");
                    } else {
                        const text = await res.text();
                        console.error("Non-JSON response from addresses API:", text);
                        toast.error("Không thể kết nối đến API địa chỉ — kiểm tra cấu hình VITE_API_URL và server backend.");
                    }
                    return;
                }

                if (contentType.includes("application/json")) {
                    const data = await res.json();
                    if (data.success) {
                        setAddresses(normalize(data.addresses));
                    } else {
                        toast.error(data.message || "Không thể tải địa chỉ");
                    }
                } else {
                    const text = await res.text();
                    console.error("Unexpected non-JSON response (addresses):", text);
                    toast.error("API trả về nội dung không hợp lệ. Kiểm tra backend hoặc VITE_API_URL.");
                }
            } catch (err) {
                console.error(err);
                toast.error("Lỗi kết nối máy chủ");
            } finally {
                setLoading(false);
            }
        } else {
            // guest: keep empty
            setAddresses([]);
        }
    };

    useEffect(() => {
        loadAddresses();
        // also load provinces for selection
        fetchProvinces();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((s) => ({ ...s, [name]: value }));
    };

    const handleProvinceChange = (e) => {
        const val = e.target.value;
        const p = provinces.find((x) => String(pickProvinceId(x)) === String(val));
        setForm((s) => ({ ...s, province: pickName(p) || '', provinceId: pickProvinceId(p) || val, district: '', districtId: '', ward: '', wardCode: '' }));
        setDistricts([]); setWards([]);
        if (p) fetchDistricts(pickProvinceId(p));
    };

    const handleDistrictChange = (e) => {
        const val = e.target.value;
        const d = districts.find((x) => String(pickDistrictId(x)) === String(val));
        setForm((s) => ({ ...s, district: pickName(d) || '', districtId: pickDistrictId(d) || val, ward: '', wardCode: '' }));
        setWards([]);
        if (d) fetchWards(pickDistrictId(d));
    };

    const handleWardChange = (e) => {
        const val = e.target.value;
        const w = wards.find((x) => String(pickWardCode(x)) === String(val));
        setForm((s) => ({ ...s, ward: pickName(w) || '', wardCode: pickWardCode(w) || val }));
    };

    const handleAdd = () => {
        setForm(emptyForm);
        setEditing(true);
    };

    const handleEdit = (addr) => {
        // populate selects if ids available
        setForm(addr);
        setEditing(true);
        if (addr.provinceId) {
            fetchDistricts(addr.provinceId).then(() => {
                if (addr.districtId) fetchWards(addr.districtId);
            });
        }
    };

    const handleCancel = () => {
        setEditing(false);
        setForm(emptyForm);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.fullName || !form.phone || !form.street) {
            toast.error("Vui lòng điền đủ họ tên, số điện thoại và địa chỉ.");
            return;
        }

        if (!token || !user || !user._id) {
            toast.error("Vui lòng đăng nhập để lưu địa chỉ.");
            return;
        }

        try {
            setLoading(true);
            const body = {
                fullName: form.fullName,
                phone: form.phone,
                street: form.street,
                // include both names and ids/codes when available
                ward: form.ward,
                wardCode: form.wardCode || form.ward,
                district: form.district,
                districtId: form.districtId || null,
                province: form.province,
                provinceId: form.provinceId || null,
                isDefault: !!form.isDefault,
            };

            let res;
            if (form.id) {
                res = await fetch(`${apiBase}/api/addresses/${form.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                    body: JSON.stringify(body),
                });
            } else {
                res = await fetch(`${apiBase}/api/addresses`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                    body: JSON.stringify(body),
                });
            }

            const contentType = res.headers.get("content-type") || "";
            if (!res.ok) {
                if (res.status === 401) {
                    localStorage.removeItem('token');
                    toast.error('Phiên đã hết hạn, vui lòng đăng nhập lại');
                    return;
                }
                if (contentType.includes("application/json")) {
                    const err = await res.json();
                    toast.error(err.message || "Lưu địa chỉ thất bại");
                } else {
                    const text = await res.text();
                    console.error("Non-JSON response when saving address:", text);
                    toast.error("Không thể lưu địa chỉ — kiểm tra backend hoặc VITE_API_URL.");
                }
                return;
            }

            if (contentType.includes("application/json")) {
                const data = await res.json();
                if (data.success) {
                    setAddresses(normalize(data.addresses));
                    toast.success("Lưu địa chỉ thành công");
                    setEditing(false);
                    setForm(emptyForm);
                } else {
                    toast.error(data.message || "Không thể lưu địa chỉ");
                }
            } else {
                const text = await res.text();
                console.error("Unexpected non-JSON response when saving address:", text);
                toast.error("API trả về nội dung không hợp lệ khi lưu địa chỉ.");
            }
        } catch (err) {
            console.error(err);
            toast.error("Lỗi kết nối máy chủ");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xóa địa chỉ này?")) return;
        if (!token) {
            toast.error("Vui lòng đăng nhập để xóa địa chỉ.");
            return;
        }
        try {
            setLoading(true);
            const res = await fetch(`${apiBase}/api/addresses/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            const contentType = res.headers.get("content-type") || "";
            if (!res.ok) {
                if (res.status === 401) {
                    localStorage.removeItem('token');
                    toast.error('Phiên đã hết hạn, vui lòng đăng nhập lại');
                    return;
                }
                if (contentType.includes("application/json")) {
                    const err = await res.json();
                    toast.error(err.message || "Xóa địa chỉ thất bại");
                } else {
                    const text = await res.text();
                    console.error("Non-JSON response when deleting address:", text);
                    toast.error("Không thể xóa địa chỉ — kiểm tra backend hoặc VITE_API_URL.");
                }
                return;
            }

            if (contentType.includes("application/json")) {
                const data = await res.json();
                if (data.success) {
                    setAddresses(normalize(data.addresses));
                    toast.success("Xóa địa chỉ thành công");
                } else {
                    toast.error(data.message || "Không thể xóa địa chỉ");
                }
            } else {
                const text = await res.text();
                console.error("Unexpected non-JSON response when deleting address:", text);
                toast.error("API trả về nội dung không hợp lệ khi xóa địa chỉ.");
            }
        } catch (err) {
            console.error(err);
            toast.error("Lỗi kết nối máy chủ");
        } finally {
            setLoading(false);
        }
    };

    const handleSetDefault = async (id) => {
        if (!token) {
            toast.error("Vui lòng đăng nhập để đặt mặc định.");
            return;
        }
        try {
            setLoading(true);
            const res = await fetch(`${apiBase}/api/addresses/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ isDefault: true }),
            });
            const contentType = res.headers.get("content-type") || "";
            if (!res.ok) {
                if (res.status === 401) {
                    localStorage.removeItem('token');
                    toast.error('Phiên đã hết hạn, vui lòng đăng nhập lại');
                    return;
                }
                if (contentType.includes("application/json")) {
                    const err = await res.json();
                    toast.error(err.message || "Đặt mặc định thất bại");
                } else {
                    const text = await res.text();
                    console.error("Non-JSON response when setting default:", text);
                    toast.error("Không thể đặt mặc định — kiểm tra backend hoặc VITE_API_URL.");
                }
                return;
            }

            if (contentType.includes("application/json")) {
                const data = await res.json();
                if (data.success) {
                    setAddresses(normalize(data.addresses));
                    toast.success("Đã đặt địa chỉ mặc định");
                } else {
                    toast.error(data.message || "Không thể đặt mặc định");
                }
            } else {
                const text = await res.text();
                console.error("Unexpected non-JSON response when setting default:", text);
                toast.error("API trả về nội dung không hợp lệ khi đặt mặc định.");
            }
        } catch (err) {
            console.error(err);
            toast.error("Lỗi kết nối máy chủ");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 bg-white border border-gray-100 shadow-2xl animate-zoomIn rounded-3xl">
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-gray-200 border-dashed">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#fdfaf5] rounded-xl flex items-center justify-center text-[#800a0d] shadow-sm">
                        <MapPin size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-[#800a0d]">Quản lý địa chỉ</h2>
                        <p className="text-xs text-gray-500">Thêm, sửa, xóa và chọn địa chỉ mặc định cho đơn hàng.</p>
                    </div>
                </div>
                <div>
                    <button onClick={handleAdd} className="inline-flex items-center gap-2 bg-[#800a0d] text-white px-4 py-2 rounded-2xl font-bold">
                        <PlusCircle size={16} /> Thêm địa chỉ
                    </button>
                </div>
            </div>

            {editing && (
                <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-2xl bg-[#fdfaf5]">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-bold">Người nhận</label>
                            <input name="fullName" value={form.fullName} onChange={handleChange} className="w-full px-5 py-2 bg-[#fdfaf5] border border-gray-100 rounded-2xl outline-none focus:border-[#800a0d] focus:bg-white transition-all font-bold text-[#3e2714]" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold">Số điện thoại</label>
                            <input name="phone" value={form.phone} onChange={handleChange} className="w-full px-5 py-2 bg-[#fdfaf5] border border-gray-100 rounded-2xl outline-none focus:border-[#800a0d] focus:bg-white transition-all font-bold text-[#3e2714]" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold">Địa chỉ (số nhà, đường, khu phố)</label>
                            <input name="street" value={form.street} onChange={handleChange} className="w-full px-5 py-2 bg-[#fdfaf5] border border-gray-100 rounded-2xl outline-none focus:border-[#800a0d] focus:bg-white transition-all font-bold text-[#3e2714]" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold">Phường / Xã</label>
                            <select name="ward" value={form.wardCode || ''} onChange={handleWardChange} className="w-full px-4 py-2 rounded-2xl border bg-white">
                                <option value="">Chọn xã/phường</option>
                                {uniqueById(wards, pickWardCode).map((w) => (
                                    <option key={String(pickWardCode(w))} value={String(pickWardCode(w))}>{pickName(w)}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold">Quận / Huyện</label>
                            <select name="district" value={form.districtId || ''} onChange={handleDistrictChange} className="w-full px-4 py-2 rounded-2xl border bg-white">
                                <option value="">Chọn quận/huyện</option>
                                {uniqueById(districts, pickDistrictId).map((d) => (
                                    <option key={String(pickDistrictId(d))} value={String(pickDistrictId(d))}>{pickName(d)}</option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-2 flex items-center gap-3">
                            <label className="text-sm font-bold">Tỉnh / Thành</label>
                            <select name="province" value={form.provinceId || ''} onChange={handleProvinceChange} className="flex-1 px-4 py-2 rounded-2xl border bg-white">
                                <option value="">Chọn tỉnh/thành</option>
                                {uniqueById(provinces, pickProvinceId).map((p) => (
                                    <option key={String(pickProvinceId(p))} value={String(pickProvinceId(p))}>{pickName(p)}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-3 mt-4">
                        <button type="submit" className="bg-[#800a0d] cursor-pointer text-white px-8 py-3 rounded-[30px] font-black text-sm shadow-xl hover:opacity-95">Lưu</button>
                        <button type="button" onClick={handleCancel} className="px-6 py-3 rounded-2xl border">Hủy</button>
                        <label className="ml-auto flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm((s) => ({ ...s, isDefault: e.target.checked }))} />
                            Đặt làm mặc định
                        </label>
                    </div>
                </form>
            )}

            <div className="space-y-4">
                {loading && (
                    <div className="p-8 text-center text-gray-500">Đang tải địa chỉ...</div>
                )}

                {!loading && addresses.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        <div className="mb-3 font-bold text-[#3e2714]">Bạn chưa có địa chỉ nào</div>
                        <div className="text-sm text-gray-500">Thêm địa chỉ để sử dụng khi đặt hàng.</div>
                    </div>
                )}

                {addresses.map((a) => (
                    <div key={a.id} className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition-shadow flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#fdfaf5] rounded-full flex items-center justify-center text-[#800a0d]">
                                    <MapPin size={18} />
                                </div>
                                <div>
                                    <div className="font-bold">{a.fullName} {a.isDefault && (<span className="text-xs ml-2 px-2 py-1 rounded-full bg-[#fde0df] text-[#9d0b0f] font-bold">Mặc định</span>)}</div>
                                    <div className="text-sm text-gray-600">{a.phone}</div>
                                </div>
                            </div>
                            <div className="mt-3 text-sm text-[#3e2714]">
                                {a.street}{a.ward ? ", " + a.ward : ""}{a.district ? ", " + a.district : ""}{a.province ? ", " + a.province : ""}
                            </div>
                        </div>

                        <div className="flex-shrink-0 flex flex-wrap gap-2 md:flex-col md:items-end">
                            {selectable && (
                                <button onClick={() => onSelect && onSelect(a)} className="px-4 py-2 rounded-2xl border text-sm hover:bg-gray-50">Chọn</button>
                            )}
                            {!a.isDefault && (
                                <button onClick={() => handleSetDefault(a.id)} className="px-4 py-2 rounded-2xl border text-sm hover:bg-gray-50">Đặt mặc định</button>
                            )}
                            <button onClick={() => handleEdit(a)} className="px-4 py-2 rounded-2xl border flex items-center gap-2 text-sm hover:bg-gray-50"><Edit3 size={14} />Sửa</button>
                            <button onClick={() => handleDelete(a.id)} className="px-4 py-2 rounded-2xl border text-sm flex items-center gap-2 hover:bg-gray-50"><Trash2 size={14} />Xóa</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
