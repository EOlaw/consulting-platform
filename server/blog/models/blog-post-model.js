/**
 * Blog Post Model
 */
const mongoose = require('mongoose');
const slugify = require('slugify');

const blogPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Blog post title is required'],
    trim: true
  },
  slug: String,
  content: {
    type: String,
    required: [true, 'Blog post content is required']
  },
  excerpt: {
    type: String,
    required: [true, 'Blog post excerpt is required'],
    trim: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Blog post author is required']
  },
  featuredImage: String,
  categories: [{
    type: String,
    required: [true, 'At least one category is required']
  }],
  tags: [String],
  publishStatus: {
    type: String,
    enum: ['draft', 'scheduled', 'published', 'archived'],
    default: 'draft'
  },
  publishedAt: Date,
  scheduledFor: Date,
  readTime: Number,
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    isApproved: {
      type: Boolean,
      default: false
    }
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: {
    type: Number,
    default: 0
  },
  relatedPosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BlogPost'
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
  isHighlighted: {
    type: Boolean,
    default: false
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
blogPostSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true });
  }

  // Calculate read time (approx. 200 words per minute)
  if (this.isModified('content')) {
    const wordCount = this.content.split(/\s+/).length;
    this.readTime = Math.ceil(wordCount / 200);
  }

  next();
});

// Pre-find hook to increment views
blogPostSchema.pre(/^find/, function(next) {
  if (!this.options || !this.options._incrementViews) {
    return next();
  }

  const blogPostId = this._conditions._id;
  if (!blogPostId) {
    return next();
  }

  // Increment the views counter
  BlogPost.findByIdAndUpdate(blogPostId, { $inc: { views: 1 } }, { new: true })
    .catch(err => console.error('Error incrementing views:', err));

  next();
});

const BlogPost = mongoose.model('BlogPost', blogPostSchema);

module.exports = BlogPost;
