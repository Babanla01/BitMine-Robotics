import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

// ============================================================================
// Email Service Utility - Centralized email handling with security best practices
// ============================================================================

// Email configuration
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASSWORD;
const emailService = process.env.EMAIL_SERVICE || 'gmail';
const appName = process.env.APP_NAME || 'BitMine';
const appUrl = process.env.FRONTEND_URL || 'http://localhost:5174';

// Email rate limiting: Track recent email sends per recipient
const emailRateLimit = new Map(); // { email: [timestamp1, timestamp2, ...] }
const MAX_EMAILS_PER_HOUR = parseInt(process.env.MAX_EMAILS_PER_HOUR || '5', 10);
const MAX_EMAILS_PER_DAY = parseInt(process.env.MAX_EMAILS_PER_DAY || '20', 10);

// Configure transporter
const transporterOptions = {
  service: emailService,
  auth: {
    user: emailUser,
    pass: emailPass
  },
  connectionTimeout: parseInt(process.env.EMAIL_CONNECTION_TIMEOUT_MS || '5000', 10),
  socketTimeout: parseInt(process.env.EMAIL_SOCKET_TIMEOUT_MS || '5000', 10)
};

const transporter = nodemailer.createTransport(transporterOptions);

// Verify transporter on startup (non-blocking)
if (process.env.SKIP_EMAIL_VERIFY !== 'true') {
  transporter.verify()
    .then(() => console.log('✅ Email transporter verified'))
    .catch(err => console.warn('⚠️  Email transporter verification failed:', err.message));
}

// ============================================================================
// SECURITY: Rate limiting for emails
// ============================================================================
const checkEmailRateLimit = (email) => {
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;
  const oneDayAgo = now - 24 * 60 * 60 * 1000;

  if (!emailRateLimit.has(email)) {
    emailRateLimit.set(email, [now]);
    return { allowed: true, reason: null };
  }

  const timestamps = emailRateLimit.get(email);
  
  // Clean up old timestamps
  const recentTimestamps = timestamps.filter(t => t > oneDayAgo);
  
  // Check hourly limit
  const lastHourCount = recentTimestamps.filter(t => t > oneHourAgo).length;
  if (lastHourCount >= MAX_EMAILS_PER_HOUR) {
    return { 
      allowed: false, 
      reason: `Hourly email limit (${MAX_EMAILS_PER_HOUR}) exceeded for ${email}` 
    };
  }

  // Check daily limit
  if (recentTimestamps.length >= MAX_EMAILS_PER_DAY) {
    return { 
      allowed: false, 
      reason: `Daily email limit (${MAX_EMAILS_PER_DAY}) exceeded for ${email}` 
    };
  }

  // Update timestamps
  recentTimestamps.push(now);
  emailRateLimit.set(email, recentTimestamps);

  return { allowed: true, reason: null };
};

// ============================================================================
// SECURITY: Sanitize email content
// ============================================================================
const sanitizeHtml = (text) => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

// ============================================================================
// HTML Email Templates
// ============================================================================

const emailTemplates = {
  welcome: (name, email) => `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; font-weight: bold; }
            .button:hover { background: #764ba2; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
            .highlight { color: #667eea; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Welcome to ${appName}!</h1>
            </div>
            <div class="content">
                <p>Hi <span class="highlight">${sanitizeHtml(name)}</span>,</p>
                <p>Thank you for signing up with <strong>${appName}</strong>. We're thrilled to have you on board!</p>
                <p>Your account has been successfully created and is ready to use. You can now:</p>
                <ul>
                    <li>Browse our premium products and services</li>
                    <li>Book classes with our expert tutors</li>
                    <li>Track your orders in real-time</li>
                    <li>Access exclusive member benefits</li>
                </ul>
                <p>If you have any questions, feel free to reach out to our support team anytime.</p>
                <a href="${appUrl}" class="button">Get Started</a>
                <div class="footer">
                    <p>© ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
                    <p>This is an automated message, please do not reply to this email.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `,

  orderConfirmation: (customerName, orderNumber, items, totalAmount, deliveryAddress, subtotal) => `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .order-details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .order-number { font-size: 24px; font-weight: bold; color: #667eea; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background: #667eea; color: white; }
            .summary { margin-top: 20px; padding: 15px; background: #e8e8ff; border-radius: 5px; }
            .total { font-size: 18px; font-weight: bold; color: #667eea; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>✓ Order Confirmed</h1>
            </div>
            <div class="content">
                <p>Hi <strong>${sanitizeHtml(customerName)}</strong>,</p>
                <p>Thank you for your order! We've received your payment and are processing it.</p>
                
                <div class="order-details">
                    <p>Order Number: <span class="order-number">${sanitizeHtml(orderNumber)}</span></p>
                    <p>Date: ${new Date().toLocaleDateString()}</p>
                </div>

                <h3>Order Items:</h3>
                <table>
                    <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Total</th>
                    </tr>
                    ${items.map(item => `
                        <tr>
                            <td>${sanitizeHtml(item.product_name || item.name)}</td>
                            <td>${item.quantity}</td>
                            <td>₦${(item.price).toLocaleString()}</td>
                            <td>₦${(item.quantity * item.price).toLocaleString()}</td>
                        </tr>
                    `).join('')}
                </table>

                <div class="summary">
                    <p>Subtotal: <strong>₦${parseFloat(subtotal).toLocaleString()}</strong></p>
                    <p class="total">Total Amount: ₦${parseFloat(totalAmount).toLocaleString()}</p>
                </div>

                <h3>Delivery Address:</h3>
                <p>${sanitizeHtml(deliveryAddress.street_address)}<br>
                ${sanitizeHtml(deliveryAddress.city)}, ${sanitizeHtml(deliveryAddress.state)} ${sanitizeHtml(deliveryAddress.postal_code)}</p>

                <p style="color: #666; font-size: 14px; margin-top: 20px;">
                    You'll receive a shipping notification email once your order is dispatched. Your order typically ships within 1-2 business days.
                </p>

                <div class="footer">
                    <p>© ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `,

  orderShipped: (customerName, orderNumber, items, deliveryAddress, estimatedDelivery) => `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .status-badge { display: inline-block; background: #38ef7d; color: white; padding: 10px 20px; border-radius: 20px; font-weight: bold; }
            .details-box { background: white; padding: 15px; border-left: 4px solid #38ef7d; margin: 15px 0; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📦 Your Order is On the Way!</h1>
            </div>
            <div class="content">
                <p>Hi <strong>${sanitizeHtml(customerName)}</strong>,</p>
                <p>Great news! Your order has been shipped and is on its way to you.</p>
                
                <div style="text-align: center; margin: 20px 0;">
                    <span class="status-badge">SHIPPED</span>
                </div>

                <div class="details-box">
                    <p><strong>Order Number:</strong> ${sanitizeHtml(orderNumber)}</p>
                    <p><strong>Shipped Date:</strong> ${new Date().toLocaleDateString()}</p>
                    <p><strong>Estimated Delivery:</strong> ${estimatedDelivery || '3-5 business days'}</p>
                </div>

                <h3>Items Shipped:</h3>
                <ul>
                    ${items.map(item => `
                        <li>${sanitizeHtml(item.product_name || item.name)} (x${item.quantity})</li>
                    `).join('')}
                </ul>

                <h3>Delivery Address:</h3>
                <p>${sanitizeHtml(deliveryAddress.street_address)}<br>
                ${sanitizeHtml(deliveryAddress.city)}, ${sanitizeHtml(deliveryAddress.state)} ${sanitizeHtml(deliveryAddress.postal_code)}</p>

                <p style="color: #666; font-size: 14px; margin-top: 20px;">
                    You'll receive another email when your order has been delivered. If you don't receive it within the estimated timeframe, please contact our support team.
                </p>

                <div class="footer">
                    <p>© ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `,

  orderDelivered: (customerName, orderNumber) => `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0093E9 0%, #80D0C7 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .status-badge { display: inline-block; background: #0093E9; color: white; padding: 10px 20px; border-radius: 20px; font-weight: bold; font-size: 16px; }
            .button { display: inline-block; background: #0093E9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; font-weight: bold; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>✓ Order Delivered!</h1>
            </div>
            <div class="content">
                <p>Hi <strong>${sanitizeHtml(customerName)}</strong>,</p>
                <p>Excellent news! Your order has been successfully delivered.</p>
                
                <div style="text-align: center; margin: 20px 0;">
                    <span class="status-badge">DELIVERED ✓</span>
                </div>

                <p><strong>Order Number:</strong> ${sanitizeHtml(orderNumber)}</p>
                <p><strong>Delivered Date:</strong> ${new Date().toLocaleDateString()}</p>

                <p style="margin-top: 20px;">We hope you're satisfied with your purchase! If you have any feedback or concerns, please don't hesitate to reach out.</p>

                <p style="color: #666; font-size: 14px; margin-top: 20px;">
                    Your feedback helps us improve. Consider leaving a review for the products you ordered.
                </p>

                <div class="footer">
                    <p>© ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `,

  orderCancelled: (customerName, orderNumber, reason = null) => `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .status-badge { display: inline-block; background: #f5576c; color: white; padding: 10px 20px; border-radius: 20px; font-weight: bold; }
            .details-box { background: white; padding: 15px; border-left: 4px solid #f5576c; margin: 15px 0; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Order Cancelled</h1>
            </div>
            <div class="content">
                <p>Hi <strong>${sanitizeHtml(customerName)}</strong>,</p>
                <p>Your order has been cancelled.</p>
                
                <div style="text-align: center; margin: 20px 0;">
                    <span class="status-badge">CANCELLED</span>
                </div>

                <div class="details-box">
                    <p><strong>Order Number:</strong> ${sanitizeHtml(orderNumber)}</p>
                    <p><strong>Cancellation Date:</strong> ${new Date().toLocaleDateString()}</p>
                    ${reason ? `<p><strong>Reason:</strong> ${sanitizeHtml(reason)}</p>` : ''}
                </div>

                <p style="color: #666; font-size: 14px; margin-top: 20px;">
                    If you have any questions about this cancellation, please contact our support team. Any refunds will be processed according to our refund policy.
                </p>

                <div class="footer">
                    <p>© ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `
};

// ============================================================================
// Email Sending Functions with Error Handling
// ============================================================================

/**
 * Send a generic email with error handling and logging
 * @param {Object} options - Email options { to, subject, html, retries }
 * @returns {Promise<Object>} - { success, messageId, error }
 */
const sendEmail = async (options) => {
  const { to, subject, html, retries = 2 } = options;
  let lastError = null;

  // SECURITY: Rate limit check
  const rateLimit = checkEmailRateLimit(to);
  if (!rateLimit.allowed) {
    console.warn(`⚠️  Email rate limit exceeded: ${rateLimit.reason}`);
    return {
      success: false,
      messageId: null,
      error: 'Email rate limit exceeded. Please try again later.'
    };
  }

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const mailOptions = {
        from: `"${appName}" <${emailUser}>`,
        to: to,
        subject: subject,
        html: html,
        // SECURITY: Disable dangerous features
        disableHtmlEscaping: false,
        textEncoding: 'base64'
      };

      const info = await transporter.sendMail(mailOptions);

      console.log(`✅ Email sent successfully to ${to} (Message ID: ${info.messageId})`);
      return {
        success: true,
        messageId: info.messageId,
        error: null
      };
    } catch (error) {
      lastError = error;
      console.warn(`⚠️  Email send attempt ${attempt + 1}/${retries} failed for ${to}: ${error.message}`);

      // Exponential backoff for retries
      if (attempt < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
      }
    }
  }

  console.error(`❌ Email failed after ${retries} attempts to ${to}:`, lastError.message);
  return {
    success: false,
    messageId: null,
    error: lastError.message
  };
};

// ============================================================================
// PUBLIC EMAIL SERVICE FUNCTIONS
// ============================================================================

/**
 * Send welcome email to new user
 * @param {string} email - User email
 * @param {string} name - User name
 * @returns {Promise<Object>}
 */
export const sendWelcomeEmail = async (email, name) => {
  try {
    const html = emailTemplates.welcome(name, email);
    return await sendEmail({
      to: email,
      subject: `Welcome to ${appName}! 🎉`,
      html,
      retries: 2
    });
  } catch (error) {
    console.error('Error in sendWelcomeEmail:', error.message);
    return { success: false, messageId: null, error: error.message };
  }
};

/**
 * Send order confirmation email
 * @param {Object} orderData - { customerName, customerEmail, orderNumber, items, totalAmount, subtotal, street_address, city, state, postal_code }
 * @returns {Promise<Object>}
 */
export const sendOrderConfirmationEmail = async (orderData) => {
  try {
    const {
      customerName,
      customerEmail,
      orderNumber,
      items,
      totalAmount,
      subtotal,
      street_address,
      city,
      state,
      postal_code
    } = orderData;

    const html = emailTemplates.orderConfirmation(
      customerName,
      orderNumber,
      items,
      totalAmount,
      { street_address, city, state, postal_code },
      subtotal
    );

    return await sendEmail({
      to: customerEmail,
      subject: `Order Confirmation: ${orderNumber} ✓`,
      html,
      retries: 3
    });
  } catch (error) {
    console.error('Error in sendOrderConfirmationEmail:', error.message);
    return { success: false, messageId: null, error: error.message };
  }
};

/**
 * Send order shipped email
 * @param {Object} orderData - { customerName, customerEmail, orderNumber, items, street_address, city, state, postal_code, estimatedDelivery }
 * @returns {Promise<Object>}
 */
export const sendOrderShippedEmail = async (orderData) => {
  try {
    const {
      customerName,
      customerEmail,
      orderNumber,
      items,
      street_address,
      city,
      state,
      postal_code,
      estimatedDelivery = '3-5 business days'
    } = orderData;

    const html = emailTemplates.orderShipped(
      customerName,
      orderNumber,
      items,
      { street_address, city, state, postal_code },
      estimatedDelivery
    );

    return await sendEmail({
      to: customerEmail,
      subject: `Your Order is Shipped: ${orderNumber} 📦`,
      html,
      retries: 2
    });
  } catch (error) {
    console.error('Error in sendOrderShippedEmail:', error.message);
    return { success: false, messageId: null, error: error.message };
  }
};

/**
 * Send order delivered email
 * @param {Object} orderData - { customerName, customerEmail, orderNumber }
 * @returns {Promise<Object>}
 */
export const sendOrderDeliveredEmail = async (orderData) => {
  try {
    const { customerName, customerEmail, orderNumber } = orderData;

    const html = emailTemplates.orderDelivered(customerName, orderNumber);

    return await sendEmail({
      to: customerEmail,
      subject: `Order Delivered: ${orderNumber} ✓`,
      html,
      retries: 2
    });
  } catch (error) {
    console.error('Error in sendOrderDeliveredEmail:', error.message);
    return { success: false, messageId: null, error: error.message };
  }
};

/**
 * Send order cancelled email
 * @param {Object} orderData - { customerName, customerEmail, orderNumber, reason }
 * @returns {Promise<Object>}
 */
export const sendOrderCancelledEmail = async (orderData) => {
  try {
    const { customerName, customerEmail, orderNumber, reason = null } = orderData;

    const html = emailTemplates.orderCancelled(customerName, orderNumber, reason);

    return await sendEmail({
      to: customerEmail,
      subject: `Order Cancelled: ${orderNumber}`,
      html,
      retries: 2
    });
  } catch (error) {
    console.error('Error in sendOrderCancelledEmail:', error.message);
    return { success: false, messageId: null, error: error.message };
  }
};

export default {
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendOrderShippedEmail,
  sendOrderDeliveredEmail,
  sendOrderCancelledEmail
};
