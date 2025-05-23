/**
 * Contact Form Model
 */
const mongoose = require('mongoose');

const contactFormSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true
  },
  subject: {
    type: String,
    default: 'General Inquiry',
    trim: true
  },
  serviceInterest: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['new', 'in-progress', 'completed', 'spam'],
    default: 'new'
  },
  notes: {
    type: String,
    trim: true
  },
  source: {
    type: String,
    trim: true,
    default: 'website'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  },
  ipAddress: String,
  userAgent: String,
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

const ContactForm = mongoose.model('ContactForm', contactFormSchema);

module.exports = ContactForm;
