const CheckOutHistorys = require('../models/CheckOutHistory');
const Mentor = require('../models/Mentor');
const moment = require('moment');

class CheckOutHistory {
    async list(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ error: "Missing required fields" });
            }
            const mentor = await Mentor.findByPk(id);
            if (!mentor) {
                return res.json({ error_code: 1, message: "Mentor not found" });
            }
            const checkout_history = await CheckOutHistorys.findAll({
                where: {
                    accountId: id,
                },
                order: [['createdAt', 'DESC']],
            });

            const updatedCheckoutHistory = checkout_history.map(history => {
                const plainHistory = history.get({ plain: true });
                return {
                    ...plainHistory,
                    mentor: mentor.fullName
                };
            });

            const formattedCheckOutHistory = updatedCheckoutHistory.map(checkout => {
                return {
                    ...checkout,
                    createdAt: moment(checkout.createdAt).format('YYYY-MM-DD HH:mm:ss'),
                    updatedAt: moment(checkout.updatedAt).format('YYYY-MM-DD HH:mm:ss')
                };
            });

            return res.status(200).json({ checkout_history: formattedCheckOutHistory });
        } catch (error) {
            console.error(error); // Log the error for debugging
            return res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new CheckOutHistory();