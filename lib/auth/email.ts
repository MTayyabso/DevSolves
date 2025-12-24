/**
 * Email Utility
 * =============
 * Handles sending verification and password reset emails
 */

interface EmailConfig {
    host: string;
    port: number;
    user: string;
    pass: string;
}

interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
}

/**
 * Get email configuration from environment
 */
function getEmailConfig(): EmailConfig | null {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587');
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
        console.warn('Email not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env.local');
        return null;
    }

    return { host, port, user, pass };
}

/**
 * Send email using Nodemailer
 */
async function sendEmail(options: SendEmailOptions): Promise<boolean> {
    const config = getEmailConfig();

    if (!config) {
        console.log('📧 Email would be sent to:', options.to);
        console.log('📧 Subject:', options.subject);
        console.log('📧 (Email not configured - set SMTP environment variables)');
        return true; // Return true for development
    }

    try {
        const nodemailer = await import('nodemailer');

        const transporter = nodemailer.createTransport({
            host: config.host,
            port: config.port,
            secure: config.port === 465,
            auth: {
                user: config.user,
                pass: config.pass,
            },
        });

        await transporter.sendMail({
            from: `"DevSolve" <${config.user}>`,
            to: options.to,
            subject: options.subject,
            html: options.html,
        });

        console.log('✅ Email sent to:', options.to);
        return true;
    } catch (error) {
        console.error('❌ Email error:', error);
        return false;
    }
}

/**
 * Generate verification token
 */
export function generateToken(): string {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
}

/**
 * Hash a token for storage
 */
export function hashToken(token: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Get app URL
 */
function getAppUrl(): string {
    return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(
    email: string,
    name: string,
    token: string
): Promise<boolean> {
    const verifyUrl = `${getAppUrl()}/verify-email?token=${token}`;

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #ffa12e; margin: 0; font-size: 28px;">DevSolve</h1>
          </div>
          
          <h2 style="color: #0f172a; margin: 0 0 16px;">Welcome, ${name}! 👋</h2>
          
          <p style="color: #475569; line-height: 1.6; margin: 0 0 24px;">
            Thanks for signing up for DevSolve. Please verify your email address to complete your registration.
          </p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${verifyUrl}" style="display: inline-block; background: #ffa12e; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 24px 0 0;">
            If you didn't create an account, you can safely ignore this email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
          
          <p style="color: #94a3b8; font-size: 12px; margin: 0; text-align: center;">
            This link expires in 24 hours.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

    return sendEmail({
        to: email,
        subject: 'Verify your DevSolve account',
        html,
    });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
    email: string,
    name: string,
    token: string
): Promise<boolean> {
    const resetUrl = `${getAppUrl()}/reset-password?token=${token}`;

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #ffa12e; margin: 0; font-size: 28px;">DevSolve</h1>
          </div>
          
          <h2 style="color: #0f172a; margin: 0 0 16px;">Password Reset Request</h2>
          
          <p style="color: #475569; line-height: 1.6; margin: 0 0 24px;">
            Hi ${name}, we received a request to reset your password. Click the button below to create a new password.
          </p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}" style="display: inline-block; background: #ffa12e; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 24px 0 0;">
            If you didn't request a password reset, you can safely ignore this email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
          
          <p style="color: #94a3b8; font-size: 12px; margin: 0; text-align: center;">
            This link expires in 1 hour.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

    return sendEmail({
        to: email,
        subject: 'Reset your DevSolve password',
        html,
    });
}
