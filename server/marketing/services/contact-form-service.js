/**
 * Contact Form Service
 */
const ContactForm = require('../models/contact-form-model');
const AppError = require('../../utils/app-error');
const emailService = require('../../services/email-service');

class ContactFormService {
  /**
   * Create a new contact form submission
   * @param {Object} formData - The form data
   * @returns {Promise<Object>} - The created submission
   */
  async createSubmission(formData) {
    try {
      const submission = await ContactForm.create(formData);

      // Send notification email to admin
      if (process.env.ADMIN_EMAIL) {
        await this.sendNotificationEmail(submission);
      }

      // Send confirmation email to user
      await this.sendConfirmationEmail(submission);

      return submission;
    } catch (error) {
      throw new AppError(`Failed to create submission: ${error.message}`, 400);
    }
  }

  /**
   * Get all contact form submissions with optional filtering
   * @param {Object} filter - Filter criteria
   * @param {Object} options - Query options (sorting, pagination)
   * @returns {Promise<Array>} - List of submissions
   */
  async getAllSubmissions(filter = {}, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        status,
        organization,
        search
      } = options;

      const skip = (page - 1) * limit;

      // Build query filters
      const queryFilter = { ...filter };

      if (status) queryFilter.status = status;
      if (organization) queryFilter.organization = organization;

      // Search in name, email, company, and message
      if (search) {
        queryFilter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { company: { $regex: search, $options: 'i' } },
          { message: { $regex: search, $options: 'i' } }
        ];
      }

      // Build sort option
      const sortOption = {};
      sortOption[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Execute query with pagination
      const submissions = await ContactForm.find(queryFilter)
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('assignedTo', 'firstName lastName email profileImage')
        .populate('organization', 'name logo');

      // Get total count for pagination
      const total = await ContactForm.countDocuments(queryFilter);

      return {
        submissions,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new AppError(`Failed to fetch submissions: ${error.message}`, 500);
    }
  }

  /**
   * Get submission by ID
   * @param {string} submissionId - The submission ID
   * @returns {Promise<Object>} - The submission
   */
  async getSubmissionById(submissionId) {
    try {
      const submission = await ContactForm.findById(submissionId)
        .populate('assignedTo', 'firstName lastName email profileImage')
        .populate('organization', 'name logo');

      if (!submission) {
        throw new AppError('Submission not found', 404);
      }

      return submission;
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error.name === 'CastError') throw new AppError('Invalid submission ID', 400);
      throw new AppError(`Failed to fetch submission: ${error.message}`, 500);
    }
  }

  /**
   * Update submission
   * @param {string} submissionId - The submission ID
   * @param {Object} updateData - The update data
   * @returns {Promise<Object>} - The updated submission
   */
  async updateSubmission(submissionId, updateData) {
    try {
      const submission = await ContactForm.findByIdAndUpdate(
        submissionId,
        updateData,
        { new: true, runValidators: true }
      )
        .populate('assignedTo', 'firstName lastName email profileImage')
        .populate('organization', 'name logo');

      if (!submission) {
        throw new AppError('Submission not found', 404);
      }

      return submission;
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error.name === 'CastError') throw new AppError('Invalid submission ID', 400);
      throw new AppError(`Failed to update submission: ${error.message}`, 500);
    }
  }

  /**
   * Delete submission
   * @param {string} submissionId - The submission ID
   * @returns {Promise<Object>} - Deletion result
   */
  async deleteSubmission(submissionId) {
    try {
      const submission = await ContactForm.findByIdAndDelete(submissionId);

      if (!submission) {
        throw new AppError('Submission not found', 404);
      }

      return { message: 'Submission deleted successfully' };
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error.name === 'CastError') throw new AppError('Invalid submission ID', 400);
      throw new AppError(`Failed to delete submission: ${error.message}`, 500);
    }
  }

  /**
   * Assign submission to user
   * @param {string} submissionId - The submission ID
   * @param {string} userId - The user ID
   * @returns {Promise<Object>} - The updated submission
   */
  async assignSubmission(submissionId, userId) {
    try {
      const submission = await ContactForm.findByIdAndUpdate(
        submissionId,
        {
          assignedTo: userId,
          status: 'in-progress'
        },
        { new: true, runValidators: true }
      )
        .populate('assignedTo', 'firstName lastName email profileImage')
        .populate('organization', 'name logo');

      if (!submission) {
        throw new AppError('Submission not found', 404);
      }

      return submission;
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error.name === 'CastError') throw new AppError('Invalid ID', 400);
      throw new AppError(`Failed to assign submission: ${error.message}`, 500);
    }
  }

  /**
   * Send notification email to admin
   * @param {Object} submission - The contact form submission
   * @returns {Promise<void>}
   */
  async sendNotificationEmail(submission) {
    try {
      const emailOptions = {
        to: process.env.ADMIN_EMAIL,
        subject: `New Contact Form Submission: ${submission.subject}`,
        text: `
          Name: ${submission.name}
          Email: ${submission.email}
          Phone: ${submission.phone || 'Not provided'}
          Company: ${submission.company || 'Not provided'}
          Subject: ${submission.subject}
          Service Interest: ${submission.serviceInterest || 'Not specified'}
          Message: ${submission.message}
          Source: ${submission.source}
          Submitted: ${submission.createdAt}
        `,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Subject:</strong> ${submission.subject}</p>
          <p><strong>Name:</strong> ${submission.name}</p>
          <p><strong>Email:</strong> ${submission.email}</p>
          <p><strong>Phone:</strong> ${submission.phone || 'Not provided'}</p>
          <p><strong>Company:</strong> ${submission.company || 'Not provided'}</p>
          <p><strong>Service Interest:</strong> ${submission.serviceInterest || 'Not specified'}</p>
          <p><strong>Message:</strong><br>${submission.message.replace(/\\n/g, '<br>')}</p>
          <p><strong>Source:</strong> ${submission.source}</p>
          <p><strong>Submitted:</strong> ${new Date(submission.createdAt).toLocaleString()}</p>
        `
      };

      await emailService.sendEmail(emailOptions);
    } catch (error) {
      console.error('Failed to send admin notification email:', error);
      // Don't throw error, continue with the process
    }
  }

  /**
   * Send confirmation email to user
   * @param {Object} submission - The contact form submission
   * @returns {Promise<void>}
   */
  async sendConfirmationEmail(submission) {
    try {
      const emailOptions = {
        to: submission.email,
        subject: 'Thank you for contacting us',
        text: `
          Dear ${submission.name},

          Thank you for reaching out to us. We have received your message and will respond shortly.

          Your message:
          ${submission.message}

          Best regards,
          The Consulting Platform Team
        `,
        html: `
          <h2>Thank You for Contacting Us</h2>
          <p>Dear ${submission.name},</p>
          <p>Thank you for reaching out to us. We have received your message and will respond shortly.</p>
          <h3>Your message:</h3>
          <p style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">${submission.message.replace(/\\n/g, '<br>')}</p>
          <p>Best regards,<br>The Consulting Platform Team</p>
        `
      };

      await emailService.sendEmail(emailOptions);
    } catch (error) {
      console.error('Failed to send confirmation email:', error);
      // Don't throw error, continue with the process
    }
  }
}

module.exports = new ContactFormService();
