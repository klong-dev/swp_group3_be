const express = require('express');
const router = express.Router();
const AdminController = require('../app/controllers/AdminController');
const Auth = require('../middleware/AuthenticateJWT')
router.get('/mentor-list', Auth, AdminController.showMentorList);
router.get('/student-list', Auth, AdminController.showStudentList);
router.post('/promote', Auth, AdminController.promoteToMentor);

module.exports = router
