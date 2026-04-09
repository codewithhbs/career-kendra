const express = require("express");
const router = express.Router();

const contactController = require("../controllers/contactMessage.controller");

router.post("/", contactController.createContactMessage);

router.get("/", contactController.getAllContactMessages);

router.get("/:id", contactController.getContactMessageById);

router.put("/:id", contactController.updateContactMessage);

router.delete("/:id", contactController.deleteContactMessage);

module.exports = router;