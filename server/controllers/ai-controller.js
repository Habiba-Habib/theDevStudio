const { generateChallenge } = require("../services/groqService");

exports.generateChallengeDraft = async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ message: "Groq API key not configured" });
    }

    const { topic, difficulty, category } = req.body;

    const draft = await generateChallenge({ topic, difficulty, category });

    res.json({ success: true, challenge: draft });
  } catch (err) {
    console.error("Groq error:", err);
    res.status(500).json({
      message: "Failed to generate challenge. Try again.",
    });
  }
};