const Mentor = require('../models/Mentor')
const Student = require('../models/Student')
class AdminController {
  async showMentorList(req, res) {
    try {
      const mentorList = await Mentor.findAll()
      return res.json({ error_code: 0, mentorList })
    } catch (error) {
      res.status(500).json({ error_code: 1, error })
    }
  }

  async showStudentList(req, res) {
    try {
      const studentList = await Student.findAll()
      return res.json({ error_code: 0, studentList })
    } catch (error) {
      res.status(500).json({ error_code: 1, error })
    }
  }

  async promoteToMentor(req, res) {
    try {
      const { accountId } = req.body;

      if (!accountId) {
        return res.json({ error_code: 3, message: "accountId is required" });
      }

      const student = await Student.findOne({ where: { accountId } });
      if (!student) {
        return res.json({ error_code: 1, message: "No account matched" });
      }
      
      const existingMentor = await Mentor.findOne({ where: { accountId } });
      if (existingMentor) {
        return res.json({ error_code: 2, message: "Account is already a mentor" });
      }
      const newMentor = await Mentor.create({
        accountId: student.accountId,
        fullName: student.fullName,
        email: student.email,
        point: 50,
        imgPath: student.imgPath,
        status: 1, 
      });
      return res.json({ error_code: 0, message: "Promotion successful", mentor: newMentor });
    } catch (error) {
      return res.status(500).json({ error_code: 1, error: error.message });
    }
  }

}

module.exports = new AdminController()