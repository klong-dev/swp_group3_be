// controllers/searchController.js
const { Op } = require("sequelize");
const Mentor = require("../models/Mentor");
const Skill = require("../models/Skill");
const MentorSkill = require("../models/MentorSkill");
const Feedback = require("../models/Feedback");
const Student = require("../models/Student");
const { formatTime, formatter, calculateAverageRating } = require("../../utils/MentorUtils");

class SearchController {

  // 4 params: skills,search, rating
  getMentors = async (req, res) => {
    try {
        const { skill, page = 1, name = "", rating } = req.query;
        const limit = 10;

        let whereCondition = {
            status: 1
        };
        if (name && name.trim() !== "") {
            whereCondition.fullName = {
                [Op.like]: `%${name.trim()}%`,
            };
        }
        if (skill && Array.isArray(skill) && skill.length > 0) {
            const mentorSkills = await MentorSkill.findAll({
                where: { 
                    skillId: skill,
                    status: 1
                }
            });
            const mentorSkillCount = mentorSkills.reduce((acc, ms) => {
                acc[ms.mentorId] = (acc[ms.mentorId] || 0) + 1;
                return acc;
            }, {});
            const targetMentorIds = Object.entries(mentorSkillCount)
                .filter(([_, count]) => count === skill.length)
                .map(([mentorId]) => mentorId);

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
        const { rows: mentors } = await Mentor.findAndCountAll({
            where: whereCondition,
        });

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
        const feedbacks = await Feedback.findAll({
            where: {
                mentorId: mentorIds,
                status: 1
            },
            order: [["createdAt", "DESC"]],
        });

        const mentorSkills = await MentorSkill.findAll({
            where: {
                mentorId: mentorIds,
                status: 1
            },
        });
        const skillIds = [...new Set(mentorSkills.map((ms) => ms.skillId))];
        const skills = await Skill.findAll({
            where: {
                id: skillIds,
                status: 1
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

        let mentorsWithDetails = mentors.map((mentor) => {
            const mentorFeedbacks = feedbacks.filter(
                (f) => f.mentorId === mentor.accountId
            );
            
            const ratings = mentorFeedbacks.map(f => f.rating).filter(r => r != null);
            const averageRating = ratings.length > 0 
                ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
                : 0;
            const {accountId, fullName, email, point, imgPath, status} = mentor;
            return {
                accountId,
                fullName,
                email,
                point,
                imgPath,
                status,
                averageRating: parseFloat(averageRating.toFixed(1)),
                ratingCount: ratings.length,
                skills: mentorSkillsMap[mentor.accountId] || [],
            };
        });

        //filter base on rating
        if (rating) {
            mentorsWithDetails = mentorsWithDetails.filter(
                mentor => mentor.averageRating >= parseFloat(rating)
            );
        }
        mentorsWithDetails.sort((a, b) => {
            if (b.averageRating !== a.averageRating) {
                return b.averageRating - a.averageRating;
            }
            if (b.ratingCount !== a.ratingCount) {
                return b.ratingCount - a.ratingCount;
            }
            return b.point - a.point;
        });

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
        return res.status(500).json({ error_code: 1, error });
    }
};

  //1
  loadProfile = async (req, res) => {
    try {
      const { mentorId } = req.query;
      console.log(mentorId);
      
      const mentor = await Mentor.findByPk(mentorId);

      if (!mentor) {
        return res.status(404).json({ error_code: 1, message: "Mentor not found" });
      }
      const feedbacks = await Feedback.findAll({
        where: { mentorId},
        order: [["createdAt", "DESC"]],
      });
      const averageRating = calculateAverageRating(feedbacks);
      const mentorSkills = await MentorSkill.findAll({ where: { mentorId } });
      const skillIds = mentorSkills.map((skill) => skill.skillId);
      const skills = await Skill.findAll({
        where: {id: skillIds}});
      const skillNames = skills.map((skill) => skill.name);
      const { accountId, fullName, description, email, point, imgPath, status } = mentor
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

      return res.json({error_code: 0, mentor: mentorWithRating});
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
        where: {
          accountId: studentIds,
        },
        attributes: ["accountId", "fullName", "imgPath"],
      });

      const studentMap = students.reduce((acc, student) => {
        acc[student.accountId] = {
          fullName: student.fullName,
          imgPath: student.imgPath,
        };
        return acc;
      }, {});
      const formattedFeedbacks =  feedbacks.map((feedback) => {
        const student = studentMap[feedback.studentId] || {
          fullName: "Unknown",
          imgPath: null,
        };
      
      
        return {
          ...feedback.get({ plain: true }),
          studentName: student.fullName,
          studentAvatar: student.imgPath,
          createdAt: formatTime(feedback.createdAt,formatter),
          updatedAt: formatTime(feedback.updatedAt,formatter)
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
      return res.status(500).json({ error_code: 1, error});
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
        where: {id: skillIds },
      });
      return res.json({ error_code: 0, skills });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error_code: 1, message: "ERROR", error: error.message });
    }
  }

  //1
  async loadAllSkills(req, res) {
    try {
      const skills = await Skill.findAll();
      const skillsWithMentorCount = await Promise.all(
        skills.map(async (skill) => {
          const count = await MentorSkill.count({
            where: {
              skillId: skill.id,
            },
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
      return res.status(500).json({ error_code: 1, message: "ERROR", error: error.message });
    }
  }
}

module.exports = new SearchController();
