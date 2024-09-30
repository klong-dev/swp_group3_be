// controllers/searchController.js
const { Op } = require("sequelize");
const Mentor = require("../models/Mentor");
const Skill = require("../models/Skill");
const MentorSkill = require("../models/MentorSkill");
const Feedback = require("../models/Feedback");
const Student = require("../models/Student");

// 3 param: skills,star,search
class SearchController {
  // SEARCH BY SKILL
  async getMentors(req, res) {
    try {
      const { skill, page = 1, name = "" } = req.query;
      const limit = 10;
      const offset = (parseInt(page) - 1) * parseInt(limit);
      console.log(skill);

      if (!skill && !name) {
        return res.json([]);
      }
      if (!skill) {
        const { count, rows: mentors } = await Mentor.findAndCountAll({
          where: {
            full_name: {
              [Op.like]: `%${name}%`,
            },
          },
          limit: parseInt(limit),
          offset: offset,
          order: [["point", "DESC"]],
        });
        return res.json({
          error_code: 0,
          totalMentors: count,
          totalPages: Math.ceil(count / limit),
          currentPage: parseInt(page),
          mentors: mentors,
        });
      } else {
        const skillResult = await Skill.findOne({
          where: { name: skill },
        });
        const skillID = skillResult.id;
        console.log(skillID);
        const mentorSkills = await MentorSkill.findAll({
          where: {
            skill_id: skillID,
          },
        });
        const mentorIDs = mentorSkills.map((mentor) => mentor.id);
        const { count, rows: mentors } = await Mentor.findAndCountAll({
          where: {
            id: mentorIDs,
            full_name: {
              [Op.like]: `%${name}%`,
            },
          },
          limit: parseInt(limit),
          offset: offset,
          order: [["point", "DESC"]],
        });
        console.log(limit);
        return res.json({
          error_code: 0,
          totalMentors: count,
          totalPages: Math.ceil(count / limit),
          currentPage: parseInt(page),
          mentors: mentors,
        });
      }
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ error_code: 1, message: "ERROR", error: error.message });
    }
  }
  async loadProfile(req, res) {
    try {
      const { id } = req.query;
      console.log(id);
      const mentor = await Mentor.findOne({
        where: {
          id: id,
        },
      });
      return res.json({ error_code: 0, mentor });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ error_code: 1, message: "ERROR", error: error.message });
    }
  }
  async getListFeedback(req, res) {
    try {
      const { id } = req.query;
      const feedbacks = await Feedback.findAll({
        where: {
          mentor_id: id,
        },
        order: [["createdAt", "DESC"]],
      });
      const averageRating =
        feedbacks.length > 0
          ? feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0) /
            feedbacks.length
          : 0;
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
          mentor_id: id,
        },
      });
      const skillIds = mentorSkills.map((mentorSkill) => mentorSkill.skill_id);

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
}

module.exports = new SearchController();
