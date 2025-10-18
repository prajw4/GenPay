const express  = require("express");
const userRouter = require("./user");
const accountRouter = require("./account");
const transactionsRouter = require("./transactions");
const router = express.Router();

router.use("/user", userRouter);
router.use("/account", accountRouter)
router.use('/transactions', transactionsRouter)

module.exports = router;