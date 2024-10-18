const express = require('express');
const router = express.Router();

const ScheduleController = require('../app/controllers/ScheduleController');

router.get('/slots/:mentorId', ScheduleController.getMentorSlots);
router.post('/slots', ScheduleController.addMentorSlot);
router.put('/slots/:slotId', ScheduleController.updateMentorSlot);
router.put('/slots/delete/:slotId', ScheduleController.deleteMentorSlot);

module.exports = router
