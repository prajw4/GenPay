const mongoose = require('mongoose');
const {Transaction} = require('../database/db'); // adjust path if needed

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

  // Total spent today
  const totalAgg = await Transaction.aggregate([
    { $match: { fromUserId: new mongoose.Types.ObjectId(userId), date: { $gte: start, $lte: end } } },
    { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }
  ]);

  // Category breakdown
  const categoryAgg = await Transaction.aggregate([
    { $match: { fromUserId: new mongoose.Types.ObjectId(userId), date: { $gte: start, $lte: end } } },
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
    { $match: { fromUserId: new mongoose.Types.ObjectId(userId), date: { $gte: start, $lte: end } } },
    { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }
  ]);

  const categoryAgg = await Transaction.aggregate([
    { $match: { fromUserId: new mongoose.Types.ObjectId(userId), date: { $gte: start, $lte: end } } },
    { $group: { _id: "$category", total: { $sum: "$amount" } } },
    { $sort: { total: -1 } }
  ]);

  // Previous 7 days for comparison
  const prevStart = startOfNDaysAgo(13, refDate);
  const prevEnd = new Date(start);
  prevEnd.setMilliseconds(-1);

  const prevAgg = await Transaction.aggregate([
    { $match: { fromUserId: new mongoose.Types.ObjectId(userId), date: { $gte: prevStart, $lte: prevEnd } } },
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
    { $match: { fromUserId: new mongoose.Types.ObjectId(userId), date: { $gte: start, $lte: end } } },
    { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }
  ]);

  const categoryAgg = await Transaction.aggregate([
    { $match: { fromUserId: new mongoose.Types.ObjectId(userId), date: { $gte: start, $lte: end } } },
    { $group: { _id: "$category", total: { $sum: "$amount" } } },
    { $sort: { total: -1 } }
  ]);

  const receiverAgg = await Transaction.aggregate([
    { $match: { fromUserId: new mongoose.Types.ObjectId(userId), date: { $gte: start, $lte: end }, toUserId: { $exists: true, $ne: null } } },
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
