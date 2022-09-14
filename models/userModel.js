const mongoose = require('mongoose');
const validator = require('validator')
const bcrypt = require('bcryptjs')
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name!']
    },
    email: {
        type: String,
        required: ['true', 'Please provide your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    photo: String,

    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'please confirm password'],
        validate: {
            //This only works on Create and Save!!!
            validator: function(el) {
                return el === this.password;
            },
            message: 'Passwords are not the same!'

        }
    },

    passwordChangedAt: Date,
    role: {
        type: String,
        enum: ['user', 'admin', 'room-admin'],
        default: 'user'
    }

});


userSchema.pre('save', async function(next) {
    //Only run this function if password was actually modified
    if (!this.isModified('password')) return next()

    this.password = await bcrypt.hash(this.password, 12);

    //delete passwordConfirm field
    this.passwordConfirm = undefined;
    next()


})

userSchema.pre('save', async function(next) {
    //default profile picture
    if (!this.photo) {
        this.photo = "https://instagram.fnap3-1.fna.fbcdn.net/v/t51.2885-19/44884218_345707102882519_2446069589734326272_n.jpg?_nc_ht=instagram.fnap3-1.fna.fbcdn.net&_nc_cat=1&_nc_ohc=wSka0ViJGd0AX8Apgjd&edm=ALXcmt0BAAAA&ccb=7-5&ig_cache_key=YW5vbnltb3VzX3Byb2ZpbGVfcGlj.2-ccb7-5&oh=00_AT9kbX7WncY_sNGNdrTvGZ5XeMOgPipzAj9YTMo9B7Qzmg&oe=6317FE8F&_nc_sid=19f95a"
    }
    next()
})





userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
}

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTimestamp;
    }

    //false means not changed
    return false;
}



const User = mongoose.model('User', userSchema);
module.exports = User;