const express = require('express');
const AdminController = require('../app/controllers/AdminController');
const Auth = require('../middleware/AuthenticateJWT')
const router = express.Router();

/**
 * @swagger
 * /add-skill:
 *   post:
 *     summary: Add a new skill
 *     tags:
 *       - Admin
 *     requestBody:
 *       description: Skill data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "JavaScript"
 *               imgPath:
 *                 type: string
 *                 example: "/images/javascript.png"
 *     responses:
 *       201:
 *         description: Skill added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error_code:
 *                   type: integer
 *                   example: 0
 *                 message:
 *                   type: string
 *                   example: "Skill added successfully."
 *                 skill:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "JavaScript"
 *                     imgPath:
 *                       type: string
 *                       example: "/images/javascript.png"
 *                     status:
 *                       type: integer
 *                       example: 1
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error_code:
 *                   type: integer
 *                   example: 1
 *                 message:
 *                   type: string
 *                   example: "Name and imgPath are required."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error_code:
 *                   type: integer
 *                   example: 1
 *                 message:
 *                   type: string
 *                   example: "An error occurred while adding the skill."
 *                 error:
 *                   type: string
 *                   example: "Error message"
 */
router.post('/add-skill', AdminController.addSkill);

/**
 * @swagger
 * /mentor-list:
 *   get:
 *     summary: Get list of mentors
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of mentors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error_code:
 *                   type: integer
 *                   example: 0
 *                 mentorList:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       fullName:
 *                         type: string
 *                         example: "John Doe"
 *                       email:
 *                         type: string
 *                         example: "john.doe@example.com"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error_code:
 *                   type: integer
 *                   example: 1
 *                 error:
 *                   type: string
 *                   example: "Error message"
 */
router.get('/mentor-list', Auth, AdminController.showMentorList);

/**
 * @swagger
 * /student-list:
 *   get:
 *     summary: Get list of students
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of students
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error_code:
 *                   type: integer
 *                   example: 0
 *                 studentList:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       fullName:
 *                         type: string
 *                         example: "Jane Doe"
 *                       email:
 *                         type: string
 *                         example: "jane.doe@example.com"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error_code:
 *                   type: integer
 *                   example: 1
 *                 error:
 *                   type: string
 *                   example: "Error message"
 */
router.get('/student-list', Auth, AdminController.showStudentList);

/**
 * @swagger
 * /promote:
 *   post:
 *     summary: Promote a student to mentor
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Account ID of the student to be promoted
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               accountId:
 *                 type: string
 *                 example: "12345"
 *     responses:
 *       200:
 *         description: Promotion successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error_code:
 *                   type: integer
 *                   example: 0
 *                 message:
 *                   type: string
 *                   example: "Promotion successful"
 *                 mentor:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     fullName:
 *                       type: string
 *                       example: "John Doe"
 *                     email:
 *                       type: string
 *                       example: "john.doe@example.com"
 *                     point:
 *                       type: integer
 *                       example: 50
 *                     imgPath:
 *                       type: string
 *                       example: "/images/john_doe.png"
 *                     status:
 *                       type: integer
 *                       example: 1
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error_code:
 *                   type: integer
 *                   example: 3
 *                 message:
 *                   type: string
 *                   example: "accountId is required"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error_code:
 *                   type: integer
 *                   example: 1
 *                 error:
 *                   type: string
 *                   example: "Error message"
 */
router.post('/promote', Auth, AdminController.promoteToMentor);
router.post('/start-semester', Auth, AdminController.startNewSemester);
router.post('/reset-point', Auth, AdminController.resetStudentPoints);
router.post('/set-default-point', Auth, AdminController.setDefaultPointForCurrentSemester);
router.get('/top-mentors', Auth, AdminController.listTopMentors);
router.get('/inactive-mentors', Auth, AdminController.getInactiveMentors);
router.get('/disable-mentor/:id', Auth, AdminController.disableMentor);
router.get('/search-mentor-by-name', Auth, AdminController.searchMentorByName);
router.get('/search-mentor-by-id', Auth, AdminController.searchMentorByMentorId);
router.get('/search-student-by-name', Auth, AdminController.searchStudentByName);
router.get('/search-student-by-id', Auth, AdminController.searchStudentByStudentId);
router.get('/activate-mentor/:id', Auth, AdminController.activateMentor);

module.exports = router
