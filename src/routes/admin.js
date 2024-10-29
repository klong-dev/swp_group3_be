const express = require('express');
const router = express.Router();
const AdminController = require('../app/controllers/AdminController');
const Auth = require('../middleware/AuthenticateJWT')

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



router.get('/search-mentor-by-name', Auth, AdminController.searchMentorByName);
router.get('/search-mentor-by-id', Auth, AdminController.searchMentorByMentorId);
router.get('/search-student-by-name', Auth, AdminController.searchStudentByName);
router.get('/search-student-by-id', Auth, AdminController.searchStudentByStudentId);

module.exports = router
