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
      if ((!skill || (Array.isArray(skill) && skill.length === 0)) && !name) {
        const { count, rows: mentors } = await Mentor.findAndCountAll({
          limit: parseInt(limit),
          offset: offset,
          order: [["point", "DESC"]],
        });
        const mentorIds = mentors.map((mentor) => mentor.id);
        const feedbacks = await Feedback.findAll({
          where: {
            mentorId: mentorIds,
          },
          order: [["createdAt", "DESC"]],
        });
        const ratingData = {};
        feedbacks.forEach((feedback) => {
          const { mentorId, rating } = feedback;

          if (!ratingData[mentorId]) {
            ratingData[mentorId] = { sum: 0, count: 0 };
          }

          ratingData[mentorId].sum += rating;
          ratingData[mentorId].count += 1;
        });

        const mentorsWithRatings = mentors.map((mentor) => {
          const { sum, count } = ratingData[mentor.id] || { sum: 0, count: 0 };
          const averageRating = count > 0 ? sum / count : 0;

          return {
            id: mentor.id,
            accountId: mentor.accountId,
            fullName: mentor.fullName,
            email: mentor.email,
            point: mentor.point,
            imgPath: mentor.imgPath,
            status: mentor.status,
            averageRating: averageRating,
          };
        });
        return res.json({
          error_code: 0,
          totalMentors: count,
          totalPages: Math.ceil(count / limit),
          currentPage: parseInt(page),
          mentors: mentorsWithRatings,
        });
      }
      let mentorIDs = {};
      if (!skill) {
        const { count, rows: mentors } = await Mentor.findAndCountAll({
          where: {
            fullName: {
              [Op.like]: `%${name}%`,
            },
          },
          limit: parseInt(limit),
          offset: offset,
          order: [["point", "DESC"]],
        });
        const mentorIds = mentors.map((mentor) => mentor.id);

        const feedbacks = await Feedback.findAll({
          where: {
            mentorId: mentorIds,
          },
          order: [["createdAt", "DESC"]],
        });

        const ratingData = {};

        feedbacks.forEach((feedback) => {
          const { mentorId, rating } = feedback;

          if (!ratingData[mentorId]) {
            ratingData[mentorId] = { sum: 0, count: 0 };
          }

          ratingData[mentorId].sum += rating;
          ratingData[mentorId].count += 1;
        });

        const averageRatingsArray = Object.keys(ratingData).map((mentorId) => {
          const { sum, count } = ratingData[mentorId];
          const averageRating = count > 0 ? sum / count : 0;

          return {
            mentorId: mentorId,
            averageRating: averageRating,
          };
        });

        const mentorsWithRatings = mentors.map((mentor) => {
          const ratingObject = averageRatingsArray.find(
            (rating) => rating.mentorId === mentor.id.toString()
          );

          const averageRating = ratingObject ? ratingObject.averageRating : 0;

          return {
            id: mentor.id,
            accountId: mentor.accountId,
            fullName: mentor.fullName,
            email: mentor.email,
            point: mentor.point,
            imgPath: mentor.imgPath,
            status: mentor.status,
            averageRating: averageRating,
          };
        });
        return res.json({
          error_code: 0,
          totalMentors: mentorsWithRatings.length,
          totalPages: Math.ceil(mentorsWithRatings.length / limit),
          currentPage: parseInt(page),
          mentors: mentorsWithRatings,
        });
      } else {
        const skillResult = await Skill.findOne({
          where: { name: skill },
        });
        const skillID = skillResult.id;
        const mentorSkills = await MentorSkill.findAll({
          where: {
            skillId: skillID,
          },
        });
        mentorIDs = mentorSkills.map((mentor) => mentor.id);
        const { count, rows: mentors } = await Mentor.findAndCountAll({
          where: {
            id: mentorIDs,
            fullName: {
              [Op.like]: `%${name}%`,
            },
          },
          limit: parseInt(limit),
          offset: offset,
          order: [["point", "DESC"]],
        });

        const mentorIds = mentors.map((mentor) => mentor.id);

        const feedbacks = await Feedback.findAll({
          where: {
            mentorId: mentorIds,
          },
          order: [["createdAt", "DESC"]],
        });

        const ratingData = {};

        feedbacks.forEach((feedback) => {
          const { mentorId, rating } = feedback;

          if (!ratingData[mentorId]) {
            ratingData[mentorId] = { sum: 0, count: 0 };
          }

          ratingData[mentorId].sum += rating;
          ratingData[mentorId].count += 1;
        });

        const averageRatingsArray = Object.keys(ratingData).map((mentorId) => {
          const { sum, count } = ratingData[mentorId];
          const averageRating = count > 0 ? sum / count : 0;

          return {
            mentorId: mentorId,
            averageRating: averageRating,
          };
        });
        const mentorsWithRatings = mentors.map((mentor) => {
          const ratingObject = averageRatingsArray.find(
            (rating) => rating.mentorId === mentor.id.toString()
          );

          const averageRating = ratingObject ? ratingObject.averageRating : 0;

          return {
            id: mentor.id,
            accountId: mentor.accountId,
            fullName: mentor.fullName,
            email: mentor.email,
            point: mentor.point,
            imgPath: mentor.imgPath,
            status: mentor.status,
            averageRating: averageRating,
          };
        });
        return res.json({
          error_code: 0,
          totalMentors: mentorsWithRatings.length,
          totalPages: Math.ceil(mentorsWithRatings.length / limit),
          currentPage: parseInt(page),
          mentors: mentorsWithRatings,
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

      const ratingData = feedbacks.reduce(
        (acc, feedback) => {
          acc.sum += feedback.rating;
          acc.count += 1;
          return acc;
        },
        { sum: 0, count: 0 }
      );

      const averageRating =
        ratingData.count > 0 ? ratingData.sum / ratingData.count : 0;

      const mentorWithRating = {
        id: mentor.id,
        accountId: mentor.accountId,
        fullName: mentor.fullName,
        email: mentor.email,
        point: mentor.point,
        imgPath: mentor.imgPath,
        status: mentor.status,
        averageRating: averageRating,
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

  async getListFeedback(req, res) {
    try {
      const { id } = req.query;
      const feedbacks = await Feedback.findAll({
        where: {
          mentorId: id,
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
  // async skills(id){
  //   const mentorSkills = await MentorSkill.findAll({
  //     where: {
  //       mentoriId: id,
  //     }
  //   });
  //   const skillIds = mentorSkills.map((mentorSkill) => mentorSkill.skillId)
  // }
}

module.exports = new SearchController();
