const nodemailer = require('nodemailer');
const logger = require('./logger');

/**
 * Email Service - Production-ready SMTP implementation
 * 
 * Supports both Gmail and generic SMTP servers based on environment configuration.
 * 
 * Required environment variables:
 * - EMAIL_SERVICE: 'gmail' or 'smtp' (optional, defaults to 'gmail')
 * - EMAIL_HOST: SMTP host (required if EMAIL_SERVICE is 'smtp')
 * - EMAIL_PORT: SMTP port (required if EMAIL_SERVICE is 'smtp', e.g., 587, 465)
 * - EMAIL_SECURE: 'true' or 'false' (optional, defaults to 'false' for port 587)
 * - EMAIL_USER: Email address for authentication
 * - EMAIL_PASSWORD: Email password or App-specific password
 * - EMAIL_FROM: Sender name and email (e.g., "Campus System <noreply@campus.com>")
 */

let transporter = null;

/**
 * Initialize email transporter based on environment configuration
 */
const createTransporter = () => {
  if (transporter) {
    return transporter;
  }

  const emailService = process.env.EMAIL_SERVICE || 'gmail';
  
  let transportConfig;

  if (emailService === 'gmail') {
    // Gmail configuration
    transportConfig = {
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    };
  } else {
    // Generic SMTP configuration
    transportConfig = {
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    };
  }

  transporter = nodemailer.createTransport(transportConfig);

  // Verify transporter configuration
  transporter.verify((error, success) => {
    if (error) {
      logger.error('Email transporter verification failed:', error);
    } else {
      logger.info('Email service is ready to send emails');
    }
  });

  return transporter;
};

/**
 * Send email function
 * 
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email address (or 'to')
 * @param {string} options.to - Recipient email address (alternative to 'email')
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Plain text message (or 'text')
 * @param {string} options.text - Plain text message (alternative to 'message')
 * @param {string} options.html - HTML message (optional)
 * @returns {Promise<void>}
 * @throws {Error} If email sending fails
 */
const sendEmail = async (options) => {
  try {
    // Check if email service is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      logger.warn('Email service not configured. Skipping email send.');
      logger.info('---------------- E-POSTA (MOCK MODE) ----------------');
      logger.info(`Kime: ${options.email || options.to}`);
      logger.info(`Konu: ${options.subject}`);
      logger.info(`Mesaj: \n${options.message || options.text}`);
      logger.info('----------------------------------------------------');
      return true;
    }

    const emailTransporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: options.email || options.to,
      subject: options.subject,
      text: options.message || options.text,
      html: options.html || null
    };

    const info = await emailTransporter.sendMail(mailOptions);

    logger.info(`Email sent successfully to ${mailOptions.to}: ${info.messageId}`);
    
    return info;
  } catch (error) {
    logger.error('Email sending failed:', error);
    throw new Error(`E-posta gönderilemedi: ${error.message}`);
  }
};

module.exports = sendEmail;