require('dotenv').config();
const transporter = require('../config/mailer');

async function testMail() {
  try {
    console.log('--- Testing Mailer ---');
    const info = await transporter.sendMail({
      from: "varshachellapandiyan06@gmail.com",
      to: "varshachellapandiyan06@gmail.com", // send to self
      subject: "Test Mail from TaskPro",
      text: "If you see this, the mailer is working!"
    });
    console.log('✅ Mail sent successfully:', info.response);
  } catch (err) {
    console.error('❌ Mailer Error:', err);
  }
}

testMail();
