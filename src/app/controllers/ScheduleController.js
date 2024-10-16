const MentorSlot = require('../models/MentorSlot');

class ScheduleController {
    // error_code: 0 => Success
    // error_code: 1 => Missing required fields
    async getMentorSlots(req, res) {
        const mentorId = req.params.mentorId;
        if (!mentorId) {
            return res.status(400).json({ error_code: 1, message: 'Mentor ID is required' });   
        }
        const slots = await MentorSlot.findAll({
        where: {
            mentorId: mentorId
        }
        });
        return res.json({ error_code: 0, slots });
    }
}

module.exports = new ScheduleController();