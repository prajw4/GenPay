const express = require('express');
const router = express.Router();
const { askGemini } = require('../services/GeminiService'); // ✅ Make sure the path is correct

// Ensure JSON body is parsed
router.use(express.json());

router.post('/', async (req, res) => {
  const { prompt, transactions } = req.body;

  if (!prompt || !transactions) return res.status(400).json({ error: 'Prompt and transactions are required' });

  try {
    const combinedMessage = `
      You are a smart assistant with access to the user's transactions.
      The transactions are: ${JSON.stringify(transactions)}

      Instructions:
      1. If the user asks for transaction details, respond in Markdown with **Date**, **Amount**, **Category**, **Details**, **Status**.
      2. If the user asks questions like sum, average, largest expense, trends, or anything analytical, answer naturally in plain text.
      3. Always answer based on the provided transactions only.

      User prompt: ${prompt}
    `;

    const reply = await askGemini(combinedMessage);
    res.json({ reply });
  } catch (error) {
    console.error("Error in chat route:", error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;
