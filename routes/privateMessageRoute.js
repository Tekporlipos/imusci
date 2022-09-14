const express = require('express');
const { protect, restrictTo } = require('./../controllers/authentication');
const { newMessage, getMessage } = require('../controllers/privateMessage_Controller')
const router = express.Router();


router
    .route('/')
    .post(protect, restrictTo('user'), newMessage);

router
    .route('/get/:id')
    .get(protect, restrictTo('user'), getMessage);





module.exports = router;