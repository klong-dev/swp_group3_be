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
          [Op.like]: `%${name.trim()}%`,
        };
      }
  
      if (skill && !(Array.isArray(skill) && skill.length === 0)) {
        const skillIds = Array.isArray(skill) ? skill : [skill];
        
        const mentorSkills = await MentorSkill.findAll({
          where: { 
            skillId: skillIds
          },
          attributes: ['mentorId', 'skillId']
        });
  
        // Count how many matching skills each mentor has
        const mentorSkillsCount = mentorSkills.reduce((acc, ms) => {
          acc[ms.mentorId] = (acc[ms.mentorId] || 0) + 1;
          return acc;
        }, {});
  
        // Filter mentors who have all selected skills (count equals total selected skills)
        const targetMentorIds = Object.entries(mentorSkillsCount)
          .filter(([_, count]) => count === skillIds.length)
          .map(([mentorId]) => mentorId);
  
        if (targetMentorIds.length > 0) {
          // Combine name search with skills filter if name search exists
          if (whereCondition.fullName) {
            whereCondition = {
              [Op.and]: [
                { fullName: whereCondition.fullName },
                { id: targetMentorIds }
              ]
            };
          } else {
            whereCondition.id = targetMentorIds;
          }
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
  
      // Create skill name lookup map for better performance
      const skillsMap = skills.reduce((acc, skill) => {
        acc[skill.id] = skill.name;
        return acc;
      }, {});
  
      // Group skills by mentor for easy access
      const mentorSkillsMap = mentorSkills.reduce((acc, ms) => {
        if (!acc[ms.mentorId]) {
          acc[ms.mentorId] = [];
        }
        if (skillsMap[ms.skillId]) {
          acc[ms.mentorId].push(skillsMap[ms.skillId]);
        }
        return acc;
      }, {});
  
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
  
      const parsedRating = parseFloat(rating) || 0;
      mentorsWithDetails = mentorsWithDetails
        .filter((mentor) => mentor.averageRating >= parsedRating)
        // Sort by rating first, then by number of ratings, finally by points
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
        description: mentor.description,
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
        where: { mentorId: id },
        order: [["createdAt", "DESC"]],
      });
      const formatter = new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'Asia/Ho_Chi_Minh'
      });
      const studentIds = [...new Set(feedbacks.map(feedback => feedback.studentId))];

      const students = await Student.findAll({
        where: {
          id: studentIds
        },
        attributes: ['id', 'fullName']
      });

      const studentMap = students.reduce((acc, student) => {
        acc[student.id] = student.fullName;
        return acc;
      }, {});
  
      const formattedFeedbacks = feedbacks.map(feedback => ({
        studentName: studentMap[feedback.studentId] || 'Unknown',
        ...feedback.get({ plain: true }),
        createdAt: formatter.format(new Date(feedback.createdAt)).replace(/\//g, '-'),
        updatedAt: formatter.format(new Date(feedback.updatedAt)).replace(/\//g, '-')
      }));
      const averageRating = this.calculateAverageRating(feedbacks);
  
      return res.json({
        error_code: 0,
        feedbacks: formattedFeedbacks,
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
