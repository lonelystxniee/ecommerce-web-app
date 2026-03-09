const User = require("../models/User");

// GET /api/addresses - get current user's addresses
const getAddresses = async (req, res) => {
  try {
    const user = req.user;
    return res.json({ success: true, addresses: user.addresses || [] });
  } catch (error) {
    console.error("getAddresses error:", error.message);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};

// POST /api/addresses - add new address
const addAddress = async (req, res) => {
  try {
    const user = req.user;
    const { fullName, phone, street, ward, district, province, provinceId, districtId, wardCode, isDefault } = req.body;
    if (!fullName || !phone || !street) {
      return res.status(400).json({ success: false, message: "Thiếu thông tin địa chỉ" });
    }

    if (isDefault) {
      // unset other defaults
      user.addresses.forEach((a) => (a.isDefault = false));
    }

    user.addresses.unshift({
      fullName,
      phone,
      street,
      ward,
      district,
      province,
      provinceId: provinceId || null,
      districtId: districtId || null,
      wardCode: wardCode || null,
      isDefault: !!isDefault,
    });
    await user.save();
    return res.json({ success: true, addresses: user.addresses });
  } catch (error) {
    console.error("addAddress error:", error.message);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};

// PUT /api/addresses/:addressId - update address
const updateAddress = async (req, res) => {
  try {
    const user = req.user;
    const { addressId } = req.params;
    const { fullName, phone, street, ward, district, province, provinceId, districtId, wardCode, isDefault } = req.body;

    const addr = user.addresses.id(addressId);
    if (!addr) return res.status(404).json({ success: false, message: "Địa chỉ không tồn tại" });

    if (isDefault) {
      user.addresses.forEach((a) => (a.isDefault = false));
    }

    addr.fullName = fullName || addr.fullName;
    addr.phone = phone || addr.phone;
    addr.street = street || addr.street;
    addr.ward = ward || addr.ward;
    addr.district = district || addr.district;
    addr.province = province || addr.province;
    addr.provinceId = provinceId || addr.provinceId;
    addr.districtId = districtId || addr.districtId;
    addr.wardCode = wardCode || addr.wardCode;
    addr.isDefault = !!isDefault;

    await user.save();
    return res.json({ success: true, addresses: user.addresses });
  } catch (error) {
    console.error("updateAddress error:", error.message);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};

// DELETE /api/addresses/:addressId - delete
const deleteAddress = async (req, res) => {
  try {
    const user = req.user;
    const { addressId } = req.params;
    const addr = user.addresses.id(addressId);
    if (!addr) return res.status(404).json({ success: false, message: "Địa chỉ không tồn tại" });

    const wasDefault = addr.isDefault;
    addr.remove();

    if (wasDefault && user.addresses.length > 0) {
      // set first as default
      user.addresses[0].isDefault = true;
    }

    await user.save();
    return res.json({ success: true, addresses: user.addresses });
  } catch (error) {
    console.error("deleteAddress error:", error.message);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};

module.exports = { getAddresses, addAddress, updateAddress, deleteAddress };
