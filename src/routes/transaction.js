const express = require('express');
const router = express.Router();
const TransactionController = require('../app/controllers/TransactionController');
const Auth = require('../middleware/AuthenticateJWT')

router.get('/:id', Auth, TransactionController.list);

module.exports = router;
