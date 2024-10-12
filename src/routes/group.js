const express = require('express');
const StudentGroup = require('../app/controllers/StudentGroupController');
const Auth = require('../middleware/AuthenticateJWT')
const router = express.Router();

router.post('/add', StudentGroup.add);
// // router.post('/remove/:id', Auth, StudentGroup.removeStudentById);
// router.get('/get/:studentId?', StudentGroup.get);
// router.get('/get/:mentorId?', StudentGroup.get);
// router.get('/delete/:id', Auth, StudentGroup.delete);

module.exports = router;