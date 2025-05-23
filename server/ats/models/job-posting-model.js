/**
 * Job Posting Model for ATS
 */
const mongoose = require('mongoose');
const slugify = require('slugify');

const jobPostingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true
  },
  slug: String,
  department: {
    type: String,
    required: [true, 'Department is required']
  },
  location: {
    city: String,
    state: String,
    country: String,
    remote: {
      type: Boolean,
      default: false
    }
  },
  type: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'temporary', 'internship'],
    required: [true, 'Job type is required']
  },
  description: {
    type: String,
    required: [true, 'Job description is required']
  },
  requirements: {
    type: String,
    required: [true, 'Job requirements are required']
  },
  responsibilities: {
    type: String,
    required: [true, 'Job responsibilities are required']
  },
  qualifications: {
    type: String,
    required: [true, 'Job qualifications are required']
  },
  benefits: [String],
  salary: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'USD'
    },
    isVisible: {
      type: Boolean,
      default: true
    }
  },
  skills: [String],
  applicationProcess: {
    applicationUrl: String,
    applyDirectly: {
      type: Boolean,
      default: true
    },
    requiredDocuments: [{
      type: String,
      enum: ['resume', 'cover_letter', 'portfolio', 'references', 'other']
    }],
    customQuestions: [{
      question: String,
      type: {
        type: String,
        enum: ['text', 'textarea', 'select', 'checkbox', 'radio', 'file']
      },
      options: [String],
      isRequired: {
        type: Boolean,
        default: false
      }
    }]
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'closed', 'archived'],
    default: 'draft'
  },
  publishedAt: Date,
  closesAt: Date,
  featured: {
    type: Boolean,
    default: false
  },
  applications: [{
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resume: String,
    coverLetter: String,
    status: {
      type: String,
      enum: ['applied', 'reviewing', 'interview', 'offered', 'hired', 'rejected'],
      default: 'applied'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    notes: String,
    customResponses: [{
      question: String,
      answer: String
    }]
  }],
  hiringManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Hiring manager is required']
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: [true, 'Organization is required']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by is required']
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

// Pre-save hook to create slug from title
jobPostingSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = slugify(`${this.title}-${this.department}`, { lower: true });
  }
  next();
});

// Virtual for application count
jobPostingSchema.virtual('applicationCount').get(function() {
  return this.applications ? this.applications.length : 0;
});

const JobPosting = mongoose.model('JobPosting', jobPostingSchema);

module.exports = JobPosting;
