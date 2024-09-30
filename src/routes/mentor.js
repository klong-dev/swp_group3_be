const express = require('express');
const router = express.Router();

const MentorController  = require('../app/controllers/MentorController');
router.get('/search', MentorController.getMentors);
router.get('/profile', MentorController.loadProfile);
module.exports = router
