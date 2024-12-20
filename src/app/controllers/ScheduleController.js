const MentorSlot = require('../models/MentorSlot');
const Mentor = require('../models/Mentor');
const Skill = require('../models/Skill');
const Semester = require('../models/Semester');
const { Op } = require('sequelize');
const { sendMail } = require('../../config/mail/mail');

class ScheduleController {
    /*
    error_code: 0 => Success
    error_code: 1 => Missing required fields
    error_code: 2 => Data not found 
    error_code: 5 => Internal server error
    */
    async getMentorSlots(req, res) {
        try {
            const mentorId = req.params.mentorId;
            if (!mentorId) {
                return res.status(400).json({ error_code: 1, message: 'Mentor ID is required' });
            }

            // is mentor exist?
            const mentor = await Mentor.findByPk(mentorId);
            if (!mentor) {
                return res.status(400).json({ error_code: 2, message: 'Mentor not found' });
            }
            const slots = await MentorSlot.findAll({
                where: {
                    mentorId: mentorId,
                    status: 1,
                    slotStart: {
                        [Op.gte]: new Date()
                    }
                },
                raw: true
            });

            // Format the datetime fields
            const formatDateTime = (dateTime) => {
                const date = new Date(dateTime);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                const seconds = String(date.getSeconds()).padStart(2, '0');
                return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
            };

            slots.forEach(slot => {
                slot.slotStart = formatDateTime(slot.slotStart);
                slot.slotEnd = formatDateTime(slot.slotEnd);
            });
            return res.json({ error_code: 0, slots });
        } catch (error) {
            return res.status(500).json({ error_code: 5, message: 'Internal server error', error });
        }
    }



    async addMentorSlot(req, res) {
        try {
            const { slotStart, mentorId, description } = req.body;
            if (!slotStart || !mentorId) {
                return res.status(400).json({ error_code: 1, message: 'Missing required fields' });
            }

            // is mentor exist?
            const mentor = await Mentor.findByPk(mentorId);
            if (!mentor) {
                return res.status(400).json({ error_code: 2, message: 'Mentor not found' });
            }
            const semester = await Semester.findOne({ order: [['id', 'DESC']], where: { status: 1 } });
            if (!semester) {
                return res.status(400).json({ error_code: 1, message: 'No active semester' });
            }

            // validate slot start & slot end
            if (new Date(slotStart) < new Date()) {
                return res.status(400).json({ error_code: 1, message: 'Slot start must be in the future' });
            }
            const startTime = new Date(slotStart);
            // endTime = startTime + slotDuration (hour)
            const endTime = new Date(startTime);
            endTime.setMinutes(endTime.getMinutes() + semester.slotDuration);
            // check slotStart is contained between slotStart and slotEnd of any slot of mentor
            const availableSlot = await MentorSlot.findAll({
                where: {
                    mentorId,
                    status: 1,
                    [Op.or]: [
                        {
                            slotStart: { [Op.lte]: startTime },
                            slotEnd: { [Op.gte]: startTime }
                        },
                        {
                            slotStart: { [Op.lte]: endTime },
                            slotEnd: { [Op.gte]: endTime }
                        }
                    ]
                },
                raw: true
            });
            if (availableSlot.length > 0) {
                return res.status(400).json({ error_code: 1, message: 'Slot is already exist', availableSlot });
            }


            const slot = await MentorSlot.create({
                slotStart: startTime,
                slotEnd: endTime,
                skillId: null,
                mentorId,
                size: 999, // default size
                cost: semester.slotCost, // cost
                description,
                status: 1
            }, { raw: true });

            return res.json({ error_code: 0, slot, message: 'Slot added successfully' });
        } catch (error) {
            return res.status(500).json({ error_code: 5, message: 'Internal server error', error: error.message });
        }
    }

    async updateMentorSlot(req, res) {
        try {
            const { slotId, slotStart, mentorId, description } = req.body;
            if (!slotId || !slotStart || !mentorId) {
                return res.status(400).json({ error_code: 1, message: 'Missing required fields' });
            }

            // is slot exist?
            const slot = await MentorSlot.findByPk(slotId);
            if (!slot) {
                return res.status(400).json({ error_code: 2, message: 'Slot not found' });
            }
            // is mentor exist?
            const mentor = await Mentor.findByPk(mentorId);
            if (!mentor) {
                return res.status(400).json({ error_code: 2, message: 'Mentor not found' });
            }
            const semester = await Semester.findOne({ order: [['id', 'DESC']], where: { status: 1 } });
            if (!semester) {
                return res.status(400).json({ error_code: 1, message: 'No active semester' });
            }

            // validate slot start & slot end
            if (new Date(slotStart) < new Date()) {
                return res.status(400).json({ error_code: 3, message: 'Slot start must be in the future' });
            }

            const startTime = new Date(slotStart);
            const endTime = new Date(slotStart);
            // endTime = startTime + slotDuration (hour)
            endTime.setHours(endTime.getHours() + Math.round(semester.slotDuration / 60));

            // check slotStart is contained between slotStart and slotEnd of any slot of mentor
            const availableSlot = await MentorSlot.findAll({
                where: {
                    mentorId,
                    status: 1,
                    slotStart: {
                        [Op.lte]: startTime
                    },
                    slotEnd: {
                        [Op.gte]: startTime
                    },
                    slotStart: {
                        [Op.lte]: endTime
                    },
                    slotEnd: {
                        [Op.gte]: endTime
                    },
                    id: {
                        [Op.not]: slotId // not include the current slot
                    }
                }
            });
            if (availableSlot.length > 0) {
                return res.status(400).json({ error_code: 1, message: 'startTime not accepted', availableSlot });
            }

            console.log(mentorId, slotId, startTime, endTime, description, semester.slotCost);

            const slotUpdate = await MentorSlot.update({
                slotStart: startTime,
                slotEnd: endTime,
                skillId: slot.skillId,
                mentorId,
                size: 999,
                cost: semester.slotCost,
                description,
                status: 1
            }, {
                where: {
                    id: slotId
                },
                raw: true
            });
            if (slotUpdate[0] >= 1)
                return res.status(200).json({ error_code: 0, message: "Slot updated successfully" });
            else
                return res.status(200).json({ error_code: 0, message: 'Everything is up to date' });
        } catch (error) {
            return res.status(500).json({ error_code: 5, message: 'Internal server error', error: error.message });
        }
    }

    async deleteMentorSlot(req, res) {
        try {
            const slotId = req.params.slotId;
            if (!slotId) {
                return res.status(400).json({ error_code: 1, message: 'Slot ID is required' });
            }

            // is slot exist?
            const slot = await MentorSlot.findOne({
                where: {
                    id: slotId,
                    status: 1
                }
            });
            if (!slot) {
                return res.status(400).json({ error_code: 2, message: 'Slot not found' });
            }

            await MentorSlot.update(
                { status: 0 },
                {
                    where: {
                        id: slotId
                    }
                }
            );
            return res.json({ error_code: 0, message: 'Slot deleted successfully' });
        } catch (error) {
            return res.status(500).json({ error_code: 5, message: 'Internal server error', error: error.message });
        }
    }
}

module.exports = new ScheduleController();