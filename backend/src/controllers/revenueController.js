const Order = require("../models/Order");
const AdRevenue = require("../models/AdRevenue");

exports.getRevenueReport = async (req, res) => {
  try {
    const { range } = req.query;
    let startDate = new Date();
    let daysToChart = 7; // Mặc định hiển thị 7 cột trên đồ thị

    // 1. Xác định khoảng thời gian lọc dữ liệu
    if (range === "today") {
      startDate.setHours(0, 0, 0, 0);
      daysToChart = 1;
    } else if (range === "this_week") {
      startDate.setDate(startDate.getDate() - 7);
      daysToChart = 7;
    } else {
      startDate.setMonth(startDate.getMonth() - 1);
      daysToChart = 30;
    }

    const allOrders = await Order.find({ createdAt: { $gte: startDate } });
    const adRevenues = await AdRevenue.find({ date: { $gte: startDate } });

    // 3. Lọc đơn hàng thành công để tính doanh thu thực tế
    const successfulOrders = allOrders.filter((o) =>
      ["COMPLETED", "DELIVERED", "SUCCESS"].includes(o.status?.toUpperCase()),
    );

    // TÍNH RIÊNG TIỀN HOÀN (Để trừ đi doanh thu tổng)
    const returnedOrders = allOrders.filter((o) => o.status === "RETURNED");
    const totalRefund = returnedOrders.reduce(
      (sum, o) => sum + (o.totalPrice || 0),
      0,
    );

    // 4. Tính toán tổng số (Stats)
    const totalOrderRev = successfulOrders.reduce(
      (sum, item) => sum + (Number(item.totalPrice) || 0),
      0,
    );
    const totalAdRev = adRevenues.reduce(
      (sum, item) => sum + (Number(item.amount) || 0),
      0,
    );

    // Doanh thu thực tế:
    const finalRevenue = totalOrderRev - totalRefund;

    // --- BƯỚC FIX: TẠO DỮ LIỆU CHO ĐỒ THỊ (chartData) ---
    const chartData = [];
    const today = new Date();

    for (let i = daysToChart - 1; i >= 0; i--) {
      // Tạo ngày cần tính toán (lùi dần từ ngày hiện tại)
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateLabel = d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      });
      const dateString = d.toDateString(); // Dùng để so sánh ngày đơn giản

      // Lọc tiền đơn hàng trong ngày d
      const dayOrderRev = successfulOrders
        .filter((o) => new Date(o.createdAt).toDateString() === dateString)
        .reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);

      // Lọc tiền quảng cáo trong ngày d
      const dayAdRev = adRevenues
        .filter((a) => new Date(a.date).toDateString() === dateString)
        .reduce((sum, a) => sum + (Number(a.amount) || 0), 0);

      chartData.push({
        name: dateLabel, // Trục X hiện ngày (ví dụ 10/03)
        order: dayOrderRev, // Giá trị đường Đơn hàng
        ad: dayAdRev, // Giá trị đường Quảng cáo
      });
    }

    // 5. Chuẩn bị danh sách giao dịch
    const orderTrans = successfulOrders.map((o) => ({
      id: `ĐƠN-${o._id.toString().slice(-5).toUpperCase()}`,
      type: "ORDER",
      amount: o.totalPrice,
      source: o.customerInfo?.fullName || "Khách hàng",
      date: new Date(o.createdAt).toLocaleDateString("vi-VN"),
      rawDate: o.createdAt,
    }));

    const adTrans = adRevenues.map((a) => ({
      _id: a._id, // QUAN TRỌNG: Trả về ID thật để xóa
      id: `QC-${a._id.toString().slice(-5).toUpperCase()}`,
      type: "AD",
      amount: a.amount,
      source: a.source,
      date: new Date(a.date).toLocaleDateString("vi-VN"),
      rawDate: a.date,
      note: a.note, // Trả về thêm note để hiển thị chi tiết
    }));

    // 6. Trả về JSON hoàn chỉnh
    res.json({
      success: true,
      stats: {
        totalOrderRev,
        totalRefund,
        totalAdRev,
        // DOANH THU THỰC TẾ = (Tiền hàng - Tiền hoàn) + Tiền quảng cáo
        combinedTotal: totalOrderRev - totalRefund + totalAdRev,
        orderCount: successfulOrders.length,
      },
      transactions: [...orderTrans, ...adTrans]
        .sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate))
        .slice(0, 10),
      chartData: chartData,
    });
  } catch (error) {
    console.error("LỖI CONTROLLER:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Hàm createAdRevenue giữ nguyên như cũ...
exports.createAdRevenue = async (req, res) => {
  try {
    const { amount, source, date, note } = req.body;
    const newAdRev = await AdRevenue.create({
      amount: Number(amount),
      source,
      date,
      note,
      creator: req.user.id,
    });
    res.status(201).json({ success: true, data: newAdRev });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteAdRevenue = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedItem = await AdRevenue.findByIdAndDelete(id);

    if (!deletedItem) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy dữ liệu để xóa" });
    }

    res.json({
      success: true,
      message: "Đã xóa doanh thu quảng cáo thành công",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
