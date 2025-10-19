const express = require('express');
const router = express.Router();
const { askGemini } = require('../services/GeminiService'); // ✅ Make sure the path is correct

// Ensure JSON body is parsed
router.use(express.json());

router.post('/', async (req, res) => {
  console.log("✅ Chat route hit with body:", req.body); // Logs incoming message
  const { message } = req.body;

  if (!message) return res.status(400).json({ error: 'Message is required' });

  try {
    const reply = await askGemini(message); // ✅ Calls your Gemini AI service
    res.json({ reply });
  } catch (error) {
    console.error("Error in chat route:", error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;
