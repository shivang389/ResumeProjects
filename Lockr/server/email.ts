import nodemailer from 'nodemailer';

// Email configuration
const EMAIL_USER = process.env.EMAIL_USER || 'noreply@securetask.com';
const EMAIL_PASS = process.env.EMAIL_PASS || '';
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');

// Create transporter
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

export async function sendOTPEmail(email: string, otpCode: string) {
  try {
    const mailOptions = {
      from: `"SecureTask" <${EMAIL_USER}>`,
      to: email,
      subject: 'SecureTask - Your Login Verification Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>SecureTask - OTP Verification</title>
        </head>
        <body style="font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">SecureTask</h1>
            <p style="color: #e2e8f0; margin: 5px 0 0 0; font-size: 14px;">Protected To-Do Manager</p>
          </div>
          
          <div style="background: #ffffff; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="width: 80px; height: 80px; background: #f1f5f9; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 36px;">
                🔒
              </div>
              <h2 style="color: #1e293b; margin: 0 0 10px 0; font-size: 24px; font-weight: 600;">Secure Login Verification</h2>
              <p style="color: #64748b; margin: 0; font-size: 16px;">Please use the verification code below to complete your login</p>
            </div>

            <div style="background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0;">
              <p style="color: #64748b; margin: 0 0 15px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 500;">Your Verification Code</p>
              <div style="font-size: 36px; font-weight: 700; color: #2563eb; letter-spacing: 8px; font-family: 'Courier New', monospace; margin: 10px 0;">${otpCode}</div>
              <p style="color: #64748b; margin: 15px 0 0 0; font-size: 12px;">This code will expire in 10 minutes</p>
            </div>

            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; font-size: 14px; color: #92400e;">
                <strong>Security Notice:</strong> Never share this code with anyone. SecureTask will never ask for your verification code via email or phone.
              </p>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #64748b; margin: 0; font-size: 14px;">
                If you didn't request this code, please ignore this email or 
                <a href="#" style="color: #2563eb; text-decoration: none;">contact support</a>
              </p>
            </div>

            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">

            <div style="text-align: center; color: #94a3b8; font-size: 12px;">
              <p style="margin: 0;">© ${new Date().getFullYear()} SecureTask. All rights reserved.</p>
              <p style="margin: 5px 0 0 0;">This is an automated message, please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
SecureTask - Login Verification Code

Your verification code is: ${otpCode}

This code will expire in 10 minutes.

Security Notice: Never share this code with anyone. SecureTask will never ask for your verification code via email or phone.

If you didn't request this code, please ignore this email.

© ${new Date().getFullYear()} SecureTask. All rights reserved.
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent successfully to ${email}`);
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send verification email');
  }
}

export async function verifyEmailConfiguration() {
  try {
    await transporter.verify();
    console.log('Email server is ready to send emails');
    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
}
