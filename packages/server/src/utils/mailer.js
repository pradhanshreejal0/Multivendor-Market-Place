import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'ethereal_user',
    pass: process.env.SMTP_PASS || 'ethereal_pass',
  },
});

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    if (!process.env.SMTP_HOST || process.env.SMTP_HOST === 'smtp.ethereal.email') {
      // Create test ethereal account if no SMTP provided for development
      console.log(`[Email Service - Simulated] To: ${to} | Subject: ${subject}`);
      console.log(`Body: ${text || html}`);
      return { success: true, simulated: true };
    }

    const info = await transporter.sendMail({
      from: `"ZenithBazaar Security" <${process.env.SMTP_FROM || 'noreply@zenithbazaar.com'}>`,
      to,
      subject,
      text,
      html,
    });

    console.log('Message sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    // Don't throw to prevent blocking auth flows if mail server fails
    return { success: false, error: error.message };
  }
};
