const Complaint = require('../models/Complaint');
const Mentor = require('../models/Mentor');
const Student = require('../models/Student');

class ComplaintController {
  async createComplaint(req, res) {
    try {
      const { studentId, mentorId, content } = req.body;
      if (!studentId || !mentorId || !content) {
        return res.status(400).json({ error_code: 1, message: 'Please provide studentId, mentorId and content' });
      }
      const complaint = await Complaint.create({ studentId, mentorId, content, status: 0 });

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
      if (!studentId) {
        return res.status(400).json({ error_code: 1, message: 'Please provide studentId' });
      }
      const complaints = await Complaint.findAll({
        where: { studentId },
        include: [{
          model: Mentor,
          as: 'mentor'
        }],
        order: [['createdAt', 'DESC']]
      });
      return res.json({ error_code: 0, complaints });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error_code: 5, message: 'Internal server error' });
    }
  }

  async getComplaintsByStatus(req, res) {
    try {
      const { status } = req.params; // 0: pending, 1: approved
      if (!status) {
        return res.status(400).json({ error_code: 1, message: 'Please provide status' });
      }
      const complaints = await Complaint.findAll({
        where: { status },
        include: [{
          model: Student,
          as: 'student'
        }, {
          model: Mentor,
          as: 'mentor'
        }],
        order: [['createdAt', 'DESC']]
      });
      return res.json({ error_code: 0, complaints });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error_code: 5, message: 'Internal server error', error: error.message });
    }
  }

  async getRejectedComplaints(req, res) {
    try {
      const complaints = await Complaint.findAll({
        where: { status: 2 },
        include: [{
          model: Student,
          as: 'student'
        }, {
          model: Mentor,
          as: 'mentor'
        }],
        order: [['createdAt', 'DESC']]
      });
      return res.json({ error_code: 0, complaints });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error_code: 5, message: 'Internal server error', error: error.message });
    }
  }

  async getApprovedComplaints(req, res) {
    try {
      const complaints = await Complaint.findAll({
        where: { status: 1 },
        include: [{
          model: Student,
          as: 'student'
        }, {
          model: Mentor,
          as: 'mentor'
        }],
        order: [['createdAt', 'DESC']]
      });
      return res.json({ error_code: 0, complaints });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error_code: 5, message: 'Internal server error', error: error.message });
    }
  }

  async getPendingComplaints(req, res) {
    try {
      const complaints = await Complaint.findAll({
        where: { status: 0 },
        include: [{
          model: Student,
          as: 'student'
        }, {
          model: Mentor,
          as: 'mentor'
        }],
        order: [['createdAt', 'DESC']]
      });
      return res.json({ error_code: 0, complaints });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error_code: 5, message: 'Internal server error', error: error.message });
    }
  }

  async acceptComplaint(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ error_code: 1, message: 'Please provide complaint id' });
      }
      const complaint = await Complaint.findByPk(id);
      if (!complaint) {
        return res.status(404).json({ error_code: 1, message: 'Complaint not found' });
      }
      complaint.status = 1;
      await complaint.save();
      return res.json({ error_code: 0, message: 'Complaint accepted' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error_code: 5, message: 'Internal server error', error: error.message });
    }
  }

  async rejectComplaint(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ error_code: 1, message: 'Please provide complaint id' });
      }
      const complaint = await Complaint.findByPk(id);
      if (!complaint) {
        return res.status(404).json({ error_code: 1, message: 'Complaint not found' });
      }
      complaint.status = 2;
      await complaint.save();
      return res.json({ error_code: 0, message: 'Complaint rejected' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error_code: 5, message: 'Internal server error', error: error.message });
    }
  }
}

module.exports = new ComplaintController();