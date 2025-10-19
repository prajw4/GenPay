const express  = require("express");
const userRouter = require("./user");
const accountRouter = require("./account");
const transactionsRouter = require("./transactions");
const chatRouter = require("./chat"); // add this

const router = express.Router();

router.use("/user", userRouter);
router.use("/account", accountRouter);
router.use("/transactions", transactionsRouter);
router.use("/chat", chatRouter); // ✅ mount the chat route

module.exports = router;
