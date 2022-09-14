const mongoose = require("mongoose");

const PrivateMessageSchema = mongoose.Schema({
    conversationId: {
        type: String
    },
    senderId: {
        type: String
    },
    receiverId: {
        type: String
    },
    text: {
        type: String
    },
    seen: {
        type: Boolean
    }
}, {
    timestamps: true,
});

const PrivateMessage = mongoose.model("PrivateMessage", PrivateMessageSchema);

module.exports = PrivateMessage;