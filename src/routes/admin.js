const express = require('express');
const AdminController = require('../app/controllers/AdminController');
const Auth = require('../middleware/AuthenticateJWT')
const router = express.Router();

router.post('/valid', AdminController.validAdmin);
router.post('/add-skill', Auth, AdminController.addSkill);
router.get('/mentor-list', Auth, AdminController.showMentorList);
router.get('/student-list', Auth, AdminController.showStudentList);
router.post('/promote', Auth, AdminController.promoteToMentor);
router.post('/start-semester', Auth, AdminController.startNewSemester);
router.post('/reset-point', Auth, AdminController.resetStudentPoints);
router.post('/set-default-point', Auth, AdminController.setDefaultPointForCurrentSemester);
router.get('/top-mentors', Auth, AdminController.listTopMentors);
router.get('/inactive-mentors', Auth, AdminController.getInactiveMentors);
router.get('/disable-mentor/:id', Auth, AdminController.disableMentor);
router.get('/activate-mentor/:id', Auth, AdminController.activateMentor);
router.post('/login/validate', AdminController.validate);

router.post('/reject-application', AdminController.rejectMentorApplication);
router.get('/pending-mentors', Auth, AdminController.getPendingMentors);
router.post('/update-complaint-status', Auth, AdminController.updateComplaintStatus);
// router.get('/pending-complaint', Auth, AdminController.getPendingComplaints);

router.get('/total-mentor-and-student', Auth, AdminController.getMentorsAndStudentsQuantity);
router.get('/total-booking', Auth, AdminController.getBookingQuantity);

router.get('/search-mentor-by-name', Auth, AdminController.searchMentorByName);
router.get('/search-mentor-by-id', Auth, AdminController.searchMentorByMentorId);
router.get('/search-student-by-name', Auth, AdminController.searchStudentByName);
router.get('/search-student-by-id', Auth, AdminController.searchStudentByStudentId);

router.post('/delete-skill', Auth, AdminController.deleteSkill);
router.post('/update-skill', Auth, AdminController.updateSKill);

router.get('/list-checkout', AdminController.listCheckOut);
router.get('/confirm-checkout/:mentorId', AdminController.confirmCheckOut);
router.get('/reject-checkout/:mentorId', AdminController.rejectCheckOut);

router.post('/admin/edit-student-point', Auth, AdminController.editStudentPoint);
router.post('/admin/edit-mentor-point', Auth, AdminController.editMentorPoint);

module.exports = router
