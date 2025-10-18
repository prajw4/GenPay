const express = require("express")
const { authMiddleware } = require('../middlewares')
const { Account, Transaction } = require("../database/db")
const {default: mongoose} = require('mongoose');

const router = express.Router();

router.get("/balance", authMiddleware, async (req, res) => {
    const account = await Account.findOne({
        userId: req.userId
    });

    res.json({
        balance: account.balance
    })
});

router.post("/transfer", authMiddleware, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    const { amount, to, category = 'Transfer', message = '' } = req.body;

    try {
        if (!to) {
            await session.abortTransaction();
            return res.status(400).json({ message: 'Missing destination account' });
        }

        const numericAmount = Number(amount)
        if (!numericAmount || numericAmount <= 0) {
            await session.abortTransaction();
            return res.status(400).json({ message: 'Invalid amount' });
        }

        // Fetch the accounts within the transaction
        const account = await Account.findOne({ userId: req.userId }).session(session);

        if (!account || account.balance < numericAmount) {
            await session.abortTransaction();
            return res.status(400).json({
                message: "Insufficient balance"
            });
        }

        const toAccount = await Account.findOne({ userId: to }).session(session);

        if (!toAccount) {
            await session.abortTransaction();
            return res.status(400).json({
                message: "Invalid account"
            });
        }

        // Perform the transfer
        await Account.updateOne({ userId: req.userId }, { $inc: { balance: -numericAmount } }).session(session);
        await Account.updateOne({ userId: to }, { $inc: { balance: numericAmount } }).session(session);

        // create transaction doc within the session
        const tx = await Transaction.create([
            {
                fromUserId: req.userId,
                toUserId: to,
                amount: numericAmount,
                category,
                status: 'Success',
                message,
                date: new Date()
            }
        ], { session });

        // Commit the transaction
        await session.commitTransaction();
        session.endSession();

        // return updated balance for sender and receiver
        const updatedSender = await Account.findOne({ userId: req.userId });
        const updatedReceiver = await Account.findOne({ userId: to });
        console.log(`Transfer successful: from ${req.userId} to ${to} amount=${numericAmount} newBalance=${updatedSender.balance} rxNewBalance=${updatedReceiver.balance} txId=${tx[0]._id}`);
        res.json({
            message: "Transfer successful",
            balance: updatedSender.balance,
            receiverBalance: updatedReceiver.balance,
            transaction: tx[0]
        });
    } catch (err) {
        // abort and record failed transaction for auditing (outside session)
        try { await session.abortTransaction(); } catch (e) {}
        session.endSession();

        // attempt to save failed transaction (best-effort)
        try {
            await Transaction.create({
                fromUserId: req.userId,
                toUserId: to,
                amount: Number(amount) || 0,
                category: req.body.category || 'Transfer',
                status: 'Failed',
                message: (err && err.message) || 'Transfer failed',
                date: new Date()
            });
        } catch (e) {
            // swallow - auditing best-effort
            console.error('Failed to record failed transaction', e.message || e);
        }

        console.error('Transfer error', err && err.message ? err.message : err);
        return res.status(500).json({ message: 'Transfer failed' });
    }
});

module.exports = router;