const express = require('express');
const Auth = require('../middleware/AuthenticateJWT')
const router = express.Router();

const MentorController = require('../app/controllers/MentorController');
router.get('/search', MentorController.getMentors);
router.get('/profile', MentorController.loadProfile);
router.get('/feedback', MentorController.getListFeedback);
router.get('/skills', MentorController.getMentorSkills);
router.get('/loadskills', MentorController.loadAllSkills);
router.post('/rating-student', Auth, MentorController.ratingStudent);
router.post('/edit-profile', Auth, MentorController.editProfile);
router.get('/top-mentor', MentorController.selectTopMentor);
module.exports = router
