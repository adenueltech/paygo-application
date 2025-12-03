// utils/sendSMS.js
const twilio = require('twilio');

const sendSMS = async (to, message) => {
  try {
    const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE,
      to,
    });
    console.log('✅ SMS sent to', to);
  } catch (error) {
    console.error('❌ SMS failed:', error.message);
  }
};

module.exports = sendSMS;
