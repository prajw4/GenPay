require('dotenv').config()
const mongoose = require('mongoose')
const { Faq } = require('../database/db')

const faqs = [
  {
    question: 'How can I add money to my wallet?',
    answer: "Go to the Wallet section in your dashboard and click on 'Add Money'. Then select your payment method and complete the transaction.",
    tags: ['wallet', 'add money', 'payment']
  },
  {
    question: 'Where can I view my transaction history?',
    answer: 'Navigate to the Transactions tab in your dashboard to see all your recent transactions with dates and amounts.',
    tags: ['transaction', 'history']
  },
  {
    question: 'How can I reset my password?',
    answer: "Go to the login page and click on 'Forgot Password'. Enter your registered email and follow the link sent to reset it.",
    tags: ['password', 'login']
  },
  {
    question: 'What should I do if my payment fails?',
    answer: 'If your payment fails, please check your bank account or try again after a few minutes. If the issue continues, contact support.',
    tags: ['payment', 'error']
  }
]

async function seedFaqs() {
  try {
    for (const faq of faqs) {
      await Faq.findOneAndUpdate(
        { question: faq.question },
        { $set: faq },
        { upsert: true, new: true }
      )
    }

    console.log(`Seeded ${faqs.length} FAQs successfully.`)
  } catch (error) {
    console.error('Failed to seed FAQs:', error)
  } finally {
    await mongoose.connection.close()
  }
}

if (mongoose.connection.readyState === 1) {
  seedFaqs()
} else {
  mongoose.connection.once('open', seedFaqs)
}

mongoose.connection.on('error', err => {
  console.error('Mongo connection error:', err)
})
