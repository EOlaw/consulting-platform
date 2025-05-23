/**
 * Email Service
 * Handles sending emails using nodemailer
 */
const nodemailer = require('nodemailer');
const config = require('../config/config');
const { AppError } = require('../utils/app-error');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.EMAIL_HOST,
      port: config.EMAIL_PORT,
      secure: config.EMAIL_PORT === 465, // true for 465, false for other ports
      auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASS,
      },
    });
  }

  /**
   * Send an email
   * @param {Object} options - Email options (to, subject, html, text)
   * @returns {Promise<Object>} - Nodemailer response
   */
  async sendEmail(options) {
    try {
      const mailOptions = {
        from: options.from || `"${config.APP_NAME}" <${config.EMAIL_FROM}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      return info;
    } catch (error) {
      console.error('Error sending email:', error);
      throw new AppError('Failed to send email', 500);
    }
  }

  /**
   * Send a welcome email
   * @param {String} email - Recipient email
   * @param {String} firstName - User's first name
   * @returns {Promise<Object>} - Nodemailer response
   */
  async sendWelcomeEmail(email, firstName) {
    const subject = `Welcome to ${config.APP_NAME}!`;
    const text = `Hi ${firstName},\n\nWelcome to ${config.APP_NAME}! We're excited to have you on board.\n\nBest regards,\nThe ${config.APP_NAME} Team`;
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Welcome to ${config.APP_NAME}!</h2>
        <p>Hi ${firstName},</p>
        <p>We're excited to have you on board. Here are some things you can do to get started:</p>
        <ul>
          <li>Complete your profile</li>
          <li>Explore our features</li>
          <li>Connect with other users</li>
        </ul>
        <p>If you have any questions, feel free to contact our support team.</p>
        <p>Best regards,<br>The ${config.APP_NAME} Team</p>
      </div>
    `;

    return this.sendEmail({ to: email, subject, text, html });
  }

  /**
   * Send an email verification link
   * @param {String} email - Recipient email
   * @param {String} firstName - User's first name
   * @param {String} verificationToken - Email verification token
   * @param {String} verificationUrl - URL to verify email
   * @returns {Promise<Object>} - Nodemailer response
   */
  async sendVerificationEmail(email, firstName, verificationUrl) {
    const subject = 'Please verify your email';
    const text = `Hi ${firstName},\n\nPlease verify your email by clicking on the following link: ${verificationUrl}\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nThe ${config.APP_NAME} Team`;
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Verify Your Email</h2>
        <p>Hi ${firstName},</p>
        <p>Please verify your email by clicking on the button below:</p>
        <p>
          <a href="${verificationUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Verify Email
          </a>
        </p>
        <p>If the button doesn't work, you can also click on this link: <a href="${verificationUrl}">${verificationUrl}</a></p>
        <p>If you did not request this, please ignore this email.</p>
        <p>Best regards,<br>The ${config.APP_NAME} Team</p>
      </div>
    `;

    return this.sendEmail({ to: email, subject, text, html });
  }

  /**
   * Send a password reset link
   * @param {String} email - Recipient email
   * @param {String} firstName - User's first name
   * @param {String} resetUrl - URL to reset password
   * @returns {Promise<Object>} - Nodemailer response
   */
  async sendPasswordResetEmail(email, firstName, resetUrl) {
    const subject = 'Password Reset Request';
    const text = `Hi ${firstName},\n\nYou requested to reset your password. Please click on the following link to reset your password: ${resetUrl}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n\nBest regards,\nThe ${config.APP_NAME} Team`;
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Reset Your Password</h2>
        <p>Hi ${firstName},</p>
        <p>You requested to reset your password. Please click on the button below to set a new password:</p>
        <p>
          <a href="${resetUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Reset Password
          </a>
        </p>
        <p>If the button doesn't work, you can also click on this link: <a href="${resetUrl}">${resetUrl}</a></p>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
        <p>Best regards,<br>The ${config.APP_NAME} Team</p>
      </div>
    `;

    return this.sendEmail({ to: email, subject, text, html });
  }

  /**
   * Send a newsletter
   * @param {Array} recipients - Array of recipient emails
   * @param {String} subject - Newsletter subject
   * @param {String} content - Newsletter content (HTML)
   * @returns {Promise<Array>} - Array of nodemailer responses
   */
  async sendNewsletter(recipients, subject, content) {
    try {
      // Split recipients into batches to avoid exposing all emails to everyone
      const batchSize = 50;
      const batches = [];

      for (let i = 0; i < recipients.length; i += batchSize) {
        batches.push(recipients.slice(i, i + batchSize));
      }

      const responses = [];

      for (const batch of batches) {
        // Add unsubscribe link to each email
        const html = `
          ${content}
          <p style="margin-top: 30px; font-size: 12px; color: #777;">
            If you no longer wish to receive these emails, you can
            <a href="${config.CLIENT_URL}/newsletter/unsubscribe" style="color: #555;">unsubscribe here</a>.
          </p>
        `;

        const response = await this.sendEmail({
          to: batch.join(','),
          subject,
          html,
          text: 'Please view this email in an HTML-compatible email client.',
        });

        responses.push(response);
      }

      return responses;
    } catch (error) {
      console.error('Error sending newsletter:', error);
      throw new AppError('Failed to send newsletter', 500);
    }
  }
}

module.exports = new EmailService();
