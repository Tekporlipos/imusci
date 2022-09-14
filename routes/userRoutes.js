const express = require('express');
const { signup, login, logout } = require('./../controllers/authentication');
const {
    getAllUsers,
    getUser
} = require('../controllers/userController');

const router = express.Router();


router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);

router.route('/')
    .get(getAllUsers)



router.route('/:id')
    .get(getUser)





module.exports = router;