const express = require('express');
const router = express.Router();

const MailController = require('../app/controllers/MailController');
router.post('/search', MailController.sendMail);

module.exports = router