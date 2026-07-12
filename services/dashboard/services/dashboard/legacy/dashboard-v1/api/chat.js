// dashboard/api/chat.js
const express = require("express");
const ChatAgent = require("../lib/chat-agent");

const router = express.Router();
const chatAgent = new ChatAgent();

router.post("/chat", async (req, res) => {
  const { message, customerEmail } = req.body;

  if (!message || !customerEmail) {
    return res.status(400).json({ error: "message and customerEmail required" });
  }

  try {
    const response = await chatAgent.chat(message, customerEmail);
    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
