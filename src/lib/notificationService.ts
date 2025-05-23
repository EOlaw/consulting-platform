/**
 * Notification Service for handling various types of notifications
 * including email, in-app notifications, and webhooks.
 */
import api from './api';
import { contactFormAPI } from './api';

export type NotificationType = 'email' | 'in-app' | 'webhook' | 'sms';
export type NotificationPriority = 'low' | 'medium' | 'high';
export type NotificationTemplate =
  | 'contact-form-submission'
  | 'case-study-published'
  | 'service-inquiry'
  | 'project-status-update'
  | 'user-invitation'
  | 'comment-notification'
  | 'task-assignment'
  | 'meeting-reminder'
  | 'document-shared';

export interface NotificationRecipient {
  email?: string;
  userId?: string;
  name?: string;
  phoneNumber?: string;
  webhookUrl?: string;
}

export interface NotificationAttachment {
  filename: string;
  content: string | Buffer;
  contentType: string;
}

interface NotificationOptions {
  type: NotificationType;
  template: NotificationTemplate;
  recipients: NotificationRecipient[];
  subject?: string;
  message?: string;
  data?: Record<string, any>;
  priority?: NotificationPriority;
  attachments?: NotificationAttachment[];
  scheduledFor?: Date;
  cc?: string[];
  bcc?: string[];
  metadata?: Record<string, any>;
}

interface SendEmailOptions {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  template: string;
  data: Record<string, any>;
  attachments?: NotificationAttachment[];
}

/**
 * Notification service for sending various types of notifications
 */
class NotificationService {
  /**
   * Send a notification via various channels
   */
  async sendNotification(options: NotificationOptions): Promise<boolean> {
    const { type, template, recipients, subject, message, data = {}, priority = 'medium' } = options;

    try {
      switch (type) {
        case 'email':
          await this.sendEmailNotification(options);
          break;
        case 'in-app':
          await this.sendInAppNotification(options);
          break;
        case 'webhook':
          await this.sendWebhookNotification(options);
          break;
        case 'sms':
          await this.sendSmsNotification(options);
          break;
        default:
          throw new Error(`Unsupported notification type: ${type}`);
      }

      return true;
    } catch (error) {
      console.error('Failed to send notification:', error);
      return false;
    }
  }

  /**
   * Send an email notification
   */
  private async sendEmailNotification(options: NotificationOptions): Promise<void> {
    const { template, recipients, subject, data, attachments, cc, bcc } = options;

    // Map recipients to email addresses
    const to = recipients
      .filter(r => r.email)
      .map(r => r.email as string);

    if (to.length === 0) {
      throw new Error('No valid email recipients provided');
    }

    // Prepare email options
    const emailOptions: SendEmailOptions = {
      to,
      subject: subject || this.getDefaultSubject(template),
      template: this.getTemplateId(template),
      data: {
        ...data,
        timestamp: new Date().toISOString()
      },
      attachments
    };

    if (cc && cc.length > 0) {
      emailOptions.cc = cc;
    }

    if (bcc && bcc.length > 0) {
      emailOptions.bcc = bcc;
    }

    // Send email via API
    // In a real implementation, this would call an email service API
    // For now, we'll just log the email details
    console.log('Sending email notification:', emailOptions);

    // Mock API call for send email (would be a real API in production)
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  /**
   * Send an in-app notification
   */
  private async sendInAppNotification(options: NotificationOptions): Promise<void> {
    const { template, recipients, data, priority } = options;

    // Get user IDs from recipients
    const userIds = recipients
      .filter(r => r.userId)
      .map(r => r.userId as string);

    if (userIds.length === 0) {
      throw new Error('No valid user recipients provided');
    }

    // Mock API call for in-app notifications (would be a real API in production)
    await new Promise(resolve => setTimeout(resolve, 200));

    console.log('Sending in-app notification to users:', userIds, {
      template,
      data,
      priority
    });
  }

  /**
   * Send a webhook notification
   */
  private async sendWebhookNotification(options: NotificationOptions): Promise<void> {
    const { template, recipients, data } = options;

    // Get webhook URLs from recipients
    const webhookUrls = recipients
      .filter(r => r.webhookUrl)
      .map(r => r.webhookUrl as string);

    if (webhookUrls.length === 0) {
      throw new Error('No valid webhook URLs provided');
    }

    // Prepare payload
    const payload = {
      template,
      event: this.getEventNameFromTemplate(template),
      data,
      timestamp: new Date().toISOString()
    };

    // Send webhook notifications
    const promises = webhookUrls.map(url => {
      console.log(`Sending webhook to ${url}:`, payload);
      // In a real implementation, this would be an actual HTTP request
      return new Promise(resolve => setTimeout(resolve, 100));
    });

    await Promise.all(promises);
  }

  /**
   * Send an SMS notification
   */
  private async sendSmsNotification(options: NotificationOptions): Promise<void> {
    const { template, recipients, message, data } = options;

    // Get phone numbers from recipients
    const phoneNumbers = recipients
      .filter(r => r.phoneNumber)
      .map(r => r.phoneNumber as string);

    if (phoneNumbers.length === 0) {
      throw new Error('No valid phone numbers provided');
    }

    // Prepare SMS content
    const smsContent = message || this.getSmsContent(template, data);

    // Send SMS notifications
    const promises = phoneNumbers.map(phone => {
      console.log(`Sending SMS to ${phone}:`, smsContent);
      // In a real implementation, this would be an actual SMS API call
      return new Promise(resolve => setTimeout(resolve, 100));
    });

    await Promise.all(promises);
  }

  /**
   * Get template ID based on notification template
   */
  private getTemplateId(template: NotificationTemplate): string {
    const templateMap: Record<NotificationTemplate, string> = {
      'contact-form-submission': 'email-contact-form-submission',
      'case-study-published': 'email-case-study-published',
      'service-inquiry': 'email-service-inquiry',
      'project-status-update': 'email-project-status-update',
      'user-invitation': 'email-user-invitation',
      'comment-notification': 'email-comment-notification',
      'task-assignment': 'email-task-assignment',
      'meeting-reminder': 'email-meeting-reminder',
      'document-shared': 'email-document-shared'
    };

    return templateMap[template] || 'email-generic';
  }

  /**
   * Get default subject line based on notification template
   */
  private getDefaultSubject(template: NotificationTemplate): string {
    const subjectMap: Record<NotificationTemplate, string> = {
      'contact-form-submission': 'New Contact Form Submission',
      'case-study-published': 'New Case Study Published',
      'service-inquiry': 'New Service Inquiry',
      'project-status-update': 'Project Status Update',
      'user-invitation': 'Invitation to Join the Platform',
      'comment-notification': 'New Comment on Your Post',
      'task-assignment': 'New Task Assignment',
      'meeting-reminder': 'Meeting Reminder',
      'document-shared': 'Document Shared With You'
    };

    return subjectMap[template] || 'Notification from Consulting Platform';
  }

  /**
   * Get event name from template for webhooks
   */
  private getEventNameFromTemplate(template: NotificationTemplate): string {
    return template.replace(/-/g, '_').toUpperCase();
  }

  /**
   * Get SMS content based on template and data
   */
  private getSmsContent(template: NotificationTemplate, data: Record<string, any>): string {
    switch (template) {
      case 'contact-form-submission':
        return `New contact from ${data.name || 'a visitor'}. Subject: ${data.subject || 'N/A'}`;
      case 'case-study-published':
        return `New case study published: ${data.title || 'Untitled'}`;
      case 'service-inquiry':
        return `New inquiry about ${data.service || 'your services'} from ${data.name || 'a potential client'}`;
      case 'project-status-update':
        return `Project "${data.projectName || 'Unknown'}" status updated to ${data.status || 'a new status'}`;
      case 'meeting-reminder':
        return `Reminder: You have a meeting scheduled for ${data.time || 'today'}: "${data.subject || 'No subject'}"`;
      default:
        return `New notification from Consulting Platform. Check your dashboard for details.`;
    }
  }

  /**
   * Specifically handle contact form notifications
   */
  async sendContactFormNotification(formData: any): Promise<boolean> {
    try {
      // First, submit the contact form to the API
      await contactFormAPI.submitContactForm(formData);

      // Then send notification to admins
      const notificationOptions: NotificationOptions = {
        type: 'email',
        template: 'contact-form-submission',
        recipients: [
          { email: 'admin@example.com', name: 'Admin' },
          { email: 'sales@example.com', name: 'Sales Team' }
        ],
        subject: `New Contact Form Submission: ${formData.subject || 'No Subject'}`,
        data: {
          name: formData.name,
          email: formData.email,
          company: formData.company,
          phone: formData.phone,
          subject: formData.subject,
          message: formData.message,
          interests: formData.interests,
          submitDate: new Date().toLocaleString()
        },
        priority: 'medium'
      };

      // Send admin notification
      await this.sendNotification(notificationOptions);

      // Send confirmation email to the user
      const userConfirmationOptions: NotificationOptions = {
        type: 'email',
        template: 'contact-form-submission',
        recipients: [
          { email: formData.email, name: formData.name }
        ],
        subject: 'Thank you for contacting us',
        data: {
          name: formData.name,
          message: formData.message,
          companyName: 'Your Consulting Company',
          isConfirmation: true
        }
      };

      // Send user confirmation
      await this.sendNotification(userConfirmationOptions);

      return true;
    } catch (error) {
      console.error('Failed to process contact form notification:', error);
      return false;
    }
  }

  /**
   * Handle service inquiry notifications
   */
  async sendServiceInquiryNotification(inquiryData: any): Promise<boolean> {
    try {
      const notificationOptions: NotificationOptions = {
        type: 'email',
        template: 'service-inquiry',
        recipients: [
          { email: 'services@example.com', name: 'Services Team' },
          { email: 'sales@example.com', name: 'Sales Team' }
        ],
        subject: `New Service Inquiry: ${inquiryData.serviceName || 'General Inquiry'}`,
        data: {
          ...inquiryData,
          submitDate: new Date().toLocaleString()
        },
        priority: 'high'
      };

      // Also send SMS notification for high-priority inquiries
      if (inquiryData.budget && inquiryData.budget > 50000) {
        notificationOptions.type = 'sms';
        notificationOptions.recipients.push({
          phoneNumber: '+15551234567',
          name: 'Sales Manager'
        });
      }

      await this.sendNotification(notificationOptions);

      // Send in-app notification to relevant team members
      const inAppNotificationOptions: NotificationOptions = {
        type: 'in-app',
        template: 'service-inquiry',
        recipients: [
          { userId: 'user123', name: 'John Doe' },
          { userId: 'user456', name: 'Jane Smith' }
        ],
        data: {
          ...inquiryData,
          submitDate: new Date().toLocaleString()
        }
      };

      await this.sendNotification(inAppNotificationOptions);

      return true;
    } catch (error) {
      console.error('Failed to process service inquiry notification:', error);
      return false;
    }
  }

  /**
   * Handle case study publication notifications
   */
  async sendCaseStudyPublishedNotification(caseStudyData: any): Promise<boolean> {
    try {
      const notificationOptions: NotificationOptions = {
        type: 'email',
        template: 'case-study-published',
        recipients: [
          ...caseStudyData.teamMembers?.map((member: any) => ({
            email: member.email,
            name: member.name
          })) || [],
          { email: 'marketing@example.com', name: 'Marketing Team' }
        ],
        subject: `New Case Study Published: ${caseStudyData.title}`,
        data: {
          ...caseStudyData,
          publishDate: new Date().toLocaleString(),
          url: `https://example.com/case-studies/${caseStudyData.slug}`
        }
      };

      await this.sendNotification(notificationOptions);

      // Also send webhook notification if configured
      if (caseStudyData.webhooks && caseStudyData.webhooks.length > 0) {
        const webhookOptions: NotificationOptions = {
          type: 'webhook',
          template: 'case-study-published',
          recipients: caseStudyData.webhooks.map((url: string) => ({ webhookUrl: url })),
          data: {
            id: caseStudyData.id,
            title: caseStudyData.title,
            slug: caseStudyData.slug,
            client: caseStudyData.client,
            industry: caseStudyData.industry,
            publishDate: new Date().toISOString()
          }
        };

        await this.sendNotification(webhookOptions);
      }

      return true;
    } catch (error) {
      console.error('Failed to process case study publication notification:', error);
      return false;
    }
  }
}

// Export singleton instance
const notificationService = new NotificationService();
export default notificationService;
