// controllers/searchController.js
const { Op } = require("sequelize");
const Mentor = require("../models/Mentor");
const Skill = require("../models/Skill");
const MentorSkill = require("../models/MentorSkill");
const Feedback = require("../models/Feedback");
const Student = require("../models/Student");

class SearchController {
  calculateAverageRating = (feedbacks) => {
    if (feedbacks.length === 0) return 0;
    const sum = feedbacks.reduce((acc, feedback) => acc + feedback.rating, 0);
    return parseFloat((sum / feedbacks.length).toFixed(1));
  };
  // 4 params: skills,search, rating
  getMentors = async (req, res) => {
    try {
      const { skill, page = 1, name = "", rating = 0 } = req.query;
      const limit = 10;

      let whereCondition = {};

      if (name && name.trim() !== "") {
        whereCondition.fullName = {
          [Op.like]: `%${name}%`,
        };
      }

      if (skill && !(Array.isArray(skill) && skill.length === 0)) {
       

        const mentorSkills = await MentorSkill.findAll({
          where: { skillId: skill },
        });

        const targetMentorIds = mentorSkills.map((ms) => ms.mentorId);

        if (targetMentorIds.length > 0) {
          whereCondition.id = targetMentorIds;
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

      const { rows: allMentors } = await Mentor.findAndCountAll({
        where: whereCondition,
      });

      if (allMentors.length === 0) {
        return res.json({
          error_code: 0,
          totalMentors: 0,
          totalPages: 0,
          currentPage: parseInt(page),
          mentors: [],
        });
      }

      const mentorIds = allMentors.map((mentor) => mentor.id);
      const feedbacks = await Feedback.findAll({
        where: {
          mentorId: mentorIds,
        },
        order: [["createdAt", "DESC"]],
      });

      const mentorSkills = await MentorSkill.findAll({
        where: {
          mentorId: mentorIds,
        },
      });

      const skillIds = [...new Set(mentorSkills.map((ms) => ms.skillId))];

      const skills = await Skill.findAll({
        where: {
          id: skillIds,
        },
      });

      const skillsMap = skills.reduce((acc, skill) => {
        acc[skill.id] = skill.name;
        return acc;
      }, {});

      // Create map of skills by mentorId
      const mentorSkillsMap = mentorSkills.reduce((acc, ms) => {
        if (!acc[ms.mentorId]) {
          acc[ms.mentorId] = [];
        }
        if (skillsMap[ms.skillId]) {
          acc[ms.mentorId].push(skillsMap[ms.skillId]);
        }
        return acc;
      }, {});

      // Generate results with ratings and skills
      let mentorsWithDetails = allMentors.map((mentor) => {
        const mentorFeedbacks = feedbacks.filter(
          (f) => f.mentorId === mentor.id
        );
        const averageRating = this.calculateAverageRating(mentorFeedbacks);

        return {
          id: mentor.id,
          accountId: mentor.accountId,
          fullName: mentor.fullName,
          email: mentor.email,
          point: mentor.point,
          imgPath: mentor.imgPath,
          status: mentor.status,
          averageRating,
          ratingCount: mentorFeedbacks.length,
          skills: mentorSkillsMap[mentor.id] || [],
        };
      });

      // Filter by rating and sort by rating
      mentorsWithDetails = mentorsWithDetails
        .filter((mentor) => mentor.averageRating >= rating)
        .sort((a, b) => {
          if (b.averageRating !== a.averageRating) {
            return b.averageRating - a.averageRating;
          }

          if (b.ratingCount !== a.ratingCount) {
            return b.ratingCount - a.ratingCount;
          }

          return b.point - a.point;
        });

      if (mentorsWithDetails.length === 0) {
        return res.json({
          error_code: 0,
          totalMentors: 0,
          totalPages: 0,
          currentPage: parseInt(page),
          mentors: [],
        });
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
      console.log(error);
      return res.status(500).json({
        error_code: 1,
        message: "ERROR",
        error: error.message,
      });
    }
  }

  loadProfile = async (req, res) => {
    try {
      const { id } = req.query;
      const mentor = await Mentor.findOne({
        where: {
          id: id,
        },
      });
  
      if (!mentor) {
        return res.status(404).json({
          error_code: 1,
          message: "Mentor not found",
        });
      }
      const feedbacks = await Feedback.findAll({
        where: {
          mentorId: id,
        },
        order: [["createdAt", "DESC"]],
      });
      const averageRating = this.calculateAverageRating(feedbacks);
  
      
      const mentorSkills = await MentorSkill.findAll({
        where: {
          mentorId: id
        }
      });      
      const skillIds = mentorSkills.map(ms => ms.skillId);
  
    
      const skills = await Skill.findAll({
        where: {
          id: skillIds
        }
      }); 
      const skillNames = skills.map(skill => skill.name);
  
      const mentorWithRating = {
        id: mentor.id,
        accountId: mentor.accountId,
        fullName: mentor.fullName,
        email: mentor.email,
        point: mentor.point,
        imgPath: mentor.imgPath,
        status: mentor.status,
        averageRating,
        skills: skillNames, 
      };
  
      return res.json({
        error_code: 0,
        mentor: mentorWithRating,
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ error_code: 1, message: "ERROR", error: error.message });
    }
  }

  getListFeedback = async (req, res) => {
    try {
      const { id } = req.query;
      const feedbacks = await Feedback.findAll({
        where: {
          mentorId: id,
        },
        order: [["createdAt", "DESC"]],
      });

      const averageRating = this.calculateAverageRating(feedbacks);

      return res.json({
        error_code: 0,
        feedbacks,
        averageRating,
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ error_code: 1, message: "ERROR", error: error.message });
    }
  }
  async getSkills(req, res) {
    try {
      const { id } = req.query;
      const mentorSkills = await MentorSkill.findAll({
        where: {
          mentorId: id,
        },
      });
      const skillIds = mentorSkills.map((mentorSkill) => mentorSkill.skillId);
      const skills = await Skill.findAll({
        where: {
          id: skillIds,
        },
      });
      return res.json({ error_code: 0, skills });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ error_code: 1, message: "ERROR", error: error.message });
    }
  }
  async loadAllSkills(req,res) {
    try {
      console.log(1);
      const skills = await Skill.findAll();
      return res.json(skills);
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ error_code: 1, message: "ERROR", error: error.message });
    }
  }
}

module.exports = new SearchController();
