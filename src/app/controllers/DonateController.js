const Mentor = require("../models/Mentor");
const Student = require("../models/Student");
const Donate = require("../models/Donate");
const Item = require("../models/Item");
const { validateCard } = require("../../utils/DonateUtils");

class DonateController {
  async checkOut(req, res) {
    try {
      const { mentorId, card_number, card_name, bank_name } = req.query;
      if (!mentorId || !card_number || !card_name || !bank_name) {
        return res.json({ error_code: 1, message: "All fields must be filled" });
      }
      const mentor = await Mentor.findByPk(mentorId);
      if (!mentor) {
        return res.json({ error_code: 1, message: "Mentor not found" });
      }
      const cardError = validateCard(card_number, card_name);
      if (cardError) {
        return res.status(400).json(cardError);
      }
      const donates = await Donate.findAll({ where: { mentorId, status: 1 } });
      let totalAmount = 0;
      donates.forEach(async (donate) => {
        totalAmount += donate.amount;
        donate.status = 2;
        await donate.save();
      });
      return res.status(200).json({ error_code: 0, total: totalAmount, message: `Checkout successfully ${donates.length} items` });
    } catch (error) {
      return res.status(500).json({ error_code: 5, error: error.message });
    }
  }

  async getDonate(req, res) {
    try {
      const { type, id } = req.params;
      if (!type || !id) {
        return res.json({
          error_code: 1,
          message: "All fields must be filled",
        });
      }
      if (type === "mentor") {
        const mentor = await Mentor.findByPk(id);
        if (!mentor) {
          return res.json({ error_code: 1, message: "Mentor not found" });
        }
        const donates = await Donate.findAll({
          where: {
            mentorId: id,
          },
          include: [
            {
              model: Student,
              as: "student",
            },
            {
              model: Item,
              as: "item",
            },
          ],
        });
        return res.status(200).json({ error_code: 0, donates });
      } else if (type === "student") {
        const student = await Student.findByPk(id);
        if (!student) {
          return res.json({ error_code: 1, message: "Student not found" });
        }
        const donates = await Donate.findAll({
          where: {
            studentId: id,
          },
          include: [
            {
              model: Mentor,
              as: "mentor",
            },
            {
              model: Item,
              as: "item",
            },
          ],
        });
        return res.status(200).json({ error_code: 0, donates });
      }
    } catch (error) {
      return res.status(500).json({ error_code: 5, error: error.message });
    }
  }

  async getTotalDonationForMentor(req, res) {
    try {
      const { mentorId } = req.query;
      const mentor = await Mentor.findByPk(mentorId);
      if (!mentor) {
        return res.status(404).json({ error_code: 1, message: "Mentor not found" });
      }
      const donates = await Donate.findAll({
        where: { 
            mentorId,
            status: 1
         },
        include: [
          {
            model: Item,
            as: "item",
            attributes: ["price"],
          },
        ],
      });
      let totalAmount = 0;
      for (let i = 0; i < donates.length; i++) {
        const donate = donates[i];
        const itemPrice = donate.item ? donate.item.price : 0;
        totalAmount += itemPrice;
      }

      return res.status(200).json({
        error_code: 0,
        totalAmount,
      });
    } catch (error) {
      return res.status(500).json({ error_code: 1, error: error.message });
    }
  }
}
module.exports = new DonateController();
