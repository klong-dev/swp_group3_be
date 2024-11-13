const express = require('express');
const Auth = require('../middleware/AuthenticateJWT')
const router = express.Router();

const FeedbackController  = require('../app/controllers/FeedbackController');
router.post("/submit-feedback", Auth, FeedbackController.submitFeedback);
router.post("/check-rated",  FeedbackController.checkIfRated);
module.exports = router