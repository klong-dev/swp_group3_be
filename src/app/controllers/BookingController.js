const Booking = require('../models/Booking');
const StudentGroup = require('../models/StudentGroup');

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

            // validate slot start
            if (new Date(bookingData.startTime) < new Date()) {
                return res.status(400).json({ error_code: 1, message: 'Slot start must be in the future' });
            } 
            // endTime = startTime + 3 hour
            const endTime = new Date(bookingData.startTime);
            endTime.setHours(endTime.getHours() + 3);

            const booking = await Booking.create({
                mentorId: bookingData.mentorId,
                size: 999,
                startTime: bookingData.startTime,
                endTime: endTime,
                status: 1
            });
            const studentGroup = await StudentGroup.create({
                bookingId: booking.id,
                studentId: bookingData.studentId,
                role: 1,
                status: 1
            });
            res.status(200).json(response_status.booking_success({ booking: booking, studentGroup: studentGroup }));
        } catch (error) {
            console.log(error);
            res.status(400).json(response_status.internal_server_error(error));
        }
    }

    async list(req, res) {
        try {
            const { type, id } = req.params;
            if (!type || !id) {
                return res.status(400).json(response_status.missing_fields);
            }
            if (type === 'mentor') {
                const bookings = await Booking.findAll({ where: { mentorId: id }, raw: true });
                res.status(200).json(response_status.list_success(bookings));
            }
            if (type === 'student') {
                const getGroup = await StudentGroup.findAll({ where: { studentId: id }, raw: true });
                const bookingIdList = getGroup.map(group => group.bookingId);
                const bookings = await Booking.findAll({ where: { id: bookingIdList }, raw: true });
                res.status(200).json(response_status.list_success(bookings));
            }
            
        } catch (error) {
            res.status(400).json({ error: error });
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
                    id: req.params.id
                }
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
                id: req.params.id
                }
            }
            );
            res.status(200).json(response_status.delete_success(booking));
        } catch (error) {
            res.status(400).json(response_status.internal_server_error(error));
        }
    }
}

module.exports = new BookingController();