import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Order } from '../order/entity/order.entity';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  /**
   * Initialize email transporter
   * Supports Gmail and custom SMTP
   */
  private initializeTransporter() {
    const emailProvider = this.configService.get<string>('EMAIL_PROVIDER') || 'gmail';

    if (emailProvider === 'gmail') {
      // Gmail configuration
      this.transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          user: this.configService.get<string>('GMAIL_USER'),
          pass: this.configService.get<string>('GMAIL_PASS'),
        },
      });
      this.logger.log('Email transporter initialized with Gmail');
    } else {
      // Custom SMTP configuration
      this.transporter = nodemailer.createTransporter({
        host: this.configService.get<string>('SMTP_HOST'),
        port: this.configService.get<number>('SMTP_PORT') || 587,
        secure: this.configService.get<boolean>('SMTP_SECURE') || false,
        auth: {
          user: this.configService.get<string>('SMTP_USER'),
          pass: this.configService.get<string>('SMTP_PASS'),
        },
      });
      this.logger.log('Email transporter initialized with custom SMTP');
    }
  }

  /**
   * Send order confirmation email
   * @param order - Order entity
   */
  async sendOrderConfirmation(order: Order): Promise<void> {
    try {
      const fromEmail = this.configService.get<string>('EMAIL_FROM') || 'noreply@ecommerce.com';
      const fromName = this.configService.get<string>('EMAIL_FROM_NAME') || 'E-commerce Store';

      const mailOptions = {
        from: `"${fromName}" <${fromEmail}>`,
        to: order.email,
        subject: `Order Confirmation - ${order.reference}`,
        html: this.getOrderConfirmationTemplate(order),
        text: this.getOrderConfirmationText(order),
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Order confirmation email sent to: ${order.email} (Order: ${order.reference})`);
    } catch (error) {
      // Log error but don't throw - we don't want email failures to break the webhook
      this.logger.error(`Failed to send order confirmation email: ${error.message}`, error.stack);
    }
  }

  /**
   * Send payment receipt email
   * @param order - Order entity
   */
  async sendPaymentReceipt(order: Order): Promise<void> {
    try {
      const fromEmail = this.configService.get<string>('EMAIL_FROM') || 'noreply@ecommerce.com';
      const fromName = this.configService.get<string>('EMAIL_FROM_NAME') || 'E-commerce Store';

      const mailOptions = {
        from: `"${fromName}" <${fromEmail}>`,
        to: order.email,
        subject: `Payment Receipt - ${order.reference}`,
        html: this.getPaymentReceiptTemplate(order),
        text: this.getPaymentReceiptText(order),
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Payment receipt email sent to: ${order.email} (Order: ${order.reference})`);
    } catch (error) {
      this.logger.error(`Failed to send payment receipt email: ${error.message}`, error.stack);
    }
  }

  /**
   * HTML template for order confirmation
   */
  private getOrderConfirmationTemplate(order: Order): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #4CAF50;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
          }
          .content {
            background-color: #f9f9f9;
            padding: 30px;
            border: 1px solid #ddd;
            border-radius: 0 0 5px 5px;
          }
          .order-details {
            background-color: white;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
            border: 1px solid #e0e0e0;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #f0f0f0;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .label {
            font-weight: bold;
            color: #666;
          }
          .value {
            color: #333;
          }
          .amount {
            font-size: 24px;
            font-weight: bold;
            color: #4CAF50;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 12px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #4CAF50;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>✓ Order Confirmed!</h1>
        </div>
        <div class="content">
          <p>Dear Customer,</p>
          <p>Thank you for your purchase! Your order has been confirmed and payment received successfully.</p>
          
          <div class="order-details">
            <h2>Order Details</h2>
            <div class="detail-row">
              <span class="label">Order Reference:</span>
              <span class="value">${order.reference}</span>
            </div>
            <div class="detail-row">
              <span class="label">Amount Paid:</span>
              <span class="value amount">₦${order.amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div class="detail-row">
              <span class="label">Status:</span>
              <span class="value" style="color: #4CAF50; font-weight: bold;">${order.status.toUpperCase()}</span>
            </div>
            <div class="detail-row">
              <span class="label">Date:</span>
              <span class="value">${new Date(order.createdAt).toLocaleString('en-NG')}</span>
            </div>
            ${order.productId ? `
            <div class="detail-row">
              <span class="label">Product ID:</span>
              <span class="value">${order.productId}</span>
            </div>
            ` : ''}
          </div>

          <p>We're processing your order and will notify you once it's ready for delivery.</p>
          
          <p>If you have any questions about your order, please don't hesitate to contact us.</p>
          
          <p>Best regards,<br>
          <strong>E-commerce Store Team</strong></p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
          <p>&copy; ${new Date().getFullYear()} E-commerce Store. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Plain text version for order confirmation
   */
  private getOrderConfirmationText(order: Order): string {
    return `
ORDER CONFIRMED!

Dear Customer,

Thank you for your purchase! Your order has been confirmed and payment received successfully.

ORDER DETAILS:
--------------
Order Reference: ${order.reference}
Amount Paid: ₦${order.amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
Status: ${order.status.toUpperCase()}
Date: ${new Date(order.createdAt).toLocaleString('en-NG')}
${order.productId ? `Product ID: ${order.productId}` : ''}

We're processing your order and will notify you once it's ready for delivery.

If you have any questions about your order, please don't hesitate to contact us.

Best regards,
E-commerce Store Team

---
This is an automated email. Please do not reply to this message.
© ${new Date().getFullYear()} E-commerce Store. All rights reserved.
    `;
  }

  /**
   * HTML template for payment receipt
   */
  private getPaymentReceiptTemplate(order: Order): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Receipt</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #2196F3;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
          }
          .content {
            background-color: #f9f9f9;
            padding: 30px;
            border: 1px solid #ddd;
            border-radius: 0 0 5px 5px;
          }
          .receipt {
            background-color: white;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
            border: 2px solid #2196F3;
          }
          .receipt-header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 2px solid #f0f0f0;
            margin-bottom: 20px;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #f0f0f0;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .label {
            font-weight: bold;
            color: #666;
          }
          .value {
            color: #333;
          }
          .total {
            font-size: 24px;
            font-weight: bold;
            color: #2196F3;
            text-align: center;
            padding: 20px 0;
            margin-top: 20px;
            border-top: 2px solid #2196F3;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>💳 Payment Receipt</h1>
        </div>
        <div class="content">
          <p>Dear Customer,</p>
          <p>This is your official payment receipt for order <strong>${order.reference}</strong>.</p>
          
          <div class="receipt">
            <div class="receipt-header">
              <h2>OFFICIAL RECEIPT</h2>
              <p style="color: #666; margin: 5px 0;">E-commerce Store</p>
            </div>
            
            <div class="detail-row">
              <span class="label">Receipt Number:</span>
              <span class="value">${order.reference}</span>
            </div>
            <div class="detail-row">
              <span class="label">Payment Date:</span>
              <span class="value">${new Date(order.createdAt).toLocaleString('en-NG')}</span>
            </div>
            <div class="detail-row">
              <span class="label">Customer Email:</span>
              <span class="value">${order.email}</span>
            </div>
            <div class="detail-row">
              <span class="label">Payment Method:</span>
              <span class="value">Paystack</span>
            </div>
            <div class="detail-row">
              <span class="label">Payment Status:</span>
              <span class="value" style="color: #4CAF50; font-weight: bold;">${order.status.toUpperCase()}</span>
            </div>
            
            <div class="total">
              TOTAL PAID: ₦${order.amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <p>Please keep this receipt for your records.</p>
          
          <p>Thank you for your business!</p>
          
          <p>Best regards,<br>
          <strong>E-commerce Store Team</strong></p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
          <p>&copy; ${new Date().getFullYear()} E-commerce Store. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Plain text version for payment receipt
   */
  private getPaymentReceiptText(order: Order): string {
    return `
PAYMENT RECEIPT

Dear Customer,

This is your official payment receipt for order ${order.reference}.

RECEIPT DETAILS:
----------------
Receipt Number: ${order.reference}
Payment Date: ${new Date(order.createdAt).toLocaleString('en-NG')}
Customer Email: ${order.email}
Payment Method: Paystack
Payment Status: ${order.status.toUpperCase()}

TOTAL PAID: ₦${order.amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}

Please keep this receipt for your records.

Thank you for your business!

Best regards,
E-commerce Store Team

---
This is an automated email. Please do not reply to this message.
© ${new Date().getFullYear()} E-commerce Store. All rights reserved.
    `;
  }

  /**
   * Test email configuration
   * Sends a test email to verify setup
   */
  async sendTestEmail(to: string): Promise<boolean> {
    try {
      const fromEmail = this.configService.get<string>('EMAIL_FROM') || 'noreply@ecommerce.com';
      const fromName = this.configService.get<string>('EMAIL_FROM_NAME') || 'E-commerce Store';

      await this.transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to,
        subject: 'Test Email - E-commerce API',
        html: '<h1>Email Configuration Test</h1><p>If you received this email, your email configuration is working correctly!</p>',
        text: 'Email Configuration Test\n\nIf you received this email, your email configuration is working correctly!',
      });

      this.logger.log(`Test email sent successfully to: ${to}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send test email: ${error.message}`, error.stack);
      return false;
    }
  }
}
