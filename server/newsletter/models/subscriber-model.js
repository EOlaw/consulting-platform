/**
 * Newsletter Subscriber Model
 */
const mongoose = require('mongoose');
const validator = require('validator');
const crypto = require('crypto');

const subscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationTokenExpiry: Date,
  unsubscribeToken: {
    type: String,
    default: function() {
      return crypto.randomBytes(32).toString('hex');
    }
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  preferences: {
    type: {
      productUpdates: {
        type: Boolean,
        default: true
      },
      industryNews: {
        type: Boolean,
        default: true
      },
      events: {
        type: Boolean,
        default: true
      },
      marketing: {
        type: Boolean,
        default: true
      }
    },
    default: {
      productUpdates: true,
      industryNews: true,
      events: true,
      marketing: true
    }
  },
  source: {
    type: String,
    enum: ['website', 'blog', 'case-study', 'landing-page', 'referral', 'other'],
    default: 'website'
  },
  status: {
    type: String,
    enum: ['active', 'unsubscribed', 'bounced', 'complained'],
    default: 'active'
  },
  lastEmailSent: Date,
  campaigns: [{
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign'
    },
    sent: Date,
    opened: Date,
    clicked: Date
  }]
}, {
  timestamps: true
});

// Method to create email verification token
subscriberSchema.methods.createVerificationToken = function() {
  const verificationToken = crypto.randomBytes(32).toString('hex');

  this.verificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  this.verificationTokenExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  return verificationToken;
};

const Subscriber = mongoose.model('Subscriber', subscriberSchema);

module.exports = Subscriber;
