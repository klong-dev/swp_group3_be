const express = require('express');
const router = express.Router();

const ItemController = require('../app/controllers/ItemController');
router.get('/list-item', ItemController.getListItems);

module.exports = router
