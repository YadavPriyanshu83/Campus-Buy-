const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: String,
  password: String,
  otp: String,
  otpExpires: Date,
  branch: { type: String, default: '' },
  whatsapp: { type: String, default: '' },
  profileImage: { type: String, default: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png' }
});

module.exports = mongoose.model("User", userSchema);
