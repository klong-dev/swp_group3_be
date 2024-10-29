// controllers/searchController.js
const { Op } = require("sequelize");
const Mentor = require("../models/Mentor");
const Skill = require("../models/Skill");
const MentorSkill = require("../models/MentorSkill");
const Feedback = require("../models/Feedback");
const Student = require("../models/Student");
const Booking = require("../models/Booking");
const MentorSlot = require("../models/MentorSlot");
const StudentGroup = require("../models/StudentGroup");
const {
  calculateAverageRating,
  DateTimeFormat,
} = require("../../utils/MentorUtils");

class SearchController {
  // 4 params: skills,search, rating, page
  getMentors = async (req, res) => {
    try {
      const { skill, page = 1, name = "", rating, dates } = req.query;
      const limit = 10;

      let whereCondition = { status: 1 };

      if (name && name.trim() !== "") {
        whereCondition.fullName = {
          [Op.like]: `%${name.trim()}%`,
        };
      }

      let targetMentorIds = [];
      if (skill && skill.length > 0) {
        const mentorSkills = await MentorSkill.findAll({
          where: {
            skillId: skill,
            status: 1,
          },
        });
        targetMentorIds = mentorSkills.map((ms) => ms.mentorId);

        if (targetMentorIds.length > 0) {
          whereCondition.accountId = targetMentorIds;
        } else {
          return res.json({
            error_code: 0,
            totalMentors: 0,
            totalPages: 0,
            currentPage: parseInt(page),
            mentors: [],
          });
        }
      }
      console.log(whereCondition);

      const { rows: mentors } = await Mentor.findAndCountAll({
        where: whereCondition,
      });
      console.log(mentors);

      if (mentors.length === 0) {
        return res.json({
          error_code: 0,
          totalMentors: 0,
          totalPages: 0,
          currentPage: parseInt(page),
          mentors: [],
        });
      }

      const mentorIds = mentors.map((mentor) => mentor.accountId);
      console.log(mentorIds);

      const feedbacks = await Feedback.findAll({
        where: {
          mentorId: mentorIds,
          status: 1,
        },
        order: [["createdAt", "DESC"]],
      });

      const mentorSkills = await MentorSkill.findAll({
        where: {
          mentorId: mentorIds,
          status: 1,
        },
      });

      const skillIds = [...new Set(mentorSkills.map((ms) => ms.skillId))];

      const skills = await Skill.findAll({
        where: {
          id: skillIds,
          status: 1,
        },
      });

      const skillsMap = skills.reduce((acc, skill) => {
        acc[skill.id] = skill.name;
        return acc;
      }, {});

      const mentorSkillsMap = mentorSkills.reduce((acc, ms) => {
        if (!acc[ms.mentorId]) {
          acc[ms.mentorId] = [];
        }
        if (skillsMap[ms.skillId]) {
          acc[ms.mentorId].push(skillsMap[ms.skillId]);
        }
        return acc;
      }, {});

      const { Op } = require("sequelize");

      let availableSlots = [];
      const oneDayFromNow = new Date();
      oneDayFromNow.setDate(oneDayFromNow.getHours() + 12); 

      if (dates && Array.isArray(dates) && dates.length > 0) {
        availableSlots = await MentorSlot.findAll({
          where: {
            mentorId: mentorIds,
            status: 1,
            slotStart: {
              [Op.or]: dates.map((date) => ({
                [Op.between]: [`${date} 00:00:00`, `${date} 23:59:59`],
                [Op.gt]: oneDayFromNow,
              })),
            },
          },
        });
      } else {
        availableSlots = await MentorSlot.findAll({
          where: {
            mentorId: mentorIds,
            status: 1,
            slotStart: {
              [Op.gt]: oneDayFromNow, // Only future slots from 1 day ahead
            },
          },
        });
      }

      // const bookedSlots = await Booking.findAll({
      //   where: {
      //     mentorId: mentorIds,
      //     status: 2,
      //   },
      // });

      // const bookedSlotTimes = new Set(
      //   bookedSlots.map((slot) => slot.slotStart)
      // );

      // availableSlots = availableSlots.filter(
      //   (slot) => !bookedSlotTimes.has(slot.slotStart)
      // );

      const mentorAvailableIds = new Set(
        availableSlots.map((slot) => slot.mentorId)
      );

      let mentorsWithDetails = mentors
        .map((mentor) => {
          const mentorFeedbacks = feedbacks.filter(
            (f) => f.mentorId === mentor.accountId
          );

          const averageRating = calculateAverageRating(mentorFeedbacks);
          if (
            dates &&
            dates.length > 0 &&
            !mentorAvailableIds.has(mentor.accountId)
          ) {
            return null;
          }

          const mentorSlots =
            availableSlots
              .filter((slot) => slot.mentorId === mentor.accountId)
              .map((slot) => ({
                slotStart: DateTimeFormat(slot.slotStart),
                slotEnd: DateTimeFormat(slot.slotEnd),
                cost: slot.cost,
                size: slot.size,
                description: slot.description,
              })) || [];
          const { accountId, fullName, email, point, imgPath, status } = mentor;
          return {
            accountId,
            fullName,
            email,
            point,
            imgPath,
            status,
            averageRating,
            ratingCount: mentorFeedbacks.length,
            skills: mentorSkillsMap[mentor.accountId] || [],
            availableSlots: mentorSlots,
          };
        })
        .filter((mentor) => mentor !== null);

      mentorsWithDetails.sort((a, b) => {
        const aNearestSlot =
          a.availableSlots.length > 0 ? a.availableSlots[0].slotStart : null;
        const bNearestSlot =
          b.availableSlots.length > 0 ? b.availableSlots[0].slotStart : null;
        if (aNearestSlot && bNearestSlot) {
          return aNearestSlot - bNearestSlot;
        }
        return b.availableSlots.length - a.availableSlots.length;
      });

      if (rating) {
        mentorsWithDetails = mentorsWithDetails.filter(
          (mentor) => mentor.averageRating >= parseFloat(rating)
        );
      }
      const startIndex = (parseInt(page) - 1) * parseInt(limit);
      const paginatedMentors = mentorsWithDetails.slice(
        startIndex,
        startIndex + parseInt(limit)
      );

      return res.json({
        error_code: 0,
        totalMentors: mentorsWithDetails.length,
        totalPages: Math.ceil(mentorsWithDetails.length / limit),
        currentPage: parseInt(page),
        mentors: paginatedMentors,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error_code: 1, message: "ERROR", error });
    }
  };

  //1
  loadProfile = async (req, res) => {
    try {
      const { mentorId } = req.query;
      const mentor = await Mentor.findByPk(mentorId);
      if (!mentor) {
        return res
          .status(404)
          .json({ error_code: 1, message: "Mentor not found" });
      }
      const feedbacks = await Feedback.findAll({
        where: { mentorId },
        order: [["createdAt", "DESC"]],
      });
      const averageRating = calculateAverageRating(feedbacks);
      const mentorSkills = await MentorSkill.findAll({ where: { mentorId } });
      const skillIds = mentorSkills.map((skill) => skill.skillId);
      const skills = await Skill.findAll({
        where: { id: skillIds },
      });
      const skillNames = skills.map((skill) => skill.name);
      const {
        accountId,
        fullName,
        description,
        email,
        point,
        imgPath,
        status,
      } = mentor;
      const mentorWithRating = {
        accountId,
        fullName,
        description,
        email,
        point,
        imgPath,
        status,
        averageRating,
        skills: skillNames,
      };
      return res.json({ error_code: 0, mentor: mentorWithRating });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error_code: 1, message: "ERROR", error });
    }
  };

  //1
  getListFeedback = async (req, res) => {
    try {
      const { mentorId } = req.query;
      const feedbacks = await Feedback.findAll({
        where: { mentorId },
        order: [["createdAt", "DESC"]],
      });
      const studentIds = [
        ...new Set(feedbacks.map((feedback) => feedback.studentId)),
      ];
      const students = await Student.findAll({
        where: { accountId: studentIds },
        attributes: ["accountId", "fullName", "imgPath"],
      });

      const studentMap = students.reduce((acc, student) => {
        acc[student.accountId] = {
          fullName: student.fullName,
          imgPath: student.imgPath,
        };
        return acc;
      }, {});
      const formattedFeedbacks = feedbacks.map((feedback) => {
        const student = studentMap[feedback.studentId] || {
          fullName: "Unknown",
          imgPath: null,
        };

        return {
          ...feedback.get({ plain: true }),
          studentName: student.fullName,
          studentAvatar: student.imgPath,
          createdAt: DateTimeFormat(feedback.createdAt),
          updatedAt: DateTimeFormat(feedback.updatedAt),
        };
      });

      const averageRating = calculateAverageRating(feedbacks);
      return res.json({
        error_code: 0,
        feedbacks: formattedFeedbacks,
        averageRating,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error_code: 1, error });
    }
  };

  //1
  async getMentorSkills(req, res) {
    try {
      const { mentorId } = req.query;
      const mentorSkills = await MentorSkill.findAll({
        where: { mentorId },
      });
      const skillIds = mentorSkills.map((mentorSkill) => mentorSkill.skillId);
      const skills = await Skill.findAll({
        where: { id: skillIds },
      });
      return res.json({ error_code: 0, skills });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ error_code: 1, message: "ERROR", error: error.message });
    }
  }

  //1
  async loadAllSkills(req, res) {
    try {
      const skills = await Skill.findAll();
      const skillsWithMentorCount = await Promise.all(
        skills.map(async (skill) => {
          const count = await MentorSkill.count({
            where: { skillId: skill.id },
          });
          return {
            ...skill.toJSON(),
            mentorCount: count,
          };
        })
      );
      return res.json({ error_code: 0, skills: skillsWithMentorCount });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ error_code: 1, message: "ERROR", error: error.message });
    }
  }
  //0
  ratingStudent = async (req, res) => {
    try {
      const { bookingId, rating } = req.body;

      if (!bookingId || !rating) {
        return res.status(400).json({
          error_code: 1,
          message: "BookingId and rating are required",
        });
      }
      const studentBookings = await StudentGroup.findAll({
        where: { bookingId },
      });

      if (!studentBookings.length) {
        return res.status(404).json({ error_code: 1, error });
      }
      const updatePromises = studentBookings.map((studentBookings) =>
        studentBookings.update({ rating })
      );
      await Promise.all(updatePromises);
      return res.status(200).json({ error_code: 0 });
    } catch (error) {
      console.error("Error rating students:", error);
      return res.status(500).json({ error_code: 1, error });
    }
  };

  editProfile = async (req, res) => {
    try {
      const { skillIds, description, mentorId } = req.body;
      const mentor = await Mentor.findOne({
        where: { accountId: mentorId },
      });
  
      if (!mentor) {
        return res.status(404).json({ error_code: 1, message: "Mentor not found" });
      }
      if (description) {
        await mentor.update({ description });
      }
      if (skillIds && Array.isArray(skillIds) && skillIds.length > 0) {
        await MentorSkill.destroy({ where: { mentorId: mentor.accountId } });
        const newSkills = skillIds.map((skillId) => ({
          mentorId: mentor.accountId,
          skillId,
          status: 1
        }));
        await MentorSkill.bulkCreate(newSkills);
      }
      return res.status(200).json({ error_code: 0, message: "Profile updated successfully" });
    } catch (error) {
      console.error("Error editing profile:", error);
      return res.status(500).json({ error_code: 1, error });
    }
  };
  
}

module.exports = new SearchController();
