const Notification = require('../app/models/Notification');

class NotificationUtils {
  async createNotification(data) {
    try {
      return await Notification.create({
        accountId: data.accountId,
        title: data.title,
        message: data.message,
      });
    } catch (error) {
      throw new Error(`Error creating notification: ${error.message}`);
    }
  }

  async createSystemNotification(accountId, action) {
    const notifications = {
      booking: {
        title: 'New Booking',
        message: 'You have a new booking request'
      },
      message: {
        title: 'New Message',
        message: 'You have received a new message'
      },

    };

    const notificationData = notifications[action];
    if (notificationData) {
      return await this.createNotification({ accountId, ...notificationData });
    }
  }
}

module.exports = new NotificationUtils();