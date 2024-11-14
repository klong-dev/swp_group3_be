const Notification = require('../models/Notification');
const moment = require('moment');

class NotificationController {
  async create(req, res) {
    try {
      const { accountId, title, message } = req.body;
      if (!accountId || !title || !message) {
        return res.status(400).json({ error_code: 1, message: 'Missing required fields' });
      }
      const notification = await Notification.create({ accountId, title, message });
      return res.status(201).json({ error_code: 0, data: notification });
    } catch (error) {
      return res.status(500).json({ error_code: 2, message: error.message });
    }
  }

  // Get all notifications for a user
  async getUserNotifications(req, res) {
    try {
      const { accountId } = req.params;
      const notifications = await Notification.findAll({
        where: { accountId, status: 1 },
        order: [['createdAt', 'DESC']]
      });
      const formattedNotifications = notifications.map(notification => {
        return {
          ...notification.toJSON(),
          createdAt: moment(notification.createdAt).format('YYYY-MM-DD HH:mm:ss'),
          updatedAt: moment(notification.updatedAt).format('YYYY-MM-DD HH:mm:ss')
        };
      });
      return res.status(200).json({ error_code: 0, notifications: formattedNotifications });
    } catch (error) {
      return res.status(500).json({ error_code: 2, message: error.message });
    }
  }

  // Mark notification as read
  async markAsRead(req, res) {
    try {
      const { id, accountId } = req.body;
      await Notification.update(
        { isRead: true },
        { where: { id, accountId } }
      );
      return res.status(200).json({ error_code: 0, message: 'Notification marked as read' });
    } catch (error) {
      return res.status(500).json({ error_code: 2, message: error.message });
    }
  }

  // Mark all notifications as read
  async markAllAsRead(req, res) {
    try {
      const { accountId } = req.body;
      await Notification.update(
        { isRead: true },
        { where: { accountId, isRead: false } }
      );
      return res.status(200).json({ error_code: 0, message: 'All notifications marked as read' });
    } catch (error) {
      return res.status(500).json({ error_code: 2, message: error.message });
    }
  }

  // Delete notification
  async delete(req, res) {
    try {
      const { id, accountId } = req.body;
      await Notification.update(
        { status: 0 },
        { where: { id, accountId } }
      );
      return res.status(200).json({ error_code: 0, message: 'Notification deleted' });
    } catch (error) {
      return res.status(500).json({ error_code: 2, message: error.message });
    }
  }

  // Get unread count
  async getUnreadCount(req, res) {
    try {
      const { accountId } = req.params;
      const count = await Notification.count({
        where: { accountId, isRead: false, status: 1 }
      });
      return res.status(200).json({ error_code: 0, numberOfUnreadNotifications: count });
    } catch (error) {
      return res.status(500).json({ error_code: 2, message: error.message });
    }
  }
}

module.exports = new NotificationController();