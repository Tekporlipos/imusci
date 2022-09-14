const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require("./../models/userModel");
const hookAsync = require("../utils/hookAsync");
const AppError = require('../utils/appError');

exports.signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}

exports.createSendToken = (user, statusCode, res) => {
    const token = this.signToken(user._id);
    const cookieOptions = {

        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),

        httpOnly: true

    }
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
    res.cookie('jwt', token, cookieOptions);

    user.password = undefined //remove password from response output
    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }

    })
}

//create a user in our database
exports.signup = hookAsync(async(req, res, next) => {

    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });

    this.createSendToken(newUser, 201, res)

});








exports.login = hookAsync(async(req, res, next) => {

    const { email, password } = req.body;

    //1) check if email and password exist
    if (!email || !password) {
        return next(new AppError('Please provide email or password!', 401)); //401 which means unauthoried
    }


    //2) check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password');



    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401))
    }


    //3) If everything is okay, send token to client
    this.createSendToken(user, 200, res);

});



exports.protect = hookAsync(async(req, res, next) => {
    //1)Getting token and if it exist
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {

        token = req.headers.authorization.split(' ')[1];


    } else if (req.cookies.jwt) {
        token = req.cookies.jwt
    }


    if (!token) {
        return next(new AppError('You are not logged in to get access.', 401))
    }

    //2)verification token

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    //console.log(decoded);
    //3) Check if user still exists


    const currentUser = await User.findById(decoded.id) //check id from payload
    if (!currentUser) {
        return next(new AppError('The user belonging to this token does no longer exist', 401))
    }

    //4)Check if use changed password after the token was issued


    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('User recently changed password! Please log in again', 401));
    }

    //Grant access to protected route
    req.user = currentUser;

    next()
})





exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        //roles is an array ['admin','room-admin']. role is now user
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403)) //403 MEANS forbidden
        }
        next();

    }
}


exports.logout = (req, res) => {

    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({ status: 'logged out' });
};


//for rendering and checking user authentication status, no error!
exports.isLoggedIn = async(req, res, next) => {

    console.log('hello', req.cookies)
    if (req.cookies.jwt) {

        try {
            // 1) verify token
            const decoded = await promisify(jwt.verify)(
                req.cookies.jwt,
                process.env.JWT_SECRET
            );

            // 2) Check if user still exists
            const currentUser = await User.findById(decoded.id);
            if (!currentUser) {
                return next();
            }

            // 3) Check if user changed password after the token was issued
            if (currentUser.changedPasswordAfter(decoded.iat)) {
                return next();
            }

            // THERE IS A LOGGED IN USER
            res.locals.user = currentUser;
            req.user = currentUser

            console.log(req.user)
            return next();
        } catch (err) {
            return next();
        }
    }

    next();
};