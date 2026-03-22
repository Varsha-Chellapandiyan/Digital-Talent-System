const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "varshachellapandian06@gmail.com",
    pass: "varsha06"
  }
});

module.exports = transporter;