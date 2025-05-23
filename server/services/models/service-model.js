/**
 * Service Model
 */
const mongoose = require('mongoose');
const slugify = require('slugify');

const serviceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Service title is required'],
    trim: true
  },
  slug: String,
  shortDescription: {
    type: String,
    required: [true, 'Short description is required'],
    trim: true,
    maxlength: [200, 'Short description must not exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Service description is required']
  },
  icon: {
    type: String,
    required: [true, 'Service icon is required']
  },
  featuredImage: {
    type: String,
    required: [true, 'Featured image is required']
  },
  benefits: [{
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    icon: String
  }],
  processSteps: [{
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    icon: String,
    order: {
      type: Number,
      required: true
    }
  }],
  pricingTiers: [{
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    },
    billingCycle: {
      type: String,
      enum: ['one-time', 'monthly', 'quarterly', 'annually'],
      default: 'monthly'
    },
    description: String,
    features: [String],
    isPopular: {
      type: Boolean,
      default: false
    }
  }],
  category: {
    type: String,
    required: [true, 'Service category is required']
  },
  tags: [String],
  relatedCaseStudies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CaseStudy'
  }],
  relatedServices: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  }],
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
    ogImage: String
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
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
serviceSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true });
  }
  next();
});

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;
