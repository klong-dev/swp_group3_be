const express = require('express');
const BookingController = require('../app/controllers/BookingController');
const Auth = require('../middleware/AuthenticateJWT')
const router = express.Router();

router.post('/', Auth, BookingController.book);
router.get('/list/:type/:id', Auth, BookingController.list);
router.get('/get/:id', Auth, BookingController.get);
router.post('/update/:id', Auth, BookingController.update);
router.get('/delete/:id', Auth, BookingController.delete);
// router.get('/search-by-mentor', Auth, BookingController.searchByMentor);

module.exports = router;