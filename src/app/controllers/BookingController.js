const Booking = require('../models/Booking');

const response_status = {
    missing_fields: {
        error_code: 1,
        message: 'Please provide all required fields'
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
            message: 'Internal server error',
            error: error
        }
    }
}
class BookingController {
    async book(req, res) {
        try {
            const bookingData = {
                mentorId: req.body.mentorId,
                size: req.body.size,
                status: 1
            };
            if (!bookingData.mentorId || !bookingData.size) {
                res.status(400).json(response_status.missing_fields);
                return;
            }
            const booking = await Booking.create(bookingData);
            res.status(200).json(response_status.booking_success(booking));
        } catch (error) {
            console.log(error);
            res.status(400).json(response_status.internal_server_error(error));
        }
    }

    async list(req, res) {
        try {
            const bookings = await Booking.findAll();
            res.status(200).json(response_status.list_success(bookings));
        } catch (error) {
            res.status(400).json(response_status.internal_server_error(error));
        }
    }

    async get(req, res) {
        try {
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