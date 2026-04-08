const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: "a6bdfc001@smtp-brevo.com",   
    pass: "wMnRNVj2E9xzB0b8"            
  }
});

module.exports = transporter;