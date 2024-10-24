const Mentor = require('../models/Mentor');
const Student = require('../models/Student')
const MentorSkill = require('../models/MentorSkill')
class StudentController {
  async getStudentByAccountId(req, res) {
    try {
      const { accountId } = req.query
      if (!accountId) {
        return res.json({ "error_code": 1, "message": "Thiếu ID người dùng" });
      }
      const student = await Student.findOne({ where: { accountId } })
      return res.json({ "error_code": 0, "message": student });
    } catch (error) {
      return res.json({ "error_code": 500, "message": error });
    }
  }

  async validStudent(req, res) {
    try {
      const { accountId, isMentor, token } = req;
      let validUser
      if (isMentor) {
        validUser = await Mentor.findOne({ where: { accountId } })
      } else {
        validUser = await Student.findOne({ where: { accountId } })
      }

      if (!validUser) {
        return res.json({ "error_code": 1, message: 'User is not valid' });
      }
      res.json({ "error_code": 0, user: validUser, token })
    } catch (error) {
      console.log(error);
      res.json({ "error_code": 500, error });
    }
  }

  async applyToBeMentor(req, res) {
    try {
      const { skills, studentId } = req.body;

      if (!Array.isArray(skills) || !studentId) {
        return res.json({ error_code: 1, message: "Skills must be an array and student ID is required." });
      }
      const student = await Student.findOne({ where: { accountId: studentId } });
      if (!student) {
        return res.json({ error_code: 2, message: "Student not found." });
      }

      const { accountId, fullName, email, imgPath } = student;

      const existingApplication = await Mentor.findOne({ where: { accountId } });
      if (existingApplication) {
        return res.status(409).json({ error_code: 3, message: "Application already exists." });
      }
      const applyingMentor = await Mentor.create({
        accountId,
        fullName,
        email,
        imgPath,
        point: 0,
        status: 2, // pending
      });
      const mentorSkills = await Promise.all(
        skills.map(async (skill) => {
          const { skillId, level, status } = skill;
          return await MentorSkill.create({
            skillId,
            mentorId: applyingMentor.id,
            level: level || 1,
            status: status || 1,
          });
        })
      );
      return res.status(201).json({ error_code: 0, applyingMentor, mentorSkills });
    } catch (error) {
      console.error("Error applying to be a mentor:", error);
      return res.status(500).json({ error_code: 4, message: error });
    }
  }

}
module.exports = new StudentController()