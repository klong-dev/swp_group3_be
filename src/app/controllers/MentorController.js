// controllers/searchController.js
const {Op} = require('sequelize')
const  Mentor  = require('../models/Mentor');
const  SkillMentor  = require('../models/SkillMentor');
const Skill = require('../models/Skill')

// 3 param: skills,star,search
class SearchController {
// SEARCH BY SKILL
    async getMentors(req, res) {
        try {
            const { skill, page = 1, name } = req.query;
            const limit = 10
            const offset = (parseInt(page) - 1) * parseInt(limit);
        
            const skillResult = await Skill.findOne({
                where: { skillName: skill }
            });
            
            if(!skill && !name){
                return res.json([]);
            }
            

            if(!skill){
                const { count, rows: mentors } = await Mentor.findAndCountAll({
                    where: {                       
                        name : {
                             [Op.like]: `%${name}%`
                        }
                        
                    },
                    limit: parseInt(limit),  
                    offset: offset,            
                    order: [
                        ['rating','DESC']
                    ]
                });
                 return res.json({
                    error_code: 0,
                    totalMentors: count,      
                    totalPages: Math.ceil(count / limit),  
                    currentPage: parseInt(page),          
                    mentors: mentors           
                });
            }else{
                const skillID = skillResult.skillID;

          
            const mentorSkills = await SkillMentor.findAll({
                where: { skillID },
                attributes: ['mentorID']  // 
            });
            
            const mentorIDs = mentorSkills.map(mentor => mentor.mentorID);  

            
            const { count, rows: mentors } = await Mentor.findAndCountAll({
                where: {
                    mentorID: mentorIDs,
                    name : {
                         [Op.like]: `%${name}%`
                    }
                    
                },
                limit: parseInt(limit),  
                offset: offset,          
                order: [
                    ['rating','DESC']
                ]
            });
             return res.json({
                totalMentors: count,     
                totalPages: Math.ceil(count / limit),  
                currentPage: parseInt(page),           
                mentors: mentors           
            });
            }
            
            
        } catch (error) {
            console.log(error);
            return res.status(500).json({error_code: 1, message: 'ERROR', error: error.message });
        }
    }
    async loadProfile(req,res){
        try {
            const {id} = req.query;
            const mentor = await Mentor.findOne({
                where: {
                    mentorID: id
                }
            });
            return res.json({mentor})
        } catch (error) {
            console.log(error);
            return res.status(500).json({error_code: 1, message: 'ERROR', error: error.message });
        }
    }
}

module.exports = new SearchController();
