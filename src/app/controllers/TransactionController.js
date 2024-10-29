const Mentor = require('../models/Mentor');
const Student = require('../models/Student')
const Booking = require('../models/Booking');
const StudentGroup = require('../models/StudentGroup');

class TransactionController {
    async list(req, res) {
        try {
            const { type, id } = req.params;
            let transactions = [];
            let group = [];

            if (type === 'mentor') {
                const bookings = await Booking.findAll(
                    {
                        where: { mentorId: id },
                        include: [
                            {
                                model: StudentGroup,
                                as: 'studentGroups',
                                include: [
                                    {
                                        model: Student,
                                        as: 'student'
                                    }
                                ]
                            }
                        ]
                    });
                return res.json( bookings );
            } else if(type === 'student') {
                const getGroup = await StudentGroup.findAll({
                    where: { studentId: id },
                });
                const bookingIdList = getGroup.map(group => group.bookingId);
                const bookings = await Booking.findAll({
                    where: { id: bookingIdList },
                    include: [
                        {
                            model: Mentor,
                            as: 'mentor'
                        }
                    ],
                    order: [['startTime', 'ASC']]
                });
                for (const booking of bookings) {
                    if (booking.status === 0) {
                        transactions.push({
                            bookingId: booking.id,
                            startTime: booking.startTime,
                            endTime: booking.endTime,
                            cost: booking.cost,
                            type: 0,
                            mentor: booking.mentor
                        });
                        transactions.push({
                            bookingId: booking.id,
                            startTime: booking.startTime,
                            endTime: booking.endTime,
                            cost: booking.cost,
                            type: 1,
                            mentor: booking.mentor
                        });
                    } else {
                        transactions.push({
                            bookingId: booking.id,
                            startTime: booking.startTime,
                            endTime: booking.endTime,
                            cost: booking.cost,
                            type: 0,
                            mentor: booking.mentor
                        });
                    }
                } 
            }
            return res.json({ transactions });
        } catch (error) {
            return res.status(500).json({ error: error.message }); 
        }
    }
}

module.exports = new TransactionController();