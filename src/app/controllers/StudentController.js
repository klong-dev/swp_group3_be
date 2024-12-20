const Mentor = require('../models/Mentor');
const Student = require('../models/Student')
const Skill = require('../models/Skill')
const MentorSkill = require('../models/MentorSkill')
const NotificationUtils = require('../../utils/NotificationUtils');
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
      return res.json({ "error_code": 500, error: error.message });
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
        if (validUser.isMentor === 1) {
          validUser = await Mentor.findOne({ where: { accountId } })
        }
      }

      if (!validUser) {
        return res.json({ "error_code": 1, message: 'User is not valid' });
      }
      res.json({ "error_code": 0, user: validUser, token })
    } catch (error) {
      console.log(error);
      res.json({ "error_code": 500, error: error.message });
    }
  }

  async applyToBeMentor(req, res) {
    try {
      let mentorSkills
      let applyingMentor
      const { skills, studentId } = req.body;

      if (!Array.isArray(skills) || !studentId) {
        return res.json({ error_code: 1, message: "Skills must be an array and student ID is required." });
      }
      const student = await Student.findOne({ where: { accountId: studentId } });
      if (!student) {
        return res.json({ error_code: 2, message: "Student not found." });
      }

      const { accountId, fullName, email, imgPath } = student;

      const existingApplication = await Mentor.findOne({ where: { accountId, status: 2 } });
      if (existingApplication) {
        return res.status(409).json({ error_code: 3, message: "Application already exists." });
      }

      const existingMentorAccount = await Mentor.findOne({ where: { accountId, status: 0 } })
      if (existingMentorAccount) {
        applyingMentor = await existingMentorAccount.update({
          accountId,
          fullName,
          email,
          imgPath,
          point: 0,
          status: 2,
        });

        mentorSkills = await Promise.all(
          skills.map(async (skill) => {
            const { skillId, level } = skill;
            const [mentorSkill, created] = await MentorSkill.findOrCreate({
              where: {
                skillId,
                mentorId: applyingMentor.accountId,
              },
              defaults: {
                level: level || 1,
                status: 1,
              },
            });

            if (!created) {
              // If the skill already exists, you can update it if needed
              await mentorSkill.update({
                level: level || mentorSkill.level,
                status: 1,
              });
            }

            return mentorSkill;
          })
        );
      } else {
        applyingMentor = await Mentor.create({ accountId, fullName, email, imgPath, point: 0, status: 2, }); // pending
        mentorSkills = await Promise.all(
          skills.map(async (skill) => {
            const { skillId, level } = skill;
            return await MentorSkill.create({
              skillId,
              mentorId: applyingMentor.accountId,
              level: level || 1,
              status: 1,
            });
          })
        );
      }

      await NotificationUtils.createSystemNotification(student.accountId, 'applyToBeMentor')
      return res.status(201).json({ error_code: 0, applyingMentor, mentorSkills });
    } catch (error) {
      console.error("Error applying to be a mentor:", error);
      return res.status(500).json({ error_code: 4, error: error.message });
    }
  }

  async applyingMentors(req, res) {
    try {
      const applyingMentors = await Mentor.findAll({
        where:
          { status: 2 },
        include: {
          model: Skill,
          attributes: ['name'],
          through: { attributes: ['level'] },
        },
      });
      if (!applyingMentors || applyingMentors.length === 0) {
        return res.json({ error_code: 1, message: "No student applying" });
      }
      return res.status(200).json({ error_code: 0, applyingMentors });
    } catch (error) {
      return res.status(500).json({ error_code: 3, error: error.message });
    }
  }

}
module.exports = new StudentController()