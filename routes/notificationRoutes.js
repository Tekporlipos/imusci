const express = require('express');
const { protect, restrictTo, isLoggedIn } = require('./../controllers/authentication');
const { getUserNotifications, createNotifications, updateNotification, deleteNotificationByUser, markAsRead } = require('../controllers/notificationController')
const router = express.Router();

router
    .route('/')
    .get(protect, isLoggedIn, restrictTo('user'), getUserNotifications)

router
    .route('/new')
    .post(protect, isLoggedIn, restrictTo('user'), createNotifications)


router
    .route('/clear/:id')
    .delete(protect, isLoggedIn, restrictTo('user'), deleteNotificationByUser)



router
    .route('/opened/:id')
    .patch(protect, isLoggedIn, restrictTo('user'), markAsRead)


router
    .route('/amend/:id')
    .patch(protect, isLoggedIn, restrictTo('user'), updateNotification)


module.exports = router;