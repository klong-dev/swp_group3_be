const express = require('express');
const paymentController = require('../controllers/paymentController');
const router = express.Router();

router.get('/payment/:id', paymentController.getPayment);
router.post('/payment', paymentController.createPayment);
router.put('/payment/:id', paymentController.updatePayment);
router.delete('/payment/:id', paymentController.deletePayment);

// Export the router
module.exports = router;