const  Feedback  = require("../models/Feedback");
const StudentGroup = require("../models/StudentGroup");
const Booking = require("../models/Booking");


class FeedbackController {
    submitFeedback = async (req, res) => {
        try {
          const { studentId, mentorId, rating, text } = req.body;
          console.log(studentId, mentorId, rating, text);
      
          if (!studentId || !mentorId || !rating || !text) {
            return res.status(400).json({ error_code: 1, message: "All fields (studentId, mentorId, rating, text) are required!"});
          }
          if(rating < 0 || rating > 5){
            return res.status(400).json({ error_code: 1, message: "Rating has been from 1 to 5!" })
          }
          const validBooking = await StudentGroup.findOne({
            include: [{
              model: Booking,
              where: { mentorId: mentorId }
            }],
            where: { studentId: studentId }
          });
          if (!validBooking) {
            return res.status(403).json({ error_code: 1, message: "Student is not in a group booking with this mentor!" });
          }
          const formatter = new Intl.DateTimeFormat('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
            timeZone: 'Asia/Ho_Chi_Minh'
          });
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
      
          const formattedFeedback = {
            ...newFeedback.get({ plain: true }),
            createdAt: formatter.format(newFeedback.createdAt).replace(/\//g, '-'),
            updatedAt: formatter.format(newFeedback.updatedAt).replace(/\//g, '-')
          };
          return res.status(200).json({
            error_code: 0,
            message: "Feedback submitted successfully",
            feedback: formattedFeedback,
          });
        } catch (error) {
          console.error(error);
          return res.status(500).json({
            error_code: 1,
            message: "An error occurred while submitting feedback",
            error: error.message,
          });
        }
      };
}

module.exports = new FeedbackController();
