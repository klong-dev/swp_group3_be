const crypto = require("crypto");
const querystring = require("qs");
const { vnpay } = require("../../config/vnpay");
const moment = require("moment-timezone");
const Item = require("../models/Item");
const Mentor = require("../models/Mentor");
const Student = require("../models/Student");
const Donate = require("../models/Donate");

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

    paymentResult = async (req, res) => {
        try {
            const { vnp_OrderInfo, vnp_TransactionStatus } = req.query;
            const [itemId, mentorId, studentId] = vnp_OrderInfo.split("_").slice(1);
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
            if (vnp_TransactionStatus === "00") {
                await Donate.create({
                    itemId: item.id,
                    mentorId: mentor.accountId,
                    studentId: student.accountId,
                    amount: 1,
                    status: 1
                });
                return res.status(200).json({ error_code: 0, message: "Payment success" });
            } else {
                const status_error = {
                    "01": "Bank system error",
                    "02": "Giao dịch chưa hoàn thành",
                    "03": "Giao dịch bị lỗi",
                    "04": "Giao dịch đảo (Khách hàng đã bị trừ tiền tại Ngân hàng nhưng GD chưa thành công ở VNPAY)",
                    "05": "VNPAY đang xử lý giao dịch này (GD hoàn tiền)",
                    "06": "VNPAY đã gửi yêu cầu hoàn tiền sang Ngân hàng (GD hoàn tiền)",
                    "07": "Giao dịch bị nghi ngờ gian lận",
                    "08": "Giao dịch quá thời gian thanh toán",
                    "09": "GD Hoàn trả bị từ chối",
                    "10": "Đã giao hàng",
                    "11": "Giao dịch bị hủy",
                    "12": "Giao dịch đã được thanh quyết toán cho merchant",
                }
                return res.status(400).json({ error_code: 3, message: "Payment failed", status_error: status_error[vnp_TransactionStatus] });
            }
        } catch (error) {
            return res.status(500).json({ error_code: 5, message: "Internal server error", error: error.message });   
        }
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
            vnp_OrderInfo: `payment_${item.id}_${mentor.accountId}_${student.accountId}`,
            vnp_Locale: "vn",
            vnp_BankCode: "NCB",
            vnp_ReturnUrl: process.env.CLIENT_URL + "/donate-process",
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