const express = require('express');
const router = express.Router();
const ComplaintController = require('../app/controllers/ComplaintController');
const Auth = require('../middleware/AuthenticateJWT');

router.post('/create', Auth, ComplaintController.createComplaint);
router.get('/student/:studentId', Auth, ComplaintController.getStudentComplaints);
router.get('/pending-by-status/:status', Auth, ComplaintController.getComplaintsByStatus);

router.get('/list-rejected', Auth, ComplaintController.getRejectedComplaints);
router.get('/list-approved', Auth, ComplaintController.getApprovedComplaints);
router.get('/list-pending', Auth, ComplaintController.getPendingComplaints);

router.get('/accept/:complaintId', Auth, ComplaintController.acceptComplaint);
router.get('/reject/:complaintId', Auth, ComplaintController.rejectComplaint);

module.exports = router;