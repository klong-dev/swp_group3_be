const Booking = require("../models/Booking");
const StudentGroup = require("../models/StudentGroup");
const Feedback = require("../models/Feedback");
const Student = require("../models/Student");
const { Op } = require("sequelize");
const { formatTime, formatter, DateTimeFormat } = require("../../utils/MentorUtils");
const NotificationUtils = require("../../utils/NotificationUtils");

class FeedbackController {
  submitFeedback = async (req, res) => {
    try {
      const { studentId, mentorId, rating, text } = req.body;

      if (!studentId || !mentorId || !rating) {
        return res.status(400).json({
          error_code: 1,
          message:
            "Please provide studentId, mentorId, and rating for feedback submission.",
        });
      }
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ error_code: 1, message: "Rating must be between 1 and 5." });
      }

      // Verify if the student is in a booking with this mentor
      // const time = DateTimeFormat(new Date());
      // console.log(time);
      
      const validBooking = await StudentGroup.findOne({
        include: [
          {
            model: Booking,
            as: "bookings",
            where: { 
              mentorId: mentorId, 
              status: 1,
              endTime: { [Op.gt]: DateTimeFormat(new Date()) }
            },
          },
        ],
        where: { studentId },
      });
      if (!validBooking) {
        return res.status(403).json({
          error_code: 1,
          message: "Student has not booked with this mentor or the booking is not yet valid for rating",
        });
      }

      const currentDate = new Date();

      const newFeedback = await Feedback.create({
        studentId,
        mentorId,
        rating,
        text,
        createdAt: currentDate,
        updatedAt: currentDate,
        status: 1,
      });

      const feedbackWithStudent = await Feedback.findOne({
        where: {
          mentorId: newFeedback.mentorId,
          studentId: newFeedback.studentId,
        },
        include: [
          {
            model: Student,
            as: "student",
            attributes: ["fullName", "imgPath"],
          },
        ],
      });

      const formattedFeedback = {
        ...feedbackWithStudent.get({ plain: true }),
        createdAt: formatTime(newFeedback.createdAt, formatter),
        updatedAt: formatTime(newFeedback.updatedAt, formatter),
      };
      await NotificationUtils.createSystemNotification(mentorId,'feedbackNotification');
      return res.status(200).json({
        error_code: 0,
        message: "Feedback submitted successfully.",
        feedback: formattedFeedback,
      });
    } catch (error) {
      console.error("Error submitting feedback:", error);
      return res.status(500).json({
        error_code: 1,
        message: "An error occurred while submitting feedback.",
      });
    }
  };
}

module.exports = new FeedbackController();
