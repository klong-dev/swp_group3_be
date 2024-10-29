const express = require('express');
const router = express.Router();

const ItemController = require('../app/controllers/ItemController');

router.post('/create', ItemController.createItem);
router.get('/all', ItemController.getAllItems);
router.get('/:id', ItemController.getItemById);
router.post('/update', ItemController.updateItem);
router.post('/delete', ItemController.deleteItem);

module.exports = router;
