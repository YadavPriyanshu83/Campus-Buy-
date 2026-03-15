const User = require("../models/User");
const TempUser = require("../models/TempUser");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");

// 📧 Email transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // SSL
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASS,
  },
});


// ✅ Send OTP
exports.sendOtp = async (req, res) => {
  const { email, name, password, branch, whatsapp } = req.body;

  if (!email.endsWith("@mmmut.ac.in")) {
    return res.status(400).json({ message: "Only MMMUT emails allowed" });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "Email already registered" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = Date.now() + 10 * 60 * 1000;

  // Store in TempUser collection
  await TempUser.findOneAndUpdate(
    { email },
    { email, name, password, branch, whatsapp, otp, otpExpires },
    { upsert: true, new: true }
  );

  // Send mail
  await transporter.sendMail(
    {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "MMMUT OTP Verification",
      text: `Your OTP is: ${otp}. It is valid for 10 minutes.`,
    },
    (err, info) => {
      if (err) {
        console.error("❌ Email sending failed:", err);
      } else {
        console.log("📧 Email sent successfully:", info.response);
      }
    }
  );

  res.json({ message: "OTP sent to email" });
};

// ✅ Verify OTP and Register User
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  const tempUser = await TempUser.findOne({ email });

  if (!tempUser || tempUser.otp !== otp || tempUser.otpExpires < Date.now()) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  const hashedPassword = await bcrypt.hash(tempUser.password, 10);

  const newUser = new User({
    name: tempUser.name,
    email: tempUser.email,
    password: hashedPassword,
    branch: tempUser.branch || '',
    whatsapp: tempUser.whatsapp || '',
  });

  await newUser.save();
  await TempUser.deleteOne({ email });

  res
    .status(200)
    .json({ message: "User registered successfully. Please login." });
};

// ✅ Login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });

  // Don't send password in the response
  const { password: pwd, ...userData } = user._doc;

  res.json({ token, user: userData });
};

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { whatsapp, profileImage, branch } = req.body;
    const updateData = {};
    
    // Only update fields that are provided
    if (whatsapp !== undefined) updateData.whatsapp = whatsapp;
    if (profileImage !== undefined) updateData.profileImage = profileImage;
    if (branch !== undefined) updateData.branch = branch;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
