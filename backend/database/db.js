const mongoose = require("mongoose"); 
const { required, trim, minLength, maxLength } = require("zod/mini");

// dotenv is loaded in index.js, but load here as well to be safe when this file is required directly
require('dotenv').config();

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
if (!mongoUri) {
    console.error('\n[ERROR] Missing MongoDB connection string.\nSet `MONGODB_URI` in backend/.env or as an environment variable.\nExample in backend/.env.example.');
    // don't call mongoose.connect with undefined — exit the process to avoid confusing Mongoose error
    process.exit(1);
}

mongoose.connect(mongoUri)


const userSchema =  mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true, 
        trim: true,
        lowercase: true,
        minLength: 3,
        maxLength: 50
    },

    password: {
        type: String, 
        required: true,
        minLength: 6
    },

    firstName: {
        type: String,
        required: true, 
        trim: true,
        maxLength: 20
    },

     lastName: {
        type: String,
        required: true, 
        trim: true,
        maxLength: 20
    }
});

const accountSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    balance: {
        type: Number,
        required: true
    }
});

const Account = mongoose.model("Account", accountSchema);
const User  = mongoose.model("User", userSchema);

const transactionSchema = mongoose.Schema({
    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    amount: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        enum: ['Recharge','Food','Bills','Transfer'],
        required: true
    },
    status: {
        type: String,
        enum: ['Success','Failed'],
        required: true
    },
    message: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = {
    User,
    Account,
    Transaction
}