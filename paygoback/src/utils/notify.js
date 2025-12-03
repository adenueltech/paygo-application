// utils/notify.js
/*const nodemailer = require('nodemailer');
const twilio = require('twilio');

// Twilio setup
const smsClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Email setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send Email Notification
 
const sendEmail = async (to, subject, message) => {
  const mailOptions = {
    from: `PayGo App <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: `<p>${message}</p>`,
  };
  await transporter.sendMail(mailOptions);
};

/**
 * Send SMS Notification
 
const sendSMS = async (to, message) => {
  await smsClient.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to,
  });
};

module.exports = { sendEmail, sendSMS };*/


// Simple notification utility that just logs to console
const sendSMS = async (to, message) => {
  console.log(`[SMS SIMULATION] To: ${to}, Message: ${message}`);
  return true; // Always return success for MVP
};

const sendEmail = async (to, subject, message) => {
  console.log(`[EMAIL SIMULATION] To: ${to}, Subject: ${subject}, Message: ${message}`);
  return true;
};

module.exports = {
  sendSMS,
  sendEmail
};