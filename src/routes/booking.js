const express = require('express');
const BookingController = require('../app/controllers/BookingController');
const Auth = require('../middleware/AuthenticateJWT');
const router = express.Router();

/**
 * @swagger
 * /book:
 *   post:
 *     summary: Create a new booking
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Booking
 *     requestBody:
 *       description: Booking details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mentorId:
 *                 type: string
 *               studentId:
 *                 type: string
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               size:
 *                 type: integer
 *     responses:
 *       '200':
 *         description: Booking created successfully
 *       '400':
 *         description: Missing required fields
 *       '401':
 *         description: Unauthorized
 */
router.post('/book', Auth, BookingController.book);

/**
 * @swagger
 * /list:
 *   get:
 *     summary: List all bookings
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Booking
 *     parameters:
 *       - name: type
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           enum: [mentor, student]
 *       - name: id
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: A list of bookings
 *       '400':
 *         description: Missing required fields
 *       '401':
 *         description: Unauthorized
 */
router.get('/list', Auth, BookingController.list);

/**
 * @swagger
 * /get/{id}:
 *   get:
 *     summary: Get a booking by ID
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Booking
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Booking details
 *       '400':
 *         description: Missing required fields
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Booking not found
 */
router.get('/get/:id', Auth, BookingController.get);

/**
 * @swagger
 * /update/{id}:
 *   post:
 *     summary: Update a booking by ID
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Booking
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Updated booking details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mentor_id:
 *                 type: string
 *               size:
 *                 type: integer
 *     responses:
 *       '200':
 *         description: Booking updated successfully
 *       '400':
 *         description: Missing required fields
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Booking not found
 */
router.post('/update/:id', Auth, BookingController.update);

/**
 * @swagger
 * /delete/{id}:
 *   get:
 *     summary: Delete a booking by ID
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Booking
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Booking deleted successfully
 *       '400':
 *         description: Missing required fields
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Booking not found
 */
router.get('/delete/:id', Auth, BookingController.delete);

module.exports = router;