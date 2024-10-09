const express = require('express');
const express = require('express');
const AdminController = require('../app/controllers/AdminController');
const Auth = require('../middleware/AuthenticateJWT')
const router = express.Router();

router.post('/add-skill', AdminController.addSkill);
router.get('/mentor-list', Auth, AdminController.showMentorList);
router.get('/student-list', Auth, AdminController.showStudentList);
router.post('/promote', Auth, AdminController.promoteToMentor);

module.exports = router
