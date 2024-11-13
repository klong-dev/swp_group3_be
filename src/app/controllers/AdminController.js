const Mentor = require('../models/Mentor')
const Student = require('../models/Student')
const Semester = require('../models/Semester')
const Admin = require('../models/Admin')
const MentorSkill = require('../models/MentorSkill')
const jwt = require('jsonwebtoken');
const Skill = require("../models/Skill");
const { Op, where } = require('sequelize');
const Complaint = require('../models/Complaint')
const NotificationUtils = require('../../utils/NotificationUtils')
const Donate = require('../models/Donate')
const Item = require('../models/Item')

class AdminController {
  async validAdmin(req, res) {
    try {
      const token = req.headers.authorization;
      const { id } = jwt.verify(token, process.env.JWT_SECRET);
      if (!id) {
        return res.json({ "error_code": 1, message: 'Token is not valid' });
      }
      const validUser = await Admin.findByPk(id);
      if (!validUser) {
        return res.json({ "error_code": 1, message: 'User is not valid' });
      }
      const { password, ...admin } = validUser.dataValues;
      return res.json({ "error_code": 0, user: admin, token })
    } catch (error) {
      console.log(error);
      return res.json({ "error_code": 500, error: error.message });
    }
  }
  async addSkill(req, res) {
    try {
      const { name, imgPath } = req.body;
      if (!name || !imgPath) {
        return res.status(400).json({ error_code: 1, message: "Name and imgPath are required." });
      }
      const newSkill = await Skill.create({
        name: name,
        imgPath: imgPath,
        status: 1
      });
      return res.status(201).json({ error_code: 0, message: "Skill added successfully.", skill: newSkill });
    } catch (error) {
      console.error("Error adding skill: ", error);
      return res.status(500).json({ error_code: 1, message: "An error occurred while adding the skill.", error });
    }
  }

  async showMentorList(req, res) {
    try {
      const mentorList = await Mentor.findAll({
        where: { status: 1 },
        include: {
          model: Skill,
          attributes: ['name'],
          through: { attributes: ['level'] },
        },
      });
      return res.json({ error_code: 0, mentorList });
    } catch (error) {
      console.log(error)
      res.status(500).json({ error_code: 1, error });
    }
  }

  async getPendingMentors(req, res) {
    try {
      const pendingMentors = await Mentor.findAll({
        where: { status: 2 },
        include: {
          model: Skill,
          attributes: ['name'],
          through: { attributes: ['level'] },
        },
      });
      return res.json({ error_code: 0, pendingMentors });
    } catch (error) {
      res.status(500).json({ error_code: 1, error: error.message });
    }
  }

  // fixing
  async showStudentList(req, res) {
    try {
      const studentList = await Student.findAll({ where: { status: 1, isMentor: 0 } });
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

      const existingMentor = await Mentor.findOne({ where: { accountId, status: 1 } });
      if (existingMentor) {
        return res.json({ error_code: 2, message: "Account is already a mentor" });
      }

      await Mentor.update(
        { point: 0, status: 1 },
        { where: { accountId: student.accountId } }
      )
      await NotificationUtils.createSystemNotification(student.accountId, 'promoteToMentor')
      await Student.update(
        { isMentor: 1 },
        { where: { accountId: student.accountId } }
      )
      return res.json({ error_code: 0, message: "Promotion successful" });
    } catch (error) {
      return res.status(500).json({ error_code: 1, error });
    }
  }

  async rejectMentorApplication(req, res) {
    try {
      const { mentorId } = req.body
      const currentApplication = await Mentor.findOne({ where: { accountId: mentorId, status: 2 } })
      await currentApplication.update({ status: 0 })
      await NotificationUtils.createSystemNotification(mentorId, 'rejectMentorApplication')
      res.status(200).json({ error_code: 0, message: "Application rejected" })
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
      const currentCost = currentSemester.slotCost
      const currentDuration = currentSemester.slotDuration

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
        slotCost: currentCost,
        slotDuration: currentDuration,
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
        return res.json({ error_code: 1, message: "There is no mentor" });
      }
      res.status(200).json({ error_code: 0, mentors: inactiveMentors });
    } catch (error) {
      res.status(500).json({ error_code: 2, error: error.message });
    }
  }

  async disableMentor(req, res) {
    try {
      const mentorId = req.params.id;
      const mentor = await Mentor.findByPk(mentorId);
      const student = await Student.findByPk(mentorId)
      if (!mentor) {
        return res.status(404).json({ error_code: 1, message: 'Mentor not found' });
      }
      mentor.status = 0
      student.isMentor = 0
      await mentor.save();
      await student.save();
      await NotificationUtils.createSystemNotification(student.accountId, 'disableMentor')
      res.status(200).json({ error_code: 0, message: 'Mentor disabled successfully' });
    } catch (error) {
      res.status(500).json({ error_code: 1, error: error.message });
    }
  }

  async activateMentor(req, res) {
    try {
      const mentorId = req.params.id;
      const mentor = await Mentor.findByPk(mentorId);
      const student = await Student.findByPk(mentorId);
      if (!mentor || mentor.status === 1) {
        return res.status(404).json({ error_code: 1, message: 'Mentor not found or already active' });
      }
      mentor.status = 1;
      student.isMentor = 1;
      await mentor.save();
      await student.save();
      await NotificationUtils.createSystemNotification(mentor.accountId, 'activateMentor')
      res.status(200).json({ error_code: 0, message: 'Mentor activated successfully' });
    } catch (error) {
      res.status(500).json({ error_code: 1, error });
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

  async validate(req, res, next) {
    try {
      const { username, password } = req.body;
      const user = await Admin.findOne({ where: { username } });

      if (!user) {
        let wrongUsernameMsg = "Username or password is not correct";
        return res.json({ error_code: 1, message: wrongUsernameMsg })
      }
      const valid = password == user.password
      if (valid) {
        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
          expiresIn: '1h',
        });
        return res.json({ "error_code": 0, token });
      } else {
        let wrongPasswordMsg = "Password is not correct";
        return res.json({ "error_code": 2, "message": wrongPasswordMsg });
      }
    } catch (error) {
      return res.json({ "error_code": 3, error });
    }
  }

  // fixing
  async getMentorsAndStudentsQuantity(req, res) {
    try {
      const mentorsCount = await Mentor.count({ where: { status: 1 } });
      const studentsCount = await Student.count({ where: { status: 1, isMentor: 0 } });
      const data = { mentors: mentorsCount, students: studentsCount }
      return res.status(200).json({ error_code: 0, data });
    } catch (error) {
      return res.status(500).json({ error_code: 500, error: error.message });
    }
  }

  async getBookingQuantity(req, res) {
    try {
      const bookingsCount = await Booking.count();
      return res.status(200).json({ error_code: 0, bookings: bookingsCount });
    } catch (error) {
      return res.status(500).json({ error_code: 500, error: error.message });
    }
  }

  // Admin: Update complaint status 1: approved 2: reject
  async updateComplaintStatus(req, res) {
    try {
      const { complaintId, status } = req.body;
      if (!complaintId || !status) {
        return res.json({ error_code: 1, message: 'Please provide complaintId and status' });
      }
      const complaint = await Complaint.findByPk(complaintId);
      if (!complaint) {
        return res.json({ error_code: 1, message: 'Complaint not found' });
      }
      await complaint.update({ status });
      if (status === 1) {
        await NotificationUtils.createSystemNotification(complaint.studentId, 'resolveComplaint')
        await NotificationUtils.createSystemNotification(complaint.mentorId, 'resolveComplaint')
      } else {
        await NotificationUtils.createSystemNotification(complaint.studentId, 'rejectComplaint')
        await NotificationUtils.createSystemNotification(complaint.mentorId, 'rejectComplaint')
      }
      return res.json({ error_code: 0, message: 'Complaint status updated successfully', complaint });
    } catch (error) {
      console.error(error);
      return res.json({ error_code: 5, message: 'Internal server error' });
    }
  }

  async deleteSkill(req, res) {
    try {
      const { id } = req.body;
      const skill = await Skill.findOne({
        where: {
          id,
          status: 1
        }
      });
      if (!skill) {
        return res.status(404).json({ error_code: 1, message: 'Skill not found' });
      }
      const mentorSkills = await MentorSkill.findAll({
        where: {
          skillId: id,
          status: 1
        }
      });
      if (mentorSkills) {
        await MentorSkill.update(
          { status: 0 },
          {
            where: { skillId: id }
          }
        );
      }
      await Skill.update(
        { status: 0 },
        {
          where: { id }
        }
      )
      return res.json({ error_code: 0, message: 'Deleted successfull' })
    } catch (error) {
      console.error(error);
      return res.json({ error_code: 1, message: 'Internal server error' });
    }
  };


  async updateSKill(req, res) {
    try {
      const { id, name } = req.body;
      const skill = await Skill.findOne({
        where: { id }
      });
      if (!skill) {
        return res.status(404).json({ error_code: 1, message: 'Skill not found' });
      }
      await Skill.update(
        { name },
        {
          where: { id }
        }
      )
      return res.json({ error_code: 0, message: 'Update successfull' })
    } catch (error) {
      console.error(error);
      return res.json({ error_code: 1, message: 'Internal server error' });
    }
  }

  async listCheckOut(req, res) {
    const checkOutOrders = await Donate.findAll({
      where: {
        status: 2
      },
    });

    const mentorIdList = [];
    checkOutOrders.forEach(order => {
      if (!mentorIdList.includes(order.mentorId)) {
        mentorIdList.push(order.mentorId);
      }
    });

    const checkOutList = await Mentor.findAll({
      where: {
        accountId: mentorIdList
      },
      include: {
        model: Donate,
        as: 'donates',
        where: {
          status: 2
        },
        attributes: ['id', 'status'],
        include: {
          model: Item,
          as: 'item',
          attributes: ['name', 'price', 'imgPath']
        }
      }
    });

    return res.json({ error_code: 0, checkOutList });
  }

  async confirmCheckOut(req, res) {
    const { mentorId } = req.params;
    if (!mentorId) {
      return res.json({ error_code: 1, message: 'Mentor ID is required' });
    }
    const checkOutOrder = await Donate.findAll({
      where: {
        mentorId,
        status: 2,
      },
      include: {
        model: Item,
        as: 'item',
        attributes: ['price']
      }
    });

    if (!checkOutOrder) {
      return res.json({ error_code: 1, message: 'Check out order not found' });
    }

    await Donate.update(
      { status: 0 },
      {
        where: {
          mentorId,
          status: 2
        }
      }
    );

    return res.json({ error_code: 0, message: 'Check out order confirmed' });
  }

  async rejectCheckOut(req, res) {
    const { mentorId } = req.params;
    if (!mentorId) {
      return res.json({ error_code: 1, message: 'Mentor ID is required' });
    }
    const checkOutOrder = await Donate.findAll({
      where: {
        mentorId,
        status: 2,
      },
      include: {
        model: Item,
        as: 'item',
        attributes: ['price']
      }
    });

    if (!checkOutOrder) {
      return res.json({ error_code: 1, message: 'Check out order not found' });
    }

    await Donate.update(
      { status: 1 },
      {
        where: {
          mentorId,
          status: 2
        }
      }
    );

    return res.json({ error_code: 0, message: 'Check out order rejected' });
  }

  async editStudentPoint(req, res) {
    try {
      const { id, point } = req.body;
      if (!id || !point) {
        return res.json({ error_code: 1, message: 'Please provide studentId and point' });
      }
      const student = await Student.findByPk(id);
      if (!student) {
        return res.json({ error_code: 1, message: 'Student not found' });
      }
      await student.update({ point });
      return res.json({ error_code: 0, message: 'Student point updated successfully', student });
    } catch (error) {
      return res.json({ error_code: 1, message: 'Internal server error' });
    }
  }

  async editMentorPoint(req, res) {
    try {
      const { id, point } = req.body;
      if (!id || !point) {
        return res.json({ error_code: 1, message: 'Please provide mentorId and point' });
      }
      const mentor = await Mentor.findByPk(id);
      if (!mentor) {
        return res.json({ error_code: 1, message: 'Mentor not found' });
      }
      await mentor.update({ point });
      return res.json({ error_code: 0, message: 'Mentor point updated successfully', mentor });
    } catch (error) {
      return res.json({ error_code: 1, message: 'Internal server error' });
    }
  }

  async editSemesterSlotCost(req, res) {
    try {
      const { cost } = req.body;
      if (!cost) {
        return res.json({ error_code: 1, message: 'Please provide cost' });
      }
      const currentSemester = await Semester.findOne({
        order: [['createdAt', 'DESC']],
      });
      if (!currentSemester) {
        return res.json({ error_code: 1, message: 'Semester not found' });
      }
      await currentSemester.update({ slotCost: cost });
      return res.json({ error_code: 0, message: 'Semester slot cost updated successfully', semester: currentSemester });
    }
    catch (error) {
      return res.json({ error_code: 1, message: 'Internal server error' });
    }
  }
}

module.exports = new AdminController()