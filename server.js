const dotenv = require('dotenv')
const mongoose = require('mongoose') //for manipulating our mongodb
const socketio = require('socket.io')

dotenv.config({ path: './config.env' }) // retrieving protected variables from config file

process.on('uncaughtException', err => {
    console.log(err.name, err.message);
    console.log(err);
    console.log('UNHANDLED EXCEPTION 💥 Shutting down...');
    process.exit(1);
})

const app = require('./app')

const PORT = process.env.PORT || 3000;


const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
mongoose.connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true
    }).then(() => console.log('DB connection successfully')) //.catch(err => console.log('error'))


const server = app.listen(PORT, () => {
    console.log(`Server Listening on port ${PORT}`)
});





//handle promise rejection e.g wrong password to our database or errors outside express
//you can change password in config file to test this code

process.on('unhandledRejection', err => {
    console.log(err.name, err.message);
    console.log('UNHANDLED REJECTION 💥 Shutting down...');
    server.close(() => {
        process.exit(1) //abrupt way of ending the program
    })


})


process.on('SIGTERM', () => {
    console.log('SIGTERM RECIEVED, Shutting down👋');
    server.close(() => {
        console.log('💥 Process terminated');
    })
})