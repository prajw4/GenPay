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
    .then(() => {
        console.log('✅ MongoDB connected successfully');
    })
    .catch((err) => {
        console.error('❌ MongoDB connection failed:', err.message);
        process.exit(1);
    });


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
        required: function(){
            return !this.authProvider || this.authProvider === 'local';
        },
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
    },
    authProvider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local'
    },
    googleId: {
        type: String,
        index: true,
        sparse: true
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

const faqSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
        trim: true
    },
    answer: {
        type: String,
        required: true,
        trim: true
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }]
}, { timestamps: true });

faqSchema.index({ question: 'text', answer: 'text', tags: 'text' });

const Faq = mongoose.model('Faq', faqSchema);

module.exports = {
    User,
    Account,
    Transaction,
    Faq
}

// --- Insight Cache (per-user cached AI insight + stats snapshot) ---
const insightCacheSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
    insightText: { type: String, required: true },
    statsSnapshot: {
        daily: {
            total: Number,
            count: Number,
            topCategories: [{ category: String, total: Number }]
        },
        weekly: {
            total: Number,
            count: Number,
            topCategories: [{ category: String, total: Number }],
            prevTotal: Number,
            diff: Number
        },
        monthly: {
            total: Number,
            count: Number,
            topCategories: [{ category: String, total: Number }],
            topReceivers: [{ receiverId: mongoose.Schema.Types.ObjectId, total: Number, count: Number }]
        }
    },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: false });

const InsightCache = mongoose.model('InsightCache', insightCacheSchema);

module.exports.InsightCache = InsightCache;