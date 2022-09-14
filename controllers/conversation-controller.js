const Conversation = require('../models/conversation');
const hookAsync = require("../utils/hookAsync");

exports.newConversation = hookAsync(async(req, res, next) => {
    let senderId = req.body.senderId;
    let receiverId = req.body.receiverId;


    const exist = await Conversation.findOne({ members: { $all: [receiverId, senderId] } })

    if (exist) {
        res.status(200).json('conversation already exists');
        return;
    }
    const newConversation = new Conversation({
        members: [senderId, receiverId]
    });

    const savedConversation = await newConversation.save();
    res.status(200).json(savedConversation);

})


exports.getConversation = hookAsync(async(req, res, next) => {

    const conversation = await Conversation.findOne({ members: { $all: [req.body.senderId, req.body.receiverId] } });
    res.status(200).json(conversation);


})