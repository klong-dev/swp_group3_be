const express = require('express');
const router = express.Router();
const StudentController = require('../app/controllers/StudentController');
const Auth = require('../middleware/AuthenticateJWT')
router.get('/applying', Auth, StudentController.applyingMentors);
router.post('/valid', Auth, StudentController.validStudent);
router.post('/apply-mentor', Auth, StudentController.applyToBeMentor);


module.exports = router
