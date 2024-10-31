const { Complaint, Student, Mentor } = require('../models');

class ComplaintController {
  async createComplaint(req, res) {
    try {
      const { studentId, mentorId, content } = req.body;

      const complaint = await Complaint.create({ studentId, mentorId, content });

      return res.json({ error_code: 0, message: 'Complaint created successfully', complaint });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error_code: 1, message: 'Internal server error' });
    }
  }

  // Get student complaints
  async getStudentComplaints(req, res) {
    try {
      const { studentId } = req.params;
      const complaints = await Complaint.findAll({
        where: { studentId },
        include: [{
          model: Mentor,
          attributes: ['accountId', 'fullName', 'email']
        }],
        order: [['createdAt', 'DESC']]
      });
      return res.json({ error_code: 0, complaints });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error_code: 1, message: 'Internal server error' });
    }
  }
}

module.exports = new ComplaintController();