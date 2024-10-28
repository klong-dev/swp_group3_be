const Booking = require('../models/Booking');
const StudentGroup = require('../models/StudentGroup');
const Student = require('../models/Student');
const MentorSlot = require('../models/MentorSlot');
const { Op } = require('sequelize');
const Semester = require('../models/Semester');
const Mentor = require('../models/Mentor');

Booking.associate({ Mentor });

const response_status = {
    missing_fields: {
        error_code: 1,
        message: 'Please provide all required fields'
    },
    data_not_found: {
        error_code: 2,
        message: 'Data not found'
    },
    booking_success: (data) => {
        return {
            error_code: 0,
            data: data,
            message: 'Successfully'
        }
    },
    list_success: (data) => {
        return {
            error_code: 0,
            data: data,
            message: 'List retrieved successfully'
        }
    },
    get_success: (data) => {
        return {
            error_code: 0,
            data: data,
            message: 'Booking retrieved successfully'
        }
    },
    update_success: (data) => {
        return {
            error_code: 0,
            data: data,
            message: 'Booking updated successfully'
        }
    },
    delete_success: (data) => {
        return {
            error_code: 0,
            data: data,
            message: 'Booking deleted successfully'
        }
    },
    internal_server_error: (error) => {
        return {
            error_code: 7,
            message: 'Internal server errors',
            error: error
        }
    }
}

/*
    status 0: inactive
    status 1: pending
    status 2: confirmed
*/
class BookingController {
    async book(req, res) {
        try {
            const bookingData = {
                mentorId: req.body.mentorId,
                studentId: req.body.studentId,
                startTime: req.body.startTime,
                status: 1
            };
            if (!bookingData.mentorId || !bookingData.studentId || !bookingData.startTime) {
                res.status(400).json(response_status.missing_fields);
                return;
            }

            // ================ LOAD AND VALIDATE MODEL =============== //
            // check if student and mentor exist
            const student = await Student.findByPk(bookingData.studentId);
            if (!student) {
                return res.status(400).json({ error_code: 1, message: 'Student not found' });
            }
            // check if mentor exist
            const mentor = await Mentor.findByPk(bookingData.mentorId);
            if (!mentor) {
                return res.status(400).json({ error_code: 1, message: 'Mentor not found' });
            }
            // get latest active semester
            const semester = await Semester.findOne({ order: [['id', 'DESC']], where: { status: 1 } });
            if (!semester) {
                return res.status(400).json({ error_code: 1, message: 'No active semester' });
            }
            // =============================== //

            // validate slot start
            if (new Date(bookingData.startTime) < new Date()) {
                return res.status(400).json({ error_code: 1, message: 'Slot start must be in the future' });
            }
            bookingData.startTime = new Date(bookingData.startTime);
            // endTime = startTime + slotDuration (hour)
            const endTime = new Date(bookingData.startTime);
            endTime.setHours(endTime.getHours() + Math.round(semester.slotDuration / 60));
            const availableSlot = await MentorSlot.findOne({
                where: {
                    mentorId: bookingData.mentorId,
                    slotStart: bookingData.startTime,
                }
            });
            const isavailable = availableSlot && availableSlot.status === 1;
            if (isavailable) {
                // update slot status to booked
                MentorSlot.update({ status: 0 }, { where: { id: availableSlot.id } });
            }

            // check if student has enough point
            if (student.point < semester.slotCost) {
                return res.status(400).json({ error_code: 1, message: 'Not enough point' });
            }
            // minus student point by semester default point
            Student.update({ point: student.point - semester.slotCost }, { where: { accountId: bookingData.studentId } });

            const booking = await Booking.create({
                mentorId: bookingData.mentorId,
                size: 999,
                startTime: bookingData.startTime,
                endTime: endTime,
                status: 1 + (isavailable ? 1 : 0) // read the status above
            },
            );
            const studentGroup = await StudentGroup.create({
                bookingId: booking.id,
                studentId: bookingData.studentId,
                role: 1,
                status: 1
            });
            res.status(200).json(response_status.booking_success({
                booking: {
                    ...booking.toJSON(),
                    startTime: bookingData.startTime,
                    endTime: endTime
                },
                studentGroup: studentGroup
            }));
        } catch (error) {
            console.log(error);
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
                return res.status(400).json({ error_code: 1, message: 'Booking already confirmed' });
            }
            if (booking.status === 0) {
                return res.status(400).json({ error_code: 1, message: 'Booking is inactive' });
            }
            // update booking status to confirmed
            Booking.update({ status: 2 }, { where: { id: booking.id } });
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
            if (type === 'mentor') {
                const bookings = await Booking.findAll({
                    where: {
                        mentorId: id
                    },
                    include: [
                        {
                            model: Mentor,
                            as: 'mentor'
                        }
                    ],
                    order: [['startTime', 'ASC']],
                });
                res.status(200).json(response_status.list_success(bookings));
            }
            if (type === 'student') {
                const getGroup = await StudentGroup.findAll({
                    where: { studentId: id },
                    raw: true
                });
                const bookingIdList = getGroup.map(group => group.bookingId);

                const bookings = await Booking.findAll({
                    where: {
                        id: bookingIdList,
                    },
                    include: [
                        {
                            model: Mentor,
                            as: 'mentor'
                        }
                    ],
                    order: [['startTime', 'ASC']]
                });
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
                    status: 1
                },
                order: [['startTime', 'ASC']]
            });
            res.status(200).json(response_status.list_success(bookings));
        }
        catch (error) {
            res.status(500).json(response_status.internal_server_error(error));
        }
    }

    async list(req, res) {
        try {
            const { type, id } = req.params;
            if (!type || !id) {
                return res.status(400).json(response_status.missing_fields);
            }
            if (type === 'mentor') {
                const bookings = await Booking.findAll({
                    where: {
                        mentorId: id,
                        startTime: {
                            [Op.gt]: new Date()
                        }
                    },
                    include: [
                        {
                            model: Mentor,
                            as: 'mentor'
                        }
                    ],
                });
                res.status(200).json(response_status.list_success(bookings));
            }
            if (type === 'student') {
                const getGroup = await StudentGroup.findAll({
                    where: { studentId: id },
                });
                const bookingIdList = getGroup.map(group => group.bookingId);

                const bookings = await Booking.findAll({
                    where: {
                        id: bookingIdList,
                        startTime: {
                            [Op.gt]: new Date()
                        }
                    },
                    include: [
                        {
                            model: Mentor,
                            as: 'mentor'
                        }
                    ],
                    order: [['startTime', 'ASC']]
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
}

module.exports = new BookingController();