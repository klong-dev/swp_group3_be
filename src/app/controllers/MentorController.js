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
  
}

module.exports = new SearchController();
