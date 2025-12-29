const mongoose = require('mongoose');
const { Transaction, InsightCache } = require('../database/db');
const { askGemini } = require('../services/GeminiService');

// --- Helper functions for date ranges ---
function startOfDay(d) {
  const dt = new Date(d);
  dt.setHours(0,0,0,0);
  return dt;
}
function endOfDay(d) {
  const dt = new Date(d);
  dt.setHours(23,59,59,999);
  return dt;
}
function startOfNDaysAgo(n, fromDate = new Date()) {
  const d = new Date(fromDate);
  d.setDate(d.getDate() - n);
  d.setHours(0,0,0,0);
  return d;
}
function startOfMonth(d) {
  const dt = new Date(d);
  dt.setDate(1);
  dt.setHours(0,0,0,0);
  return dt;
}
function endOfMonth(d) {
  const dt = new Date(d);
  dt.setMonth(dt.getMonth() + 1);
  dt.setDate(0);
  dt.setHours(23,59,59,999);
  return dt;
}

// --- Daily stats ---
async function getDailyStats(userId, date = new Date()) {
  const start = startOfDay(date);
  const end = endOfDay(date);

  // Total spent today (only successful transactions)
  const totalAgg = await Transaction.aggregate([
    { $match: { fromUserId: new mongoose.Types.ObjectId(userId), date: { $gte: start, $lte: end }, status: 'Success' } },
    { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }
  ]);

  // Category breakdown (only successful transactions)
  const categoryAgg = await Transaction.aggregate([
    { $match: { fromUserId: new mongoose.Types.ObjectId(userId), date: { $gte: start, $lte: end }, status: 'Success' } },
    { $group: { _id: "$category", total: { $sum: "$amount" } } },
    { $sort: { total: -1 } },
  ]);

  return {
    period: 'daily',
    date: start.toISOString().slice(0,10),
    total: totalAgg[0]?.total || 0,
    count: totalAgg[0]?.count || 0,
    topCategories: categoryAgg.map(c => ({ category: c._id, total: c.total }))
  };
}

// --- Weekly stats ---
async function getWeeklyStats(userId, refDate = new Date()) {
  const start = startOfNDaysAgo(6, refDate); // last 7 days
  const end = endOfDay(refDate);

  const totalAgg = await Transaction.aggregate([
    { $match: { fromUserId: new mongoose.Types.ObjectId(userId), date: { $gte: start, $lte: end }, status: 'Success' } },
    { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }
  ]);

  const categoryAgg = await Transaction.aggregate([
    { $match: { fromUserId: new mongoose.Types.ObjectId(userId), date: { $gte: start, $lte: end }, status: 'Success' } },
    { $group: { _id: "$category", total: { $sum: "$amount" } } },
    { $sort: { total: -1 } }
  ]);

  // Previous 7 days for comparison
  const prevStart = startOfNDaysAgo(13, refDate);
  const prevEnd = new Date(start);
  prevEnd.setMilliseconds(-1);

  const prevAgg = await Transaction.aggregate([
    { $match: { fromUserId: new mongoose.Types.ObjectId(userId), date: { $gte: prevStart, $lte: prevEnd }, status: 'Success' } },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]);

  const total = totalAgg[0]?.total || 0;
  const prevTotal = prevAgg[0]?.total || 0;

  return {
    period: 'weekly',
    from: start.toISOString(),
    to: end.toISOString(),
    total,
    count: totalAgg[0]?.count || 0,
    topCategories: categoryAgg.slice(0,5).map(c => ({ category: c._id, total: c.total })),
    prevTotal,
    diff: total - prevTotal
  };
}

// --- Monthly stats ---
async function getMonthlyStats(userId, refDate = new Date()) {
  const start = startOfMonth(refDate);
  const end = endOfMonth(refDate);

  const totalAgg = await Transaction.aggregate([
    { $match: { fromUserId: new mongoose.Types.ObjectId(userId), date: { $gte: start, $lte: end }, status: 'Success' } },
    { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }
  ]);

  const categoryAgg = await Transaction.aggregate([
    { $match: { fromUserId: new mongoose.Types.ObjectId(userId), date: { $gte: start, $lte: end }, status: 'Success' } },
    { $group: { _id: "$category", total: { $sum: "$amount" } } },
    { $sort: { total: -1 } }
  ]);

  const receiverAgg = await Transaction.aggregate([
    { $match: { fromUserId: new mongoose.Types.ObjectId(userId), date: { $gte: start, $lte: end }, toUserId: { $exists: true, $ne: null }, status: 'Success' } },
    { $group: { _id: "$toUserId", total: { $sum: "$amount" }, count: { $sum: 1 } } },
    { $sort: { total: -1 } },
    { $limit: 3 }
  ]);

  return {
    period: 'monthly',
    month: start.toISOString().slice(0,7),
    total: totalAgg[0]?.total || 0,
    count: totalAgg[0]?.count || 0,
    topCategories: categoryAgg.slice(0,5).map(c => ({ category: c._id, total: c.total })),
    topReceivers: receiverAgg.map(r => ({ receiverId: r._id, total: r.total, count: r.count }))
  };
}

// --- Convenience: all stats together ---
async function buildDashboardStats(userId, refDate = new Date()) {
  console.log('🔹 buildDashboardStats called for userId:', userId);
  console.log('🔹 Reference date:', refDate.toISOString());

  const [daily, weekly, monthly] = await Promise.all([
    getDailyStats(userId, refDate),
    getWeeklyStats(userId, refDate),
    getMonthlyStats(userId, refDate)
  ]);

  console.log('🔹 Daily stats:', daily);
  console.log('🔹 Weekly stats:', weekly);
  console.log('🔹 Monthly stats:', monthly);

  return { daily, weekly, monthly };
}


module.exports = {
  getDailyStats,
  getWeeklyStats,
  getMonthlyStats,
  buildDashboardStats
};

// --- Build AI prompt from stats ---
function buildDashboardPrompt(stats) {
  const { daily, weekly, monthly } = stats;

  const dailyTopCategories = (daily.topCategories || []).map(c => `${c.category} (₹${c.total})`).join(', ') || 'None';
  const weeklyTopCategories = (weekly.topCategories || []).map(c => `${c.category} (₹${c.total})`).join(', ') || 'None';
  const monthlyTopCategories = (monthly.topCategories || []).map(c => `${c.category} (₹${c.total})`).join(', ') || 'None';
  const monthlyTopReceivers = (monthly.topReceivers || []).map(r => `${r.receiverId} (₹${r.total})`).join(', ') || 'None';

  return `
Daily: total = ₹${daily.total}, count = ${daily.count}, top categories: ${dailyTopCategories}.
Weekly: total = ₹${weekly.total}, count = ${weekly.count}, top categories: ${weeklyTopCategories}, compared to last week diff: ₹${weekly.diff}.
Monthly: total = ₹${monthly.total}, top categories: ${monthlyTopCategories}, top receivers: ${monthlyTopReceivers}.

Generate a friendly 2–3 line summary for the user’s spending pattern.
Include ⚠️ emoji if daily total exceeds ₹1000. Keep it simple and friendly.
`;
}

// --- Generate and store insight cache for a user ---
async function generateAndStoreInsight(userId) {
  const stats = await buildDashboardStats(userId);
  let insightText;
  try {
    const prompt = buildDashboardPrompt(stats);
    insightText = await askGemini(prompt);
    insightText = (insightText || '').trim();
  } catch (err) {
    insightText = '';
  }
  if (!insightText || insightText.startsWith('Sorry, something went wrong') || insightText.includes('AI insights are unavailable')) {
    insightText = `Summary: Today you spent ₹${stats.daily.total}. This week: ₹${stats.weekly.total}. This month: ₹${stats.monthly.total}.`;
  }

  await InsightCache.updateOne(
    { userId },
    { $set: { insightText, statsSnapshot: stats, updatedAt: new Date() } },
    { upsert: true }
  );
}

module.exports.buildDashboardPrompt = buildDashboardPrompt;
module.exports.generateAndStoreInsight = generateAndStoreInsight;
