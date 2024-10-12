const express = require('express');
const router = express.Router();

const FeedbackController  = require('../app/controllers/FeedbackController');
router.post("/submit-feedback", FeedbackController.submitFeedback);

module.exports = router