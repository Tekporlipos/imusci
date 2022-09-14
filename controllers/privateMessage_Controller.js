const Message = require('../models/privateMessages')
const Conversation = require('../models/conversation');
const Notification = require('../models/notification')
const hookAsync = require('../utils/hookAsync');
const User = require('../models/userModel');


exports.newMessage = hookAsync(async(req, res, next) => {
    const { receiverId, senderId, text } = req.body;
    const newMessage = new Message(req.body);
    await newMessage.save();
    await Conversation.findByIdAndUpdate(req.body.conversationId, { message: req.body.text });


    // await Notification.insertNotification(receiverId, senderId, `new message`, text)

    res.status(200).json("Message has been sent successfully");

})

exports.getMessage = hookAsync(async(req, res, next) => {

    const messages = await Message.find({ conversationId: req.params.id });
    res.status(200).json(messages);
})