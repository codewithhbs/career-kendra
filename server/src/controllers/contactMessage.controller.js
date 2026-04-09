const { ContactMessage } = require("../models");


/* ================= CREATE CONTACT MESSAGE ================= */

exports.createContactMessage = async (req, res) => {
  try {

    const { name, email, phone,  message } = req.body;

    const newMessage = await ContactMessage.create({
      name,
      email,
      phone,
      message,
      ipAddress: req.ip
    });

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: newMessage
    });

  } catch (error) {

    console.error("Create Contact Message Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send message"
    });

  }
};



/* ================= GET ALL CONTACT MESSAGES ================= */

exports.getAllContactMessages = async (req, res) => {
  try {

    const messages = await ContactMessage.findAll({
      order: [["createdAt", "DESC"]]
    });

    return res.status(200).json({
      success: true,
      total: messages.length,
      data: messages
    });

  } catch (error) {

    console.error("Get Contact Messages Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch messages"
    });

  }
};



/* ================= GET SINGLE MESSAGE ================= */

exports.getContactMessageById = async (req, res) => {
  try {

    const { id } = req.params;

    const message = await ContactMessage.findByPk(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: message
    });

  } catch (error) {

    console.error("Get Contact Message Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch message"
    });

  }
};



/* ================= UPDATE MESSAGE ================= */

exports.updateContactMessage = async (req, res) => {
  try {

    const { id } = req.params;

    const message = await ContactMessage.findByPk(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found"
      });
    }

    await message.update(req.body);

    return res.status(200).json({
      success: true,
      message: "Message updated successfully",
      data: message
    });

  } catch (error) {

    console.error("Update Contact Message Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update message"
    });

  }
};



/* ================= DELETE MESSAGE ================= */

exports.deleteContactMessage = async (req, res) => {
  try {

    const { id } = req.params;

    const message = await ContactMessage.findByPk(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found"
      });
    }

    await message.destroy();

    return res.status(200).json({
      success: true,
      message: "Message deleted successfully"
    });

  } catch (error) {

    console.error("Delete Contact Message Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete message"
    });

  }
};