const express = require('express');
const { protect, restrictTo } = require('../controllers/authentication');
const { getAllMessages, createMessage } = require('./../controllers/roomMessage')

const router = express.Router();

router
    .route('/')
    .get(getAllMessages)
    .post(protect, restrictTo('user'), createMessage)




module.exports = router;