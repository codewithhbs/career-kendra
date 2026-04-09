const { any } = require("zod");
const { Message } = require("../models");

exports.sendMessage = async ({
    applicationId,
    senderId,
    senderType,
    receiverId,
    receiverType,
    content,
    anyLink = null,
}) => {

    return await Message.create({
        applicationId,
        anyLink,
        senderId,
        senderType,
        receiverId,
        receiverType,
        content,
    });

};