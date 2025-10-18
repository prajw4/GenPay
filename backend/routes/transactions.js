const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares');
const { Transaction } = require('../database/db');
const zod = require('zod');

const txSchema = zod.object({
    toUserId: zod.string().optional(),
    amount: zod.number(),
    category: zod.enum(['Recharge','Food','Bills','Transfer']),
    status: zod.enum(['Success','Failed']),
    message: zod.string().optional(),
    date: zod.string().optional()
});

// create a transaction (server will still trust authenticated user as fromUserId)
router.post('/', authMiddleware, async (req, res) => {
    const parsed = txSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: 'Invalid transaction payload', errors: parsed.error.issues });
    }

    const { toUserId, amount, category, status, message, date } = parsed.data;

    try {
        const tx = await Transaction.create({
            fromUserId: req.userId,
            toUserId: toUserId || undefined,
            amount,
            category,
            status,
            message,
            date: date ? new Date(date) : new Date()
        });

        res.json({ transaction: tx });
    } catch (err) {
        console.error('Failed to save transaction', err.message || err);
        res.status(500).json({ message: 'Failed to save transaction' });
    }
});

// optional: list transactions for current user (from or to)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const txs = await Transaction.find({
            $or: [ { fromUserId: req.userId }, { toUserId: req.userId } ]
        }).sort({ date: -1 }).limit(200)
        .populate({ path: 'fromUserId', select: 'firstName lastName username' })
        .populate({ path: 'toUserId', select: 'firstName lastName username' });

        // map populated docs to friendly structure
        const normalized = txs.map(t => ({
            _id: t._id,
            amount: t.amount,
            category: t.category,
            status: t.status,
            message: t.message,
            date: t.date,
            from: t.fromUserId ? { _id: t.fromUserId._id, firstName: t.fromUserId.firstName, lastName: t.fromUserId.lastName, username: t.fromUserId.username } : null,
            to: t.toUserId ? { _id: t.toUserId._id, firstName: t.toUserId.firstName, lastName: t.toUserId.lastName, username: t.toUserId.username } : null,
        }))

        res.json({ transactions: normalized });
    } catch (err) {
        console.error('Failed to list transactions', err.message || err);
        res.status(500).json({ message: 'Failed to list transactions' });
    }
});

module.exports = router;
