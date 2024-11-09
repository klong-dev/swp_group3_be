const express = require('express');
const BookingController = require('../app/controllers/BookingController');
const Auth = require('../middleware/AuthenticateJWT')
const router = express.Router();

router.post('/', Auth, BookingController.book);
router.post('/confirm', Auth, BookingController.confirm);
router.post('/deny', Auth, BookingController.deny);
router.get('/list/:type/:id', Auth, BookingController.list);
router.get('/list-all/:type/:id', BookingController.listAll);
router.get('/get/:id', Auth, BookingController.get);
router.post('/update', Auth, BookingController.update);
router.get('/delete/:id', Auth, BookingController.delete);
router.get('/confirm/:mentorId', Auth, BookingController.listUnConfirmed);
router.get('/cancel/:type/:bookingId', Auth, BookingController.cancel);
router.get('/report', BookingController.report);
// router.get('/search-by-mentor', Auth, BookingController.searchByMentor);

module.exports = router;