const User = require("../models/User");
const WalletTransaction = require("../models/WalletTransaction");
const moment = require("moment");
const qs = require("qs");
const crypto = require("crypto");

exports.getBalance = async (req, res) => {
  try {
    const user = req.user;
    res.json({ success: true, balance: user.walletBalance || 0 });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. TẠO LINK NẠP TIỀN
exports.createTopupUrl = async (req, res) => {
  try {
    let date = new Date();
    let createDate = moment(date).format("YYYYMMDDHHmmss");
    let ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    let tmnCode = process.env.VNP_TMN_CODE;
    let secretKey = process.env.VNP_HASH_SECRET;
    let vnpUrl = process.env.VNP_URL;
    let returnUrl = process.env.VNP_RETURN_URL_WALLET;

    let { amount } = req.body;
    let userId = req.user.id;
    let txnRef = `TOPUP_${userId}_${moment().format("HHmmss")}`;

    await WalletTransaction.create({
      userId,
      amount: Number(amount),
      type: "TOPUP",
      vnp_TxnRef: txnRef,
      status: "PENDING",
    });

    let vnp_Params = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: tmnCode,
      vnp_Locale: "vn",
      vnp_CurrCode: "VND",
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: "Nap tien vao vi",
      vnp_OrderType: "other",
      vnp_Amount: amount * 100,
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
    };

    vnp_Params = sortObject(vnp_Params);
    let signData = qs.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
    vnp_Params["vnp_SecureHash"] = signed;
    vnpUrl += "?" + qs.stringify(vnp_Params, { encode: false });

    res.json({ success: true, vnpUrl });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. XỬ LÝ KẾT QUẢ VNPAY
exports.vnpayReturnWallet = async (req, res) => {
  try {
    let vnp_Params = req.query;
    let secureHash = vnp_Params["vnp_SecureHash"];

    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    vnp_Params = sortObject(vnp_Params);

    let secretKey = process.env.VNP_HASH_SECRET;
    let signData = qs.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    if (secureHash === signed) {
      const responseCode = vnp_Params["vnp_ResponseCode"];
      const txnRef = vnp_Params["vnp_TxnRef"];

      // Nếu VNPay báo thành công (00)
      if (responseCode === "00") {
        const transaction = await WalletTransaction.findOne({
          vnp_TxnRef: txnRef,
        });

        if (transaction && transaction.status === "PENDING") {
          transaction.status = "SUCCESS";
          await transaction.save();

          // CỘNG TIỀN VÀO VÍ NGƯỜI DÙNG
          await User.findByIdAndUpdate(transaction.userId, {
            $inc: { walletBalance: transaction.amount },
          });

          // Redirect về Frontend kèm thông báo thành công
          return res.redirect(
            `${process.env.FRONTEND_URL}/account?topup=success`,
          );
        }
      }
    }
    // Nếu thất bại
    res.redirect(`${process.env.FRONTEND_URL}/account?topup=fail`);
  } catch (error) {
    console.error("VNPAY Return Error:", error);
    res.redirect(`${process.env.FRONTEND_URL}/account?topup=error`);
  }
};

function sortObject(obj) {
  let sorted = {};
  let str = Object.keys(obj).sort();
  for (let key of str) {
    sorted[encodeURIComponent(key)] = encodeURIComponent(obj[key]).replace(
      /%20/g,
      "+",
    );
  }
  return sorted;
}
