const TransactionHistory = require('../models/TransactionHistory');
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
                }
            });
            return res.status(200).json(transaction);
        } catch (error) {
            return res.status(500).json({ error: error.message }); 
        }
    }
}

module.exports = new TransactionController();