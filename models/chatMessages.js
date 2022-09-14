const mongoose = require('mongoose');
const Session = require('./sessionRoom')
    //parent  referencing

const messageSchema = new mongoose.Schema({
    message: {
        type: String,
        required: [true, 'message can not be empty!']
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    session: {
        type: mongoose.Schema.ObjectId,
        ref: 'Session',
        required: [true, 'message must belong to a a room session']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'message must belong to a user']
    }

}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});


//populate our reference fields on find query

messageSchema.pre(/^find/, function(next) {

    // this.populate({
    //     path: 'session',
    //     select: 'name'
    // })
    this.populate({
        path: 'user',
        select: 'name photo'
    });

    next()
});




const Message = mongoose.model('Message', messageSchema);

module.exports = Message;