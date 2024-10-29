const StudentGroup = require("../models/StudentGroup");
const Student = require("../models/Student");
const Booking = require("../models/Booking");
const Mentor = require("../models/Mentor");

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
      message: error,
    };
  },
};

class StudentGroupController {
  async add(req, res) {
    try {
      const studentGroupData = {
        bookingId: req.body.bookingId, // group of
        studentId: req.body.studentId, // who add
        memberMail: req.body.memberMail, // add who
      };
      if (
        !studentGroupData.bookingId ||
        !studentGroupData.studentId ||
        !studentGroupData.memberMail
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

      
      if (!leader) {
        return res.status(404).json(response_status.data_not_found);
      }
      if (leader.role !== 1) {
        return res.status(400).json(response_status.permission);
      }

      // check if member exists
      const member = await Student.findOne({
        where: { email: studentGroupData.memberMail },
      });
      if (!member) {
        return res.status(404).json(response_status.data_not_found);
      }

      const studentGroup = await StudentGroup.create({
        bookingId: studentGroupData.bookingId,
        studentId: member.accountId,
        groupId: studentGroupData.groupId,
        role: 0, // role 0 is member
        status: 1,
      });
      return res.status(200).json(response_status.add_success(studentGroup));
    } catch (error) {
      return res.status(500).json(response_status.internal_server_error(error));
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
