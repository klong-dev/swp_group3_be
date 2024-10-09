const Mentor = require('../models/Mentor');
const Student = require('../models/Student')
class StudentController {
  async getStudentByAccountId(req, res) {
    try {
      const { accountId } = req.query
      if (!accountId) {
        return res.json({ "error_code": 1, "message": "Thiếu ID người dùng" });
      }
      const student = await Student.findOne({ where: { accountId } })
      return res.json({ "error_code": 0, "message": student });
    } catch (error) {
      return res.json({ "error_code": 500, "message": error });
    }
  }

  async validStudent(req, res) {
    try {
      const { accountId, isMentor, token } = req;
      let validUser
      if (isMentor) {
        validUser = await Mentor.findOne({ where: { accountId } })
      } else {
        validUser = await Student.findOne({ where: { accountId } })
      }

      if (!validUser) {
        return res.json({ "error_code": 1, message: 'User is not valid' });
      }
      res.json({ "error_code": 0, user: validUser, token })
    } catch (error) {
      console.log(error);
      res.json({ "error_code": 500, error });
    }
  }

}
module.exports = new StudentController()