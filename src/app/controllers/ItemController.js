const Item = require('../models/Item');

class ItemController {

  // Create a new item
  async createItem(req, res) {
    try {
      const { name, price, imgPath } = req.body;

      if (!name || !price || !imgPath) {
        return res.json({ error_code: 1, message: "All fields must be filled" });
      }

      const newItem = await Item.create({ name, price, imgPath, status: 1 });
      return res.status(201).json({ error_code: 0, message: "Item created successfully", newItem });
    } catch (error) {
      return res.status(500).json({ error_code: 500, error: error.message });
    }
  }

  // Get all items
  async getAllItems(req, res) {
    try {
      const items = await Item.findAll({where: { status: 1 }});
      if (!items || items.length === 0) {
        return res.json({ error_code: 1, message: "No items found." });
      }
      return res.status(200).json({ error_code: 0, items });
    } catch (error) {
      return res.status(500).json({ error_code: 500, error: error.message });
    }
  }

  // Get item by ID
  async getItemById(req, res) {
    try {
      const { id } = req.params;

      const item = await Item.findByPk(id);
      if (!item) {
        return res.json({ error_code: 1, message: "Item not found." });
      }

      return res.status(200).json({ error_code: 0, item });
    } catch (error) {
      return res.status(500).json({ error_code: 500, error: error.message });
    }
  }

  // Update item by ID
  async updateItem(req, res) {
    try {
      const { id, name, price, imgPath, status } = req.body;

      const item = await Item.findByPk(id);
      if (!item) {
        return res.json({ error_code: 1, message: "Item not found." });
      }

      await item.update({ name, price, imgPath, status });
      return res.status(200).json({ error_code: 0, message: "Item updated successfully", item });
    } catch (error) {
      return res.status(500).json({ error_code: 500, error: error.message });
    }
  }

  // Delete item by ID
  async deleteItem(req, res) {
    try {
      const { id } = req.body;

      const item = await Item.findByPk(id);
      if (!item) {
        return res.json({ error_code: 1, message: "Item not found." });
      }
      await item.update({ status: 0 });
      return res.status(200).json({ error_code: 0, message: "Item deleted successfully" });
    } catch (error) {
      return res.status(500).json({ error_code: 500, error: error.message });
    }
  }
}

module.exports = new ItemController();
