/**
 * Organization Model
 */
const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Organization name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  logo: String,
  website: String,
  industry: String,
  size: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']
  },
  founded: Number,
  headquarters: {
    address: String,
    city: String,
    state: String,
    country: String,
    postalCode: String
  },
  socialMedia: {
    linkedin: String,
    twitter: String,
    facebook: String,
    instagram: String
  },
  contacts: [{
    name: String,
    email: String,
    phone: String,
    role: String
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member', 'guest'],
      default: 'member'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  active: {
    type: Boolean,
    default: true
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'professional', 'enterprise'],
      default: 'free'
    },
    startDate: Date,
    endDate: Date,
    status: {
      type: String,
      enum: ['active', 'expired', 'canceled', 'pending'],
      default: 'active'
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
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual fields for related projects
organizationSchema.virtual('projects', {
  ref: 'Project',
  foreignField: 'organization',
  localField: '_id'
});

// Virtual fields for related case studies
organizationSchema.virtual('caseStudies', {
  ref: 'CaseStudy',
  foreignField: 'organization',
  localField: '_id'
});

const Organization = mongoose.model('Organization', organizationSchema);

module.exports = Organization;
