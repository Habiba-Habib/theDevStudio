const express = require("express");
const router = express.Router();
const chatbotController = require("../controllers/chatbotController");

router.post("/", chatbotController.sendMessage);

module.exports = router;