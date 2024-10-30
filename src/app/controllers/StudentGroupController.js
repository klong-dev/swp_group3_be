const StudentGroup = require("../models/StudentGroup");
const Student = require("../models/Student");
const Booking = require("../models/Booking");
const Mentor = require("../models/Mentor");
const { invite_group } = require("../../utils/MailSenderUtils");

const response_status = {
  add_success: (data) => {
    return {
      error_code: 0,
      data: data,
      message: "Student added successfully",
    };
  },

  missing_fields: {
    error_code: 1,
    message: "Missing required fields",
  },
  bad_request: {
    error_code: 2,
    message: "Bad Request",
  },
  data_not_found: {
    error_code: 3,
    message: "Data not found",
  },
  full: {
    error_code: 4,
    message: "Group is full",
  },
  permission: {
    error_code: 5,
    message: "You are not allowed to do this action",
  },
  internal_server_error: (error) => {
    return {
      error_code: 9,
      message: error.message,
    };
  },
};

class StudentGroupController {
  async add(req, res) {
    try {
      const studentGroupData = {
        bookingId: req.body.bookingId, // group of
        studentId: req.body.studentId, // who add
        memberMails: req.body.memberMails, // add who
      };
      if (
        !studentGroupData.bookingId ||
        !studentGroupData.studentId ||
        !studentGroupData.memberMails
      ) {
        return res.status(400).json(response_status.missing_fields);
      }

      // check if booking exists
      const booking = await Booking.findByPk(studentGroupData.bookingId);
      if (!booking) {
        return res.status(404).json(response_status.data_not_found);
      }

      // check size of group
      const group = await StudentGroup.findAll({
        where: { bookingId: studentGroupData.bookingId },
      });
      if (group.length >= booking.size) {
        return res.status(400).json(response_status.full);
      }

      // only leader can add member
      const leader = await StudentGroup.findOne({
        where: {
          studentId: studentGroupData.studentId,
          bookingId: studentGroupData.bookingId,
        },
      });

      const student = await Student.findByPk(studentGroupData.studentId);
      if (!student) {
        return res.status(404).json(response_status.data_not_found);
      }

      if (!leader) {
        return res.status(404).json(response_status.data_not_found);
      }
      if (leader.role !== 1) {
        return res.status(400).json(response_status.permission);
      }

      // check if member exists
      let memberNotFound = [];
      let memberExist = [];
      for (const memberMail of studentGroupData.memberMails) {
        const member = await Student.findOne({ where: { email: memberMail } });
        if (!member) {
          memberNotFound.push(memberMail);
        } else {
          memberExist.push(member);
        }
      }
      if (memberNotFound.length > 0) {
        return res.status(404).json({ error_code: 3, message: "Member not found", data: memberNotFound });
      }

      // add member to group
      for (const member of memberExist) {
        await StudentGroup.create({
          bookingId: studentGroupData.bookingId,
          studentId: member.accountId,
          rating: null,
          role: 0, // role 0 is member
          status: 1, // pending invite
        });
        await invite_group(student.email, member.email, studentGroupData.bookingId, member.accountId);
      }
      return res.status(200).json(response_status.add_success(null));
    } catch (error) {
      return res.status(500).json(response_status.internal_server_error(error));
    }
  }

  async accept_group(req, res) {
    try {
      const { bookingId, memberId } = req.params;
      if (!bookingId || !memberId) {
        return res.status(400).json(response_status.missing_fields);
      }
      const studentGroup = await StudentGroup.findOne({
        where: { bookingId: bookingId, studentId: memberId },
      });
      if (!studentGroup) {
        return res.status(404).json(response_status.data_not_found);
      }
      if (studentGroup.status !== 1) {
        return res.status(400).json({ error_code: 2, message: "Access denided" });
      }
      studentGroup.status = 2;
      await studentGroup.save();
      return res.status(200).json({ error_code: 0, message: "Member accepted successfully" });
    } catch (error) {
      return res.status(500).json({ error_code: 5, message: "Internal Server Error", error });
    }
  }

  async reject_group(req, res) {
    try {
      const { bookingId, memberId } = req.params;
      if (!bookingId || !memberId) {
        return res.status(400).json(response_status.missing_fields);
      }
      const studentGroup = await StudentGroup.findOne({
        where: { bookingId: bookingId, studentId: memberId },
      });
      if (!studentGroup) {
        return res.status(404).json(response_status.data_not_found);
      }
      if (studentGroup.status !== 1) {
        return res.status(400).json({ error_code: 2, message: "Access denided" });
      }
      await studentGroup.destroy();
      return res.status(200).json({ error_code: 0, message: "Member rejected successfully" });
    } catch (error) {
      return res.status(500).json({ error_code: 5, message: "Internal Server Error", error });
    }
  }
  
  // async removeStudentById(req, res) {
  //     try {
  //         const studentGroup = await StudentGroup.findOne({ where: { id: req.params.id } });
  //         if (!studentGroup) {
  //             return res.status(404).json({ message: 'Student Group not found' });
  //         }
  //         await studentGroup.destroy();
  //         return res.status(200).json({ message: 'Student Group deleted successfully' });
  //     }
  //     catch (error) {
  //         return res.status(500).json({ message: 'Internal Server Error', error });
  //     }
  // }

  async get(req, res) {
    try {
      const { bookingId } = req.query;
      if (!bookingId) {
        return res.status(400).json(response_status.missing_fields);
      }
      const booking = await Booking.findByPk(bookingId, {
        include: [
          {
            model: Mentor,
            as: "mentor",
          },
        ],
      });
      if (!booking) {
        return json.status(404).json(response_status.data_not_found);
      }
      const mentor = booking.mentor;
      const studentGroup = await StudentGroup.findAll({
        where: { bookingId: bookingId },
        include: [
          {
            model: Student,
            as: "student",
          },
        ],
      });
      if (!studentGroup) {
        return res.status(404).json(response_status.data_not_found);
      }
      return res.status(200).json({ error_code: 0, mentor, group: studentGroup });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error_code: 5, message: "Internal Server Error", error });
    }
  }


}

module.exports = new StudentGroupController();
