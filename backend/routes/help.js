const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares');
const { askGemini } = require('../services/GeminiService');
const { Faq } = require('../database/db');

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

router.post('/ask', authMiddleware, async (req, res) => {
  const question = (req.body?.question || '').trim();
  if (!question) {
    return res.status(400).json({ message: 'A question is required.' });
  }

  try {
    const terms = question
      .toLowerCase()
      .split(/[^a-z0-9]+/i)
      .filter(Boolean);

    let faqMatches = [];
    if (terms.length) {
      const andBlocks = terms.map(term => {
        const regex = new RegExp(escapeRegex(term), 'i');
        return {
          $or: [
            { question: regex },
            { answer: regex },
            { tags: regex }
          ]
        };
      });

      const query = andBlocks.length ? { $and: andBlocks } : {};
      faqMatches = await Faq.find(query).limit(5).lean();

      if (!faqMatches.length) {
        const regex = new RegExp(escapeRegex(question), 'i');
        faqMatches = await Faq.find({
          $or: [
            { question: regex },
            { answer: regex }
          ]
        }).limit(3).lean();
      }
    } else {
      faqMatches = await Faq.find().limit(3).lean();
    }

    const hasExactFaq = faqMatches.some(faq => faq.question.toLowerCase() === question.toLowerCase());

    const faqContext = faqMatches.length
      ? faqMatches
          .map((faq, idx) => `FAQ ${idx + 1}:\nQ: ${faq.question}\nA: ${faq.answer}`)
          .join('\n\n')
      : 'No matching FAQs were found.';

    const prompt = `You are the GenPay in-app help assistant. Follow these instructions strictly:\n1. If any FAQ fully answers the question, respond with that answer only.\n2. If no FAQ fully answers, craft a fresh numbered, step-by-step answer based on typical GenPay usage.\n3. Keep replies short, friendly, and one or two sentences per step.\n4. Never mention you used an FAQ or that you are an AI; just answer as the assistant.\n\nFAQ context:\n${faqContext}\n\nUser question: ${question}`;

    const aiAnswer = await askGemini(prompt);

    const responseText = hasExactFaq && faqMatches.length
      ? faqMatches.find(faq => faq.question.toLowerCase() === question.toLowerCase())?.answer || aiAnswer
      : aiAnswer;

    res.json({
      answer: responseText,
      faqs: faqMatches
    });
  } catch (error) {
    console.error('[help] failed to process help request', error);
    res.status(500).json({ message: 'Unable to fetch help response.' });
  }
});

module.exports = router;
