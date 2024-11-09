const express = require('express');
const DonateController = require('../app/controllers/DonateController');
const Auth = require('../middleware/AuthenticateJWT')
const router = express.Router();

router.get('/:type/:id', Auth, DonateController.getDonate);
router.get('/total-donation', DonateController.getTotalDonationForMentor)
router.get('/checkout', DonateController.checkOut);
module.exports = router;