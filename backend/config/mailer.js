const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "varshachellapandiyan06@gmail.com",
    pass: "uzpwjmrzjxivkcqx"
  }
});

module.exports = transporter;