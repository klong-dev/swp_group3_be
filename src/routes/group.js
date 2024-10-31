const express = require('express');
const StudentGroup = require('../app/controllers/StudentGroupController');
const Auth = require('../middleware/AuthenticateJWT')
const router = express.Router();

router.post('/add', StudentGroup.add);
router.get('/get', Auth, StudentGroup.get);
router.get('/accept/:bookingId/:memberId', StudentGroup.accept_group);
router.get('/reject/:bookingId/:memberId', StudentGroup.reject_group);
router.get('/list-invite-group', StudentGroup.getListPendingGroup);

// // router.post('/remove/:id', Auth, StudentGroup.removeStudentById);
// router.get('/get/:studentId?', StudentGroup.get);
// router.get('/get/:mentorId?', StudentGroup.get);
// router.get('/delete/:id', Auth, StudentGroup.delete);

module.exports = router;