const express = require('express');
const { protect, restrictTo, isLoggedIn } = require('./../controllers/authentication');
const { newConversation, getConversation } = require('../controllers/conversation-controller')
const router = express.Router();

router
    .route('/')
    .post(protect, isLoggedIn, restrictTo('user'), getConversation)

router
    .route('/add')
    .post(protect, restrictTo('user'), newConversation)





module.exports = router;