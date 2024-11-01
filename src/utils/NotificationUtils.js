const Notification = require('../app/models/Notification');
const notifications = require('./NotificationTypes');
class NotificationUtils {
  async createNotification(data) {
    try {
      return await Notification.create({
        accountId: data.accountId,
        title: data.title,
        message: data.message,
        type: data.type
      });
    } catch (error) {
      throw new Error(`Error creating notification: ${error.message}`);
    }
  }

  async createSystemNotification(accountId, action) {
    // get notifications variable from NotificationType.js
    const notificationData = notifications[action];
    if (notificationData) {
      return await this.createNotification({ accountId, ...notificationData });
    }
  }
}

module.exports = new NotificationUtils();