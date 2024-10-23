const nodemailer = require('nodemailer');
require('dotenv/config')
// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false, // Use TLS
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD
  }
});

// Function to send email
async function sendMail(to, subject, text, html) {
  try {
    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM_ADDRESS,
      to: to,
      subject: subject,
      text: text,
      html: html
    });

    console.log('Message sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error occurred while sending email:', error);
    throw error;
  }
}

module.exports = { sendMail };