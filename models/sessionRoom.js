const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs')

//schema model
const sessionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    roomType: {
        type: String,
        required: true,
        enum: ['public', 'private'],
        default: 'public',
    },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User' },
    photo: String,
    participants: {
        type: [{
            type: Schema.Types.ObjectId,
            ref: 'User',
        }, ],
        required: false,
    },
    guest: {
        type: Array,
    },
    playlist: {
        type: Array,
    },
    role: {
        type: String,
        enum: ['room-admin'],
        default: 'room-admin'
    },
    lock: {

        type: String,
        minlength: 4,
        select: false

    },
    can_invite: {
        type: Boolean,
        default: true
    },
    now_playing: {
        image: { type: String, default: null },
        name: { type: String, default: null },
        at: { type: String, default: null },
        auth: { type: String, default: null },
        audio: { type: String, default: null },
        album: { type: String, default: null },
        pre_view: { type: String, default: null },
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});




//Virtual populate(two way ref for chatMessages)

sessionSchema.virtual('messages', {
    ref: 'Message',
    foreignField: 'session', //referencing the session ids on Message model
    localField: '_id'



});


sessionSchema.pre(/^find/, function(next) { //populate participants field with selected credentials added members

    this.populate({
        path: 'participants',
        select: ['name', 'email', 'photo'],

    });

    next()
});


sessionSchema.pre('save', async function(next) { //encrypts lock provided by user
    if (this.roomType === 'public') {
        this.lock = undefined
        return next()
    } else if (this.roomType === 'private') {

        if (!this.isModified('lock')) return next()

        this.lock = await bcrypt.hash(this.lock, 10);
        next()

    }



})

sessionSchema.pre('save', async function(next) { //removes duplicate objects in participants array
    const uniqueIds = new Set();

    this.participants = this.participants.filter(element => {
        const isDuplicate = uniqueIds.has(element.id);

        uniqueIds.add(element.id);

        if (!isDuplicate) {
            return true;
        }

        return false;
    });

    next()

})

sessionSchema.pre('save', async function(next) { //removes duplicate objects in guest array
    const uniqueIds = new Set();

    this.guest = this.guest.filter(element => {
        const isDuplicate = uniqueIds.has(element.id);

        uniqueIds.add(element.id);

        if (!isDuplicate) {
            return true;
        }

        return false;
    });


    next()

})

sessionSchema.methods.correctlock = async function(candidatelock, roomLock) { //compares users provided lock to encrypted version on the document session
    return await bcrypt.compare(candidatelock, roomLock);
}



const Session = mongoose.model('Session', sessionSchema);


module.exports = Session;