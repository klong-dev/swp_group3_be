const Booking = require("../models/Booking");
const StudentGroup = require("../models/StudentGroup");
const Student = require("../models/Student");
const MentorSlot = require("../models/MentorSlot");
const { Op } = require("sequelize");
const Semester = require("../models/Semester");
const Mentor = require("../models/Mentor");
const TransactionHistory = require("../models/TransactionHistory");
const NotificationUtils = require("../../utils/NotificationUtils");
const Complaint = require("../models/Complaint");
const Feedback = require("../models/Feedback");

const response_status = {
    missing_fields: {
        error_code: 1,
        message: "Please provide all required fields",
    },
    data_not_found: {
        error_code: 2,
        message: "Data not found",
    },
    booking_success: (data) => {
        return {
            error_code: 0,
            data: data,
            message: "Successfully",
        };
    },
    list_success: (data) => {
        return {
            error_code: 0,
            data: data,
            message: "List retrieved successfully",
        };
    },
    get_success: (data) => {
        return {
            error_code: 0,
            data: data,
            message: "Booking retrieved successfully",
        };
    },
    update_success: (data) => {
        return {
            error_code: 0,
            data: data,
            message: "Booking updated successfully",
        };
    },
    delete_success: (data) => {
        return {
            error_code: 0,
            data: data,
            message: "Booking deleted successfully",
        };
    },
    internal_server_error: (error) => {
        return {
            error_code: 7,
            message: "Internal server errors",
            error: error.message,
        };
    },
};

/*
    status: 0 - inactive
    status: 1 - active
*/
class BookingController {
    async book(req, res) {
        try {
            const bookingData = {
                mentorId: req.body.mentorId,
                studentId: req.body.studentId,
                slotId: req.body.slotId,
                status: 1,
            };
            if (!bookingData.mentorId || !bookingData.studentId) {
                res.status(400).json(response_status.missing_fields);
                return;
            }
            // ================ LOAD AND VALIDATE MODEL =============== //
            // check if student and mentor exist
            const student = await Student.findByPk(bookingData.studentId);
            if (!student) {
                return res.status(400).json({ error_code: 1, message: "Student not found" });
            }
            // check if mentor exist
            const mentor = await Mentor.findByPk(bookingData.mentorId);
            if (!mentor) {
                return res.status(400).json({ error_code: 1, message: "Mentor not found" });
            }
            // get latest active semester
            const semester = await Semester.findOne({ order: [["id", "DESC"]], where: { status: 1 } });
            if (!semester) {
                return res.status(400).json({ error_code: 1, message: "No active semester" });
            }
            // get slot
            const slot = await MentorSlot.findByPk(bookingData.slotId);
            if (!slot) {
                return res.status(400).json({ error_code: 1, message: "Slot not exist" });
            }
            // =============================== //

            // ================ VALIDATE =============== //
            // check if slot is available
            if (slot.status === 0) {
                return res.status(400).json({ error_code: 1, message: "Slot not available" });
            }
            // check if slot is in the past
            if (new Date(slot.slotStart) < new Date()) {
                console.log(`${new Date(slot.slotStart)} < ${new Date()}`);
                return res.status(400).json({ error_code: 1, message: "Slot start must be in the future" });
            }
            // check if student has enough point
            if (student.point < semester.slotCost) {
                return res.status(400).json({ error_code: 1, message: "Not enough point" });
            }
            // ========================================= //

            // ================ BOOKING =============== //
            // minus student point by semester default point
            Student.update({ point: student.point - semester.slotCost }, { where: { accountId: bookingData.studentId } });
            Mentor.increment("point", { by: semester.slotCost, where: { accountId: bookingData.mentorId } });
            // update slot status to inactive
            MentorSlot.update({ status: 0 }, { where: { id: bookingData.slotId } });

            // create booking
            const booking = await Booking.create({
                mentorId: bookingData.mentorId,
                size: 999,
                cost: semester.slotCost,
                startTime: slot.slotStart,
                endTime: slot.slotEnd,
                status: 1,
            });
            // create student group
            const studentGroup = await StudentGroup.create({
                bookingId: booking.id,
                studentId: bookingData.studentId,
                role: 1,
                status: 2,
            });

            // notify
            NotificationUtils.createSystemNotification(bookingData.mentorId, "bookingForMentor");
            NotificationUtils.createSystemNotification(bookingData.studentId, "bookingForStudent");

            TransactionHistory.create({
                bookingId: booking.id,
                accountId: bookingData.studentId,
                point: semester.slotCost,
                type: 0,
                description: "Book mentor slot",
            });
            TransactionHistory.create({
                bookingId: booking.id,
                accountId: bookingData.mentorId,
                point: semester.slotCost,
                type: 1,
                description: "Book mentor slot",
            });
            return res.status(200).json(
                response_status.booking_success({
                    booking: {
                        ...booking.toJSON(),
                        startTime: slot.slotStart,
                        endTime: slot.slotEnd,
                    },
                    studentGroup: studentGroup,
                })
            );
            // ========================================= //
        } catch (error) {
            console.log(error);
            res.status(500).json(response_status.internal_server_error(error));
        }
    }

    async cancel(req, res) {
        try {
            const { type, bookingId } = req.params;
            if (!type || !bookingId) {
                return res.status(400).json(response_status.missing_fields);
            }
            const booking = await Booking.findByPk(bookingId);
            if (!booking) {
                return res.status(400).json(response_status.data_not_found);
            }
            if (booking.status !== 1) {
                return res.status(400).json({ error_code: 1, message: "Booking has been cancelled" });
            }

            // update booking status to inactive
            Booking.update({ status: 0 }, { where: { id: booking.id } });
            // update slot status to active
            const isNotExistSameSlot = await MentorSlot.findOne({ where: { slotStart: booking.startTime, mentorId: booking.id, status: 0 } });
            if (!isNotExistSameSlot) {
                MentorSlot.update({ status: 1 }, { where: { slotStart: booking.startTime, mentorId: booking.mentorId, status: 0 } });
            }
            // StudentGroup.update({ status: 0 }, { where: { bookingId: booking.id } });
            // remove and penalty 50% points
            const studentGroup = await StudentGroup.findOne({ where: { bookingId: booking.id, role: 1 } });
            if (type === "mentor") {
                await Mentor.decrement("point", { by: booking.cost + booking.cost / 2, where: { accountId: booking.mentorId } });
                await Student.increment("point", { by: booking.cost, where: { accountId: studentGroup.studentId } });
                TransactionHistory.create({
                    bookingId: booking.id,
                    accountId: booking.mentorId,
                    point: booking.cost + booking.cost / 2,
                    type: 3,
                    description: "Penalty for cancel booking",
                });
                TransactionHistory.create({
                    bookingId: booking.id,
                    accountId: studentGroup.studentId,
                    point: booking.cost,
                    type: 2,
                    description: "Refund booking because mentor cancel",
                });
            }
            return res.status(200).json(response_status.booking_success({ error_code: 0, booking: booking }));
        } catch (error) {
            res.status(500).json(response_status.internal_server_error(error));
        }
    }

    async confirm(req, res) {
        try {
            if (!req.body.bookingId) {
                return res.status(400).json(response_status.missing_fields);
            }
            const booking = await Booking.findByPk(req.body.bookingId);
            if (!booking) {
                return res.status(400).json(response_status.data_not_found);
            }
            if (booking.status === 2) {
                return res.status(400).json({ error_code: 1, message: "Booking already confirmed" });
            }
            if (booking.status === 0) {
                return res.status(400).json({ error_code: 1, message: "Booking is inactive" });
            }
            // update booking status to confirmed
            Booking.update({ status: 1 }, { where: { id: booking.id } });
            return res.status(200).json(response_status.booking_success({ error_code: 0, booking: booking }));
        } catch (error) {
            return res.status(500).json({ error_code: 5, error: error });
        }
    }

    async deny(req, res) {
        try {
            if (!req.body.bookingId) {
                return res.status(400).json(response_status.missing_fields);
            }
            const booking = await Booking.findByPk(req.body.bookingId);
            if (!booking) {
                return res.status(400).json(response_status.data_not_found);
            }
            if (booking.status === 0) {
                return res.status(400).json({ error_code: 1, message: "Booking is inactive" });
            }
            // update booking status to inactive
            Booking.update({ status: 0 }, { where: { id: booking.id } });
            return res.status(200).json(response_status.booking_success({ error_code: 0, booking: booking }));
        } catch (error) {
            return res.status(500).json({ error_code: 5, error: error });
        }
    }

    async listAll(req, res) {
        try {
            const { type, id } = req.params;
            if (!type || !id) {
                return res.status(400).json(response_status.missing_fields);
            }
            if (type === "mentor") {
                const bookings = await Booking.findAll({
                    where: {
                        mentorId: id,
                    },
                    include: [
                        {
                            model: StudentGroup,
                            as: "studentGroups",
                            where: { status: 2 },
                            include: [
                                {
                                    model: Student,
                                    as: "student",
                                },
                            ],
                        },
                    ],
                    order: [["startTime", "ASC"]],
                });
                res.status(200).json(response_status.list_success(bookings));
            }
            if (type === "student") {
                const getGroup = await StudentGroup.findAll({
                    where: { studentId: id, status: 2 },
                    raw: true,
                });
                const bookingIdList = getGroup.map((group) => group.bookingId);

                const bookings = await Booking.findAll({
                    where: {
                        id: bookingIdList,
                    },
                    include: [
                        {
                            model: Mentor,
                            as: "mentor",
                        },
                        {
                            model: StudentGroup,
                            as: "studentGroups",
                            where: { status: 2, studentId: id },
                        },
                    ],
                    order: [["startTime", "ASC"]],
                });

                for (const booking of bookings) {
                    const feedback = await Feedback.findOne({ where: { mentorId: booking.mentorId, studentId: id } });
                    booking.dataValues.isFeedback = !!feedback;
                }
                res.status(200).json(response_status.list_success(bookings));
            }
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async listUnConfirmed(req, res) {
        try {
            const { mentorId } = req.params;
            if (!mentorId) {
                return res.status(400).json(response_status.missing_fields);
            }
            const bookings = await Booking.findAll({
                where: {
                    mentorId: mentorId,
                    status: 1,
                },
                order: [["startTime", "ASC"]],
            });
            res.status(200).json(response_status.list_success(bookings));
        } catch (error) {
            res.status(500).json(response_status.internal_server_error(error));
        }
    }

    async list(req, res) {
        try {
            const { type, id } = req.params;
            if (!type || !id) {
                return res.status(400).json(response_status.missing_fields);
            }
            if (type === "mentor") {
                const bookings = await Booking.findAll({
                    where: {
                        mentorId: id,
                        startTime: {
                            [Op.gt]: new Date(),
                        },
                    },
                    include: [
                        {
                            model: StudentGroup,
                            as: "studentGroups",
                            where: { status: 2 },
                            include: [
                                {
                                    model: Student,
                                    as: "student",
                                },
                            ],
                        },
                    ],
                });
                res.status(200).json(response_status.list_success(bookings));
            }
            if (type === "student") {
                const getGroup = await StudentGroup.findAll({
                    where: { studentId: id },
                });
                const bookingIdList = getGroup.map((group) => group.bookingId);

                const bookings = await Booking.findAll({
                    where: {
                        id: bookingIdList,
                        startTime: {
                            [Op.gt]: new Date(),
                        },
                    },
                    include: [
                        {
                            model: Mentor,
                            as: "mentor",
                        },
                    ],
                    order: [["startTime", "ASC"]],
                });
                res.status(200).json(response_status.list_success(bookings));
            }
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async get(req, res) {
        try {
            if (!req.params.id) {
                res.status(400).json(response_status.missing_fields);
                return;
            }
            const booking = await Booking.findByPk(req.params.id);
            res.status(200).json(response_status.get_success(booking));
        } catch (error) {
            res.status(400).json(response_status.internal_server_error(error));
        }
    }

    async update(req, res) {
        try {
            const bookingData = {
                mentor_id: req.body.mentor_id,
                size: req.body.size,
            };
            if (!bookingData.mentor_id || !bookingData.size) {
                res.status(400).json(response_status.missing_fields);
                return;
            }
            const booking = await Booking.update(bookingData, {
                where: {
                    id: req.params.id,
                },
            });
            res.status(200).json(response_status.update_success(booking));
        } catch (error) {
            res.status(400).json(response_status.internal_server_error(error));
        }
    }

    async delete(req, res) {
        try {
            const booking = await Booking.update(
                { status: 0 },
                {
                    where: {
                        id: req.params.id,
                    },
                }
            );
            res.status(200).json(response_status.delete_success(booking));
        } catch (error) {
            res.status(400).json(response_status.internal_server_error(error));
        }
    }

    async report(req, res) {
        try {
            const bookings = await Booking.findAll();
            // count all booking
            const countAll = bookings.length;
            // count cancelled booking
            const countCancelled = bookings.filter((booking) => booking.status === 0).length;

            // get all booking that have same mentor
            const mentorList = [];
            const bookingIdList = [];
            bookings.forEach((booking) => {
                if (!mentorList.includes(booking.mentorId)) {
                    bookingIdList.push(booking.id);
                    mentorList.push(booking.mentorId);
                }
            });

            const studentGroup = await StudentGroup.findAll({
                where: {
                    bookingId: bookingIdList,
                    role: 1,
                },
            });
            // count all booking that have same student
            const studentList = [];
            studentGroup.forEach((group) => {
                if (!studentList.includes(group.studentId)) {
                    studentList.push(group.studentId);
                }
            });
            // count students
            const countStudents = await Student.count();

            const complaintCount = await Complaint.count();

            return res.status(200).json({
                total: countAll || 0,
                cancelled: countCancelled || 0,
                cancelledRate: parseFloat((countCancelled / countAll * 100).toFixed(1)) || 0,
                complaint: complaintCount || 0,
                complaintRate: parseFloat((complaintCount / countAll * 100).toFixed(1)) || 0,
                starStudent: studentList.length || 0,
                starStudentRate: parseFloat((studentList.length / countStudents * 100).toFixed(1)) || 0,
            });
        } catch (error) {
            res.status(500).json(response_status.internal_server_error(error));
        }

    }
}

module.exports = new BookingController();
