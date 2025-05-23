/**
 * Notification Settings Model
 * Manages user preferences for email notifications
 */
const mongoose = require('mongoose');

const notificationSettingsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  email: {
    serviceInquiries: {
      type: Boolean,
      default: true
    },
    caseStudySubmissions: {
      type: Boolean,
      default: true
    },
    newClients: {
      type: Boolean,
      default: true
    },
    projectUpdates: {
      type: Boolean,
      default: true
    },
    teamAssignments: {
      type: Boolean,
      default: true
    },
    blogComments: {
      type: Boolean,
      default: false
    },
    marketingCampaigns: {
      type: Boolean,
      default: false
    },
    systemAnnouncements: {
      type: Boolean,
      default: true
    }
  },
  inApp: {
    serviceInquiries: {
      type: Boolean,
      default: true
    },
    caseStudySubmissions: {
      type: Boolean,
      default: true
    },
    newClients: {
      type: Boolean,
      default: true
    },
    projectUpdates: {
      type: Boolean,
      default: true
    },
    teamAssignments: {
      type: Boolean,
      default: true
    },
    blogComments: {
      type: Boolean,
      default: true
    },
    marketingCampaigns: {
      type: Boolean,
      default: true
    },
    systemAnnouncements: {
      type: Boolean,
      default: true
    }
  },
  digestEmail: {
    enabled: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'weekly'
    },
    dayOfWeek: {
      type: Number,
      min: 0,
      max: 6,
      default: 1 // Monday
    },
    dayOfMonth: {
      type: Number,
      min: 1,
      max: 31,
      default: 1
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create settings when a new user is created
notificationSettingsSchema.statics.createDefaultSettings = async function(userId) {
  try {
    const settings = await this.create({ user: userId });
    return settings;
  } catch (error) {
    console.error('Error creating default notification settings:', error);
    // Don't throw, as this shouldn't block user creation
    return null;
  }
};

const NotificationSettings = mongoose.model('NotificationSettings', notificationSettingsSchema);

module.exports = NotificationSettings;
