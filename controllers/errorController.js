const AppError = require("./../utils/appError");

const handleCastErrorDB = err => {
    //transform wierd error to human readable error
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError(message, 400);
}

const handleDuplicateFields = err => {
    const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
    const message = `Duplicate field value: ${value}. Please use another value`
    return new AppError(message, 400);
}

const handleValidationErrorDb = err => {
    //loop through validation errors
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
}

const handleJWTError = () => new AppError('Invalid token. Please log in again!', 401);
const handleJWTExpiredError = () => new AppError('Your token has expired!. Please log in again!', 401);
const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack

    });
}

const sendErrorProd = (err, res) => {
    //Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message

        });
        //Programming or other unknown error: don't leak error details
    } else {
        //1) log error
        console.error('Error', err);
        res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!'
        })
    }



}


module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);


    } else if (process.env.NODE_ENV === 'production') {
        //e.g duplicate name error in our db
        let error = {...err };
        if (err.name === 'CastError') error = handleCastErrorDB(err);
        if (err.code === 11000) error = handleDuplicateFields(err);
        if (err.name === 'ValidationError') error = handleValidationErrorDb(err);
        if (err.name === 'JsonWebTokenError') error = handleJWTError();
        if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

        sendErrorProd(error, res);
    }



}