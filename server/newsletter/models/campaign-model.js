/**
 * Newsletter Campaign Model
 */
const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Campaign name is required'],
    trim: true
  },
  subject: {
    type: String,
    required: [true, 'Email subject is required'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Email content is required']
  },
  targetGroups: {
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
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sending', 'sent', 'cancelled'],
    default: 'draft'
  },
  scheduledFor: {
    type: Date
  },
  sentAt: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by is required']
  },
  stats: {
    totalSent: {
      type: Number,
      default: 0
    },
    totalOpened: {
      type: Number,
      default: 0
    },
    totalClicked: {
      type: Number,
      default: 0
    },
    totalBounced: {
      type: Number,
      default: 0
    },
    totalComplaints: {
      type: Number,
      default: 0
    },
    openRate: {
      type: Number,
      default: 0
    },
    clickRate: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

const Campaign = mongoose.model('Campaign', campaignSchema);

module.exports = Campaign;
