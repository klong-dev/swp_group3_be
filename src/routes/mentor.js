const express = require('express');
const router = express.Router();

const MentorController = require('../app/controllers/MentorController');

/**
 * @swagger
 * /search:
 *   get:
 *     summary: Search mentors
 *     tags:
 *       - Mentor
 *     description: Search mentors by skill, name, or rating, and paginate the results.
 *     parameters:
 *       - in: query
 *         name: skill
 *         schema:
 *           type: string
 *         description: The skill ID to filter mentors by.
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: The name of the mentor to search.
 *       - in: query
 *         name: rating
 *         schema:
 *           type: number
 *           default: 0
 *         description: The minimum rating to filter mentors.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number for pagination.
 *     responses:
 *       200:
 *         description: Successful search
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error_code:
 *                   type: integer
 *                 totalMentors:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 mentors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       accountId:
 *                         type: string
 *                       fullName:
 *                         type: string
 *                       email:
 *                         type: string
 *                       point:
 *                         type: integer
 *                       imgPath:
 *                         type: string
 *                       status:
 *                         type: string
 *                       averageRating:
 *                         type: number
 *                       ratingCount:
 *                         type: integer
 *                       skills:
 *                         type: array
 *                         items:
 *                           type: string
 *       400:
 *         description: Invalid input or missing parameters.
 *       500:
 *         description: Server error.
 */
router.get('/search', MentorController.getMentors);

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Get mentor profile
 *     tags:
 *       - Mentor
 *     description: Retrieve the mentor profile, including skills and average rating.
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The mentor's ID.
 *     responses:
 *       200:
 *         description: Mentor profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error_code:
 *                   type: integer
 *                   example: 0
 *                 mentor:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     accountId:
 *                       type: string
 *                     fullName:
 *                       type: string
 *                     description:
 *                       type: string
 *                     email:
 *                       type: string
 *                     point:
 *                       type: integer
 *                     imgPath:
 *                       type: string
 *                     status:
 *                       type: string
 *                     averageRating:
 *                       type: number
 *                     skills:
 *                       type: array
 *                       items:
 *                         type: string
 *       404:
 *         description: Mentor not found.
 *       500:
 *         description: Server error.
 */
router.get('/profile', MentorController.loadProfile);

/**
 * @swagger
 * /feedback:
 *   get:
 *     summary: Get feedback list for a mentor
 *     tags:
 *       - Mentor
 *     description: Retrieve all feedbacks for a specific mentor based on mentor ID and calculate the average rating.
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Mentor's ID
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error_code:
 *                   type: integer
 *                   example: 0
 *                 feedbacks:
 *                   type: array
 *                   description: List of feedbacks for the mentor
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: Feedback ID
 *                       mentorId:
 *                         type: string
 *                         description: Mentor's ID
 *                       rating:
 *                         type: number
 *                         description: Rating given in the feedback
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: When the feedback was created
 *                 averageRating:
 *                   type: number
 *                   description: The average rating of the mentor based on feedbacks
 *       400:
 *         description: Bad request - Missing or invalid ID
 *       500:
 *         description: Internal server error
 */
router.get('/feedback', MentorController.getListFeedback);

/**
 * @swagger
 * /skills:
 *   get:
 *     summary: Get skills of a mentor
 *     tags:
 *       - Mentor
 *     description: Retrieve the skills of a specific mentor by mentor ID.
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The mentor's ID.
 *     responses:
 *       200:
 *         description: Successful retrieval of mentor's skills
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error_code:
 *                   type: integer
 *                   example: 0
 *                 skills:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                         description: The skill name
 *       404:
 *         description: Mentor not found.
 *       500:
 *         description: Server error.
 */
router.get('/skills', MentorController.getSkills);

/**
 * @swagger
 * /loadskills:
 *   get:
 *     summary: Get all skills
 *     tags:
 *       - Mentor
 *     description: Retrieve the list of all skills available in the system.
 *     responses:
 *       200:
 *         description: Successful retrieval of all skills
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                     description: The skill name
 *       500:
 *         description: Server error.
 */
router.get('/loadskills', MentorController.loadAllSkills);

module.exports = router;