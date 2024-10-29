const Mentor = require('../models/Mentor');
const Student = require('../models/Student')
const Booking = require('../models/Booking');
const StudentGroup = require('../models/StudentGroup');

class TransactionController {
    async list(req, res) {
        try {
            const { type, id } = req.params;
            let transactions = [];
            if (type === 'mentor') {
                const bookings = await Booking.findAll(
                    {
                        where: { mentorId: id },
                        include: [
                            {
                                model: StudentGroup,
                                as: 'studentGroups',
                            }
                        ]
                    });
                return res.json( bookings );
            } else {
                transactions = await Student.findOne({ where: { id } });
            }
            return res.json({ transactions });
        } catch (error) {
            return res.status(500).json({ error: error.message }); 
        }
    }
}

module.exports = new TransactionController();