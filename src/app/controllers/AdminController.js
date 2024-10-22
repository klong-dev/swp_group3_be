const Skill = require("../models/Skill");

class AdminController {
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
      return res.status(500).json({error_code: 1, message: "An error occurred while adding the skill.",error});
    }
  }
}

module.exports = new AdminController();
