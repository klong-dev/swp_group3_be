const express = require('express');
const router = express.Router();
const ComplaintController = require('../app/controllers/ComplaintController');
const Auth = require('../middleware/AuthenticateJWT');

router.post('/create', Auth, ComplaintController.createComplaint);
router.get('/student/:studentId', Auth, ComplaintController.getStudentComplaints);
router.get('/pending-by-status/:status', Auth, ComplaintController.getComplaintsByStatus);

module.exports = router;