const express = require('express');
const { login, logged, getUser, refreshToken } = require('../controllers/spotifyAuth')
const router = express.Router();


router
    .get('/', login)
router
    .get('/logged', logged, getUser)
router
    .get('/refreshToken', refreshToken)






module.exports = router;