const express = require('express');
const router = express.Router();

const SemesterController = require('../app/controllers/SemesterController');
router.get('/current', SemesterController.getLatestSemester);

module.exports = router
