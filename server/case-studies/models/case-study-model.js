/**
 * Case Study Model
 */
const mongoose = require('mongoose');
const slugify = require('slugify');

const caseStudySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Case study title is required'],
    trim: true
  },
  slug: String,
  summary: {
    type: String,
    required: [true, 'Case study summary is required'],
    trim: true
  },
  client: {
    name: String,
    logo: String,
    industry: String,
    isAnonymous: {
      type: Boolean,
      default: false
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization'
    }
  },
  challenge: {
    type: String,
    required: [true, 'Challenge description is required']
  },
  solution: {
    type: String,
    required: [true, 'Solution description is required']
  },
  results: {
    type: String,
    required: [true, 'Results description is required']
  },
  metrics: [{
    name: String,
    value: String,
    icon: String
  }],
  testimonial: {
    quote: String,
    author: String,
    position: String,
    company: String,
    image: String
  },
  images: [{
    url: String,
    caption: String,
    order: Number
  }],
  featuredImage: String,
  categories: [String],
  tags: [String],
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  publishStatus: {
    type: String,
    enum: ['draft', 'review', 'published', 'archived'],
    default: 'draft'
  },
  publishedAt: Date,
  technologies: [String],
  serviceAreas: [String],
  team: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: String
  }],
  relatedCaseStudies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CaseStudy'
  }],
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
    ogImage: String
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
caseStudySchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true });
  }
  next();
});

const CaseStudy = mongoose.model('CaseStudy', caseStudySchema);

module.exports = CaseStudy;
