const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },

  resetToken: String,
  resetTokenExpiry: Date,

  otp: String,
  otpExpiry: Date
});

module.exports = mongoose.model('User', userSchema);