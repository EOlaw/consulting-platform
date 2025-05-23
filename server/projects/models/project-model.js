/**
 * Project Model
 */
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    trim: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: [true, 'Client organization is required']
  },
  startDate: {
    type: Date,
    required: [true, 'Project start date is required']
  },
  endDate: Date,
  status: {
    type: String,
    enum: ['planning', 'in-progress', 'on-hold', 'completed', 'canceled'],
    default: 'planning'
  },
  budget: {
    amount: Number,
    currency: {
      type: String,
      default: 'USD'
    },
    type: {
      type: String,
      enum: ['fixed', 'hourly', 'milestone'],
      default: 'fixed'
    }
  },
  team: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: String,
    hoursAllocated: Number,
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Project manager is required']
  },
  tags: [String],
  attachments: [{
    name: String,
    url: String,
    type: String,
    size: Number,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  milestones: [{
    title: String,
    description: String,
    dueDate: Date,
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'delayed'],
      default: 'pending'
    },
    completedAt: Date
  }],
  risks: [{
    title: String,
    description: String,
    impact: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    probability: {
      type: String,
      enum: ['low', 'medium', 'high', 'very-high'],
      default: 'medium'
    },
    mitigation: String,
    status: {
      type: String,
      enum: ['identified', 'monitoring', 'mitigated', 'occurred'],
      default: 'identified'
    }
  }],
  kpis: [{
    name: String,
    description: String,
    target: Number,
    current: Number,
    unit: String,
    status: {
      type: String,
      enum: ['on-track', 'at-risk', 'off-track'],
      default: 'on-track'
    }
  }],
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

// Virtual fields for related tasks
projectSchema.virtual('tasks', {
  ref: 'Task',
  foreignField: 'project',
  localField: '_id'
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
