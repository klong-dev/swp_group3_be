const Mentor = require('../models/Mentor');
const Student = require('../models/Student');
const Donate = require('../models/Donate');
const Item = require('../models/Item');

class DonateController {
    async getDonate(req, res) {
        try {
            const { type, id } = req.params;
            if(!type || !id){
                return res.json({ error_code: 1, message: "All fields must be filled" });
            }
            if (type === 'mentor') {
                const mentor = await Mentor.findByPk(id);
                if (!mentor) {
                    return res.json({ error_code: 1, message: "Mentor not found" });
                }
                const donates = await Donate.findAll({
                    where: {
                        mentorId: id
                    },
                    include: [
                        {
                            model: Student,
                            as: "student"
                        },
                        {
                            model: Item,
                            as: "item"
                        }
                    ]
                });
                return res.status(200).json({ error_code: 0, donates });
            } else if (type === 'student') {
                const student = await Student.findByPk(id);
                if (!student) {
                    return res.json({ error_code: 1, message: "Student not found" });
                }
                const donates = await Donate.findAll({
                    where: {
                        studentId: id
                    },
                    include: [
                        {
                            model: Mentor,
                            as: "mentor"
                        },
                        {
                            model: Item,
                            as: "item"
                        }
                    ]
                });
                return res.status(200).json({ error_code: 0, donates });
            }
        } catch (error) {
            return res.status(500).json({ error_code: 5, error: error.message });
        }
    }

}
module.exports = new DonateController();
