const express = require('express');
const router = express.Router();
const {authMiddleware} = require('../middlewares'); // your auth middleware
const { buildDashboardStats } = require('../services/InsightService'); // our new service
const { InsightCache } = require('../database/db');

// --- Helper: build AI prompt ---
function buildDashboardPrompt(stats) {
  const { daily, weekly, monthly } = stats;

  const dailyTopCategories = daily.topCategories.map(c => `${c.category} (₹${c.total})`).join(', ') || 'None';
  const weeklyTopCategories = weekly.topCategories.map(c => `${c.category} (₹${c.total})`).join(', ') || 'None';
  const monthlyTopCategories = monthly.topCategories.map(c => `${c.category} (₹${c.total})`).join(', ') || 'None';
  const monthlyTopReceivers = monthly.topReceivers.map(r => `${r.receiverId} (₹${r.total})`).join(', ') || 'None';

  return `
Daily: total = ₹${daily.total}, count = ${daily.count}, top categories: ${dailyTopCategories}.
Weekly: total = ₹${weekly.total}, count = ${weekly.count}, top categories: ${weeklyTopCategories}, compared to last week diff: ₹${weekly.diff}.
Monthly: total = ₹${monthly.total}, top categories: ${monthlyTopCategories}, top receivers: ${monthlyTopReceivers}.

Generate a friendly 2–3 line summary for the user’s spending pattern.
Include ⚠️ emoji if daily total exceeds ₹1000. Keep it simple and friendly.
`;
}

// --- Route: GET /api/insights/dashboard ---
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    // Serve cached insight if available; do NOT call AI here
    const cache = await InsightCache.findOne({ userId }).lean();
    if (cache) {
      return res.json({
        insightText: cache.insightText,
        stats: cache.statsSnapshot,
        updatedAt: cache.updatedAt
      });
    }

    // If no cache yet, return deterministic summary based on current stats (no AI call)
    const stats = await buildDashboardStats(userId);
    const fallbackText = `Summary: Today you spent ₹${stats.daily.total}. This week: ₹${stats.weekly.total}. This month: ₹${stats.monthly.total}.`;
    res.json({ insightText: fallbackText, stats, updatedAt: null });

  } catch (err) {
    console.error('Dashboard insight error:', err);
    res.status(500).json({ error: 'Failed to generate dashboard insights.' });
  }
});

module.exports = router;
