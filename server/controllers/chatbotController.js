const Course = require("../models/Course");
const { askDevStudioAssistant } = require("../services/groqService");

exports.sendMessage = async (req, res) => {
  try {
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        reply: "The chatbot is not configured yet."
      });
    }

    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        reply: "Please type a message first."
      });
    }

    const courses = await Course.find({ isPublished: true })
      .select("title category level price duration")
      .limit(12);

    const reply = await askDevStudioAssistant({
      message: message.trim(),
      courses,
      user: req.session.user || null
    });

    res.json({ reply });
  } catch (error) {
    console.error("Chatbot error:", error);
    res.status(500).json({
      reply: "Sorry, I could not answer right now. Please try again later."
    });
  }
};