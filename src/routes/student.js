const express = require('express');
const router = express.Router();
const StudentController = require('../app/controllers/StudentController');
const Auth = require('../middleware/AuthenticateJWT')

/**
 * @swagger
 * /valid:
 *   post:
 *     summary: Validate a student
 *     tags:
 *       - Student
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Validate student by account ID
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
 *         description: Student validation result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error_code:
 *                   type: integer
 *                   example: 0
 *                 student:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: John Doe
 *                 token:
 *                   type: string
 *                   example: "some.jwt.token"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error_code:
 *                   type: integer
 *                   example: 500
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
router.post('/valid', Auth, StudentController.validStudent);

module.exports = router
