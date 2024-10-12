const Skill = require("../models/Skill");
const Mentor = require('../models/Mentor')
const Student = require('../models/Student')
const Semester = require('../models/Semester')
const { Op } = require('sequelize');
class AdminController {
  async addSkill(req, res) {
    try {
      const { name, imgPath } = req.body;  
      console.log(name);
      console.log(imgPath);
      if (!name || !imgPath) {
        return res.status(400).json({
          error_code: 1,
          message: "Name and imgPath are required.",
        });
      }

      const newSkill = await Skill.create({
        name: name,
        imgPath: imgPath,
        status: 1
      });

     
      return res.status(201).json({
        error_code: 0,
        message: "Skill added successfully.",
        skill: newSkill,
      });
    } catch (error) {
      console.error("Error adding skill: ", error);
      return res.status(500).json({
        error_code: 1,
        message: "An error occurred while adding the skill.",
        error: error.message,
      });
    }
  }

  async showMentorList(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = 10;
      const offset = (page - 1) * pageSize;

      const sortField = req.query.sort === 'point' ? 'points' : 'name';
      const sortOrder = sortField === 'points' ? 'DESC' : 'ASC';

      const totalMentors = await Mentor.count();

      const mentorList = await Mentor.findAll({
        order: [[sortField, sortOrder]],
        limit: pageSize,
        offset: offset,
      });

      return res.json({
        error_code: 0,
        totalMentors,
        currentPage: page,
        totalPages: Math.ceil(totalMentors / pageSize),
        mentorList,
      });
    } catch (error) {
      res.status(500).json({ error_code: 1, error });
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

  async startNewSemester(req, res) {
    try {
      let nextName, nextYear
      const currentSemester = await Semester.findOne({
        order: [['createdAt', 'DESC']],
      })

      const currentName = currentSemester.name
      const currentYear = currentSemester.year
      const currentPoint = currentSemester.defaultPoint

      switch (currentName) {
        case "FALL":
          nextName = "SPRING";
          nextYear = currentYear + 1;
          break;
        case "SPRING":
          nextName = "SUMMER";
          nextYear = currentYear;
          break;
        case "SUMMER":
          nextName = "FALL";
          nextYear = currentYear;
          break;
        default:
          return res.status(400).json({ error_code: 1, message: "Invalid current semester name" });
      }
      const newSemester = await Semester.create({
        name: nextName,
        year: nextYear,
        defaultPoint: currentPoint,
        status: 1
      })
      res.status(200).json({ error_code: 0, newSemester })
    } catch (error) {
      return res.status(500).json({ error_code: 1, error });
    }
  }

  async resetStudentPoints(req, res) {
    try {
      const currentSemester = await Semester.findOne({
        order: [['createdAt', 'DESC']],
      });

      if (!currentSemester) {
        return res.status(404).json({ error_code: 1, message: 'Current semester not found' });
      }

      const defaultPoint = currentSemester.defaultPoint;

      const [updatedRows] = await Student.update(
        { point: defaultPoint },
        { where: {} }
      );
      res.status(200).json({ error_code: 0, message: `${updatedRows} students' points were reset to ${defaultPoint}` });
    } catch (error) {
      return res.status(500).json({ error_code: 1, error });
    }
  }

  async setDefaultPointForCurrentSemester(req, res) {
    try {
      const { newDefaultPoint } = req.body;

      if (newDefaultPoint == null) {
        return res.status(400).json({ error_code: 1, message: 'Missing new default point' });
      }

      const currentSemester = await Semester.findOne({
        where: { status: 1 },
        order: [['createdAt', 'DESC']]
      });

      if (!currentSemester) {
        return res.status(404).json({ error_code: 1, message: 'Current semester not found' });
      }

      currentSemester.defaultPoint = newDefaultPoint;
      await currentSemester.save();

      res.status(200).json({ error_code: 0, message: `Default point set to ${newDefaultPoint} for the current semester (${currentSemester.name} ${currentSemester.year})` });
    } catch (error) {
      return res.status(500).json({ error_code: 1, error: error.message });
    }
  }

  async listTopMentors(req, res) {
    try {
      const topMentors = await Mentor.findAll({
        order: [['points', 'DESC']],
        limit: 10,
      });

      if (topMentors.length === 0) {
        return res.status(404).json({ error_code: 1, message: 'No mentors found' });
      }

      res.status(200).json({ error_code: 0, mentors: topMentors });
    } catch (error) {

      res.status(500).json({ error_code: 1, error: error.message });
    }
  }

  async getInactiveMentors(req, res) {
    try {
      const inactiveMentors = await Mentor.findAll({
        where: { status: 0 },
      });
      if (inactiveMentors.length === 0) {
        return res.status(404).json({ error_code: 1, message: 'No inactive mentors found' });
      }
      res.status(200).json({ error_code: 0, mentors: inactiveMentors });
    } catch (error) {
      res.status(500).json({ error_code: 1, error: error.message });
    }
  }

  async disableMentor(req, res) {
    try {
      const mentorId = req.params.id;
      const mentor = await Mentor.findByPk(mentorId);
      if (!mentor) {
        return res.status(404).json({ error_code: 1, message: 'Mentor not found' });
      }
      mentor.status = 0;
      await mentor.save();
      res.status(200).json({ error_code: 0, message: 'Mentor disabled successfully' });
    } catch (error) {
      res.status(500).json({ error_code: 1, error: error.message });
    }
  }

  async searchMentorByName(req, res) {
    try {
      const searchTerm = req.query.name || '';
      const mentorList = await Mentor.findAll({
        where: {
          name: {
            [Op.like]: `%${searchTerm}%`
          }
        },
        order: [['name', 'ASC']],
      });

      if (mentorList.length === 0) {
        return res.status(404).json({ error_code: 1, message: "No mentors found" });
      }

      return res.json({ error_code: 0, mentorList });
    } catch (error) {
      res.status(500).json({ error_code: 1, error });
    }
  }

  async searchMentorByMentorId(req, res) {
    try {
      const mentorId = req.query.mentorId;
      if (!mentorId) {
        return res.status(400).json({ error_code: 1, message: "Mentor ID is required" });
      }
      const mentorList = await Mentor.findAll({
        where: {
          email: {
            [Op.like]: `%${mentorId}%`
          }
        }
      });
      if (mentorList.length === 0) {
        return res.status(404).json({ error_code: 1, message: "No mentors found with the given email" });
      }
      return res.json({ error_code: 0, mentorList });
    } catch (error) {
      res.status(500).json({ error_code: 1, error });
    }
  }

  async searchStudentByName(req, res) {
    try {
      const searchTerm = req.query.name || ''; 
      const studentList = await Student.findAll({
        where: {
          name: {
            [Op.like]: `%${searchTerm}%`
          }
        },
        order: [['name', 'ASC']], 
      });

      if (studentList.length === 0) {
        return res.status(404).json({ error_code: 1, message: "No students found" });
      }

      return res.json({ error_code: 0, studentList });
    } catch (error) {
      return res.status(500).json({ error_code: 1, error });
    }
  }
  async searchStudentByStudentId(req, res) {
    try {
      const studentId = req.query.studentId;
      if (!studentId) {
        return res.status(400).json({ error_code: 1, message: "Student ID is required" });
      }
      const studentList = await Student.findAll({
        where: {
          email: {
            [Op.like]: `%${studentId}%` 
          }
        }
      });

      if (studentList.length === 0) {
        return res.status(404).json({ error_code: 1, message: "No students found with the given email" });
      }

      return res.json({ error_code: 0, studentList });
    } catch (error) {
      return res.status(500).json({ error_code: 1, error });
    }
  }
}

module.exports = new AdminController()