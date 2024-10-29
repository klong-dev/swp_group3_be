const crypto = require("crypto");
const querystring = require("qs");
const { vnpay } = require("../../config/vnpay");
const moment = require("moment-timezone");
const Item = require("../models/Item");
const Mentor = require("../models/Mentor");
const Student = require("../models/Student");

class VNPayController {
    sortObject = (obj) => {
        let sorted = {};
        let str = [];
        let key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                str.push(encodeURIComponent(key));
            }
        }
        str.sort();
        for (key = 0; key < str.length; key++) {
            sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
        }
        return sorted;
    }

    createPaymentUrl = async (req, res) => {
        const { itemId, mentorId, studentId } = req.body;
        const item = await Item.findByPk(itemId);
        if (!item) {
            return res.status(404).json({ error_code: 2, message: "Item not found" });
        }
        const mentor = await Mentor.findByPk(mentorId);
        if (!mentor) {
            return res.status(404).json({ error_code: 2, message: "Mentor not found" });
        }
        const student = await Student.findByPk(studentId);
        if (!student) {
            return res.status(404).json({ error_code: 2, message: "Student not found" });
        }
        let vnp_Params = {
            vnp_Version: "2.1.0",
            vnp_Command: "pay",
            vnp_TmnCode: vnpay.vnp_TmnCode,
            vnp_Amount: Math.round(item.price * 100), // Chuyển đổi sang đơn vị VND
            vnp_CurrCode: "VND",
            vnp_TxnRef: `VNP${moment().tz("Asia/Ho_Chi_Minh").format("YYYYMMDDHHmmss")}`,
            vnp_OrderInfo: `payment_${item.id}_${mentor.id}_${student.id}`,
            vnp_Locale: "vn",
            vnp_BankCode: "NCB",
            vnp_ReturnUrl: process.env.CLIENT_URL + "/payment/result",
            vnp_IpAddr: "14.186.73.156", // Sử dụng địa chỉ IP cụ thể
            vnp_CreateDate: moment().tz("Asia/Ho_Chi_Minh").format("YYYYMMDDHHmmss"),
            vnp_OrderType: "topup",
            vnp_ExpireDate: moment().tz("Asia/Ho_Chi_Minh").add(1, "hours").format("YYYYMMDDHHmmss"),
        };

        vnp_Params = this.sortObject(vnp_Params);

        const signData = querystring.stringify(vnp_Params, { encode: false });
        const secureHash = crypto.createHmac("sha512", vnpay.vnp_HashSecret)
            .update(signData)
            .digest("hex");

        vnp_Params["vnp_SecureHashType"] = "SHA512";
        vnp_Params["vnp_SecureHash"] = secureHash;

        const vnpUrl = vnpay.vnp_Url + "?" + querystring.stringify(vnp_Params, { encode: false });
        res.send({ vnpUrl });
    };
}

module.exports = new VNPayController();