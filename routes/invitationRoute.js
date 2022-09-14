const express = require('express');
const { protect, restrictTo, isLoggedIn } = require('../controllers/authentication');
const { inviteUser, getUserInvitation, acceptInvitation, rejectInvitation } = require('../controllers/inviteUser')
const { joinRoomSession } = require('../controllers/sessionController')
const router = express.Router();

router
    .route('/')
    .get(isLoggedIn, getUserInvitation)
    .post(isLoggedIn, inviteUser)

router
    .route('/accept')
    .patch(isLoggedIn, acceptInvitation, joinRoomSession)

router
    .route('/reject')
    .post(isLoggedIn, rejectInvitation)



module.exports = router;