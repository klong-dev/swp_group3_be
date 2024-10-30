const express = require("express");
const router = express.Router();
const vnpayController = require("../app/controllers/VNPayController");

router.post("/create_payment_url", vnpayController.createPaymentUrl);
router.get("/result", vnpayController.paymentResult);

module.exports = router;