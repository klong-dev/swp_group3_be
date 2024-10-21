const express = require('express');
const router = express.Router();

const ScheduleController = require('../app/controllers/ScheduleController');

/**
 * @swagger
 * /slots/{mentorId}:
 *   get:
 *     summary: Get all slots for a mentor
 *     tags:
 *       - Schedule
 *     parameters:
 *       - name: mentorId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: A list of slots
 *       '400':
 *         description: Missing required fields
 *       '404':
 *         description: Mentor not found
 *       '500':
 *         description: Internal server error
 */
router.get('/slots/:mentorId', ScheduleController.getMentorSlots);

/**
 * @swagger
 * /slots:
 *   post:
 *     summary: Add a new slot for a mentor
 *     tags:
 *       - Schedule
 *     requestBody:
 *       description: Slot details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               slotStart:
 *                 type: string
 *                 format: date-time
 *               skillId:
 *                 type: string
 *               mentorId:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Slot added successfully
 *       '400':
 *         description: Missing required fields
 *       '404':
 *         description: Mentor or Skill not found
 *       '500':
 *         description: Internal server error
 */
router.post('/slots', ScheduleController.addMentorSlot);

/**
 * @swagger
 * /slots/{slotId}:
 *   put:
 *     summary: Update a slot by ID
 *     tags:
 *       - Schedule
 *     parameters:
 *       - name: slotId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Updated slot details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               slotStart:
 *                 type: string
 *                 format: date-time
 *               skillId:
 *                 type: string
 *               mentorId:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Slot updated successfully
 *       '400':
 *         description: Missing required fields
 *       '404':
 *         description: Mentor or Skill not found
 *       '500':
 *         description: Internal server error
 */
router.put('/slots/:slotId', ScheduleController.updateMentorSlot);

/**
 * @swagger
 * /slots/delete/{slotId}:
 *   put:
 *     summary: Delete a slot by ID
 *     tags:
 *       - Schedule
 *     parameters:
 *       - name: slotId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Slot deleted successfully
 *       '400':
 *         description: Missing required fields
 *       '404':
 *         description: Slot not found
 *       '500':
 *         description: Internal server error
 */
router.put('/slots/delete/:slotId', ScheduleController.deleteMentorSlot);

module.exports = router;