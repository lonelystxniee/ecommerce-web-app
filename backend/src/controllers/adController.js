const Ad = require("../models/Ad");

exports.getAllAds = async (req, res) => {
  try {
    const ads = await Ad.find().sort({ position: 1 });
    res.status(200).json({ success: true, ads });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createAd = async (req, res) => {
  try {
    const newAd = new Ad(req.body);
    await newAd.save();
    res
      .status(201)
      .json({ success: true, message: "Thêm quảng cáo thành công!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateAd = async (req, res) => {
  try {
    const updatedAd = await Ad.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedAd)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy" });
    res.status(200).json({ success: true, message: "Cập nhật thành công!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteAd = async (req, res) => {
  try {
    await Ad.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Đã xóa quảng cáo" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
