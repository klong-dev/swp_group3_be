const express = require('express');
const router = express.Router();

const MailController = require('../app/controllers/MailController');
router.post('/send-mail', MailController.sendMail);

module.exports = router