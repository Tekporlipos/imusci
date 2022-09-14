const hookAsync = require("../utils/hookAsync");
const Notification = require('../models/notification');
const AppError = require("../utils/appError");



exports.getUserNotifications = hookAsync(async(req, res, next) => {

    const searchObj = { userTo: req.user._id };
    const notifications = await Notification.find(searchObj).populate('userFrom')
    res.status(200).json({
        status: 'success',
        results: notifications.length,
        data: {
            notifications
        }

    });


});



exports.createNotifications = hookAsync(async(req, res, next) => {

    const { receiverId, alertMessage, content } = req.body;

    const notifications = await Notification.insertNotification(receiverId, req.user._id, alertMessage, content)

    res.status(200).json({
        status: 'success',
        results: notifications.length,
        data: {
            notifications
        }

    });


});


exports.deleteNotificationByUser = hookAsync(async(req, res, next) => {

    const doc = await Notification.findByIdAndDelete(req.params.id)
    if (!doc) {
        return next(new AppError('No document found with that ID', 404));
    }
    res.status(200).json({
        status: 'success',
        data: null


    });


});

exports.markAsRead = hookAsync(async(req, res, next) => {

    const doc = await Notification.findByIdAndUpdate(req.params.id, { opened: true }, {
        new: true,
        runValidators: true
    })
    if (!doc) {
        return next(new AppError('No document found with that ID', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            doc
        }


    });


});


exports.updateNotification = hookAsync(async(req, res, next) => {

    const doc = await Notification.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })
    if (!doc) {
        return next(new AppError('No document found with that ID', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            doc
        }


    });


});