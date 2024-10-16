const express = require('express');
const router = express.Router();

const ScheduleController = require('../app/controllers/ScheduleController');

router.get('/slots/:mentorId', ScheduleController.getMentorSlots);

module.exports = router
