const mongoose = require("mongoose");

const friendInvitationSchema = new mongoose.Schema({
    // User sending the invitation
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    // User who is being invited
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Session",
        required: true,
    }

}, { timestamps: true });

module.exports = mongoose.model("UserInvitation", friendInvitationSchema);