const express = require('express');
const router = express.Router();
const ComplaintController = require('../app/controllers/ComplaintController');
const { Auth } = require('../app/middlewares/AuthenticateJWT');

router.post('/create', Auth, ComplaintController.createComplaint);
router.get('/student/:studentId', Auth, ComplaintController.getStudentComplaints);

module.exports = router;