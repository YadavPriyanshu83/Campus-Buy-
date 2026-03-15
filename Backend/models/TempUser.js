const mongoose = require("mongoose");

const tempUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: String,
  password: String,
  branch: String,
  whatsapp: String,
  otp: String,
  otpExpires: Date,
});

module.exports = mongoose.model("TempUser", tempUserSchema);
