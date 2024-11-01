const TransactionHistory = require('../models/TransactionHistory');
const Student = require('../models/Student');
const Mentor = require('../models/Mentor');
const StudentGroup = require('../models/StudentGroup');
const Booking = require('../models/Booking');
class TransactionController {
    async list(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ error: "Missing required fields" });
            }
            const transaction = await TransactionHistory.findAll({
                where: {
                    accountId: id,
                },
                include: {
                    model: Booking,
                    as: 'booking',
                    include: [
                        {
                            model: Mentor,
                            as: 'mentor',
                        },
                        {
                            model: StudentGroup,
                            as: 'studentGroups',
                        },
                    ],
                }
            });
            return res.status(200).json(transaction);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new TransactionController();