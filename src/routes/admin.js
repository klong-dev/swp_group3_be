const express = require('express');
const router = express.Router();

const AdminController = require('../app/controllers/AdminController');


router.post('/add-skill', AdminController.addSkill);

module.exports = router;
