const express = require('express');
const router = express.Router();
const StudentController = require('../app/controllers/StudentController');
const Auth = require('../middleware/AuthenticateJWT')
router.post('/valid', Auth, StudentController.validStudent);

module.exports = router
