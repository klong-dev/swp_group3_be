const Semester = require('../models/Semester')
class SemesterController {

  async getLatestSemester(req, res) {
    try {
      const latestSemester = await Semester.findOne({
        order: [['year', 'DESC'], ['id', 'DESC']],
      });

      if (!latestSemester) {
        return res.json({ error_code: 1, message: "No semesters found." });
      }
      return res.status(200).json({ error_code: 0, latestSemester });
    } catch (error) {
      return res.status(500).json({ error_code: 500, error: error.message });
    }
  }
}

module.exports = new SemesterController();
