const express = require('express');
const router = express.Router();
const NotificationController = require('../app/controllers/NotificationController');
const Auth = require('../middleware/AuthenticateJWT');

router.post('/create', Auth, NotificationController.create);
router.get('/:accountId', Auth, NotificationController.getUserNotifications);
router.post('/mark-as-read', Auth, NotificationController.markAsRead);
router.post('/mark-all-as-read', Auth, NotificationController.markAllAsRead);
router.post('/delete', Auth, NotificationController.delete);
router.get('/unread-count/:accountId', Auth, NotificationController.getUnreadCount);

module.exports = router;