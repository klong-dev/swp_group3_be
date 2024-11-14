const express = require('express');
const router = express.Router();
const Auth = require('../middleware/AuthenticateJWT');
const CheckOutHistory = require('../app/controllers/CheckOutHistory');

router.get('/:id', CheckOutHistory.list);

module.exports = router;
