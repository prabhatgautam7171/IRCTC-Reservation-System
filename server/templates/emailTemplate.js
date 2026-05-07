
export const generateOtpEmail = (otp, username = "User") => {
  return `
  <div style="font-family: 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
    <div style="background-color: #0b5394; color: #fff; padding: 16px 24px;">
      <h2 style="margin: 0;">IRCTC</h2>
      <p style="margin: 4px 0 0;">One Time Password (OTP) Verification</p>
    </div>
    <div style="padding: 24px;">
      <p>Dear ${username},</p>
      <p>We received a request to reset your password on the IRCTC platform. Please use the following OTP to proceed:</p>

      <div style="background-color: #f0f0f0; padding: 16px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #0b5394; border-radius: 6px;">
        ${otp}
      </div>

      <p style="margin-top: 24px;">🔒 <strong>Note:</strong> This OTP is valid for the next <strong>10 minutes</strong> only.</p>

      <p>If you did not request a password reset, please ignore this email.</p>

      <p style="margin-top: 32px;">Thank you,<br/>IRCTC Team</p>
    </div>
    <div style="background-color: #f9f9f9; padding: 12px 24px; font-size: 12px; color: #666; text-align: center;">
      This is an automated message. Please do not reply directly to this email.
    </div>
  </div>
  `;
};
