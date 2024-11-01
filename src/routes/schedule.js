const express = require('express');
const router = express.Router();

const ScheduleController = require('../app/controllers/ScheduleController');

router.get('/slots/:mentorId', ScheduleController.getMentorSlots);
router.post('/slots', ScheduleController.addMentorSlot);
router.post('/slots/update', ScheduleController.updateMentorSlot);
router.get('/slots/delete/:slotId', ScheduleController.deleteMentorSlot);

module.exports = router
