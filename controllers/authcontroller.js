import User from "../models/users.js";
import Otp from "../models/otp.js"; // new model for OTPs
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Otp from "../models/otp.js";

// ------------------------
// Helper: generate access & refresh tokens
// ------------------------
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};

// ------------------------
// Signup (email/password)
// ------------------------
export const signup = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // Check if user already exists by email or phone
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });
    if (existingUser)
      return res.status(400).json({ msg: "User already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);
    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      msg: "User created",
      user: { id: user._id, email: user.email, phone: user.phone, role: user.role },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// ------------------------
// Login (email/password)
// ------------------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const { accessToken, refreshToken } = generateTokens(user);
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      accessToken,
      refreshToken,
      user: { id: user._id, email: user.email, phone: user.phone, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// ------------------------
// Login with phone (OTP already verified)
// ------------------------
export const loginWithPhone = async (req, res) => {
  try {
    const { phone } = req.body;

    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ msg: "User not found" });

    const { accessToken, refreshToken } = generateTokens(user);
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      accessToken,
      refreshToken,
      user: { id: user._id, phone: user.phone, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// ------------------------
// Send OTP (reusable for phone/email)
// ------------------------
export const sendOtp = async (req, res) => {
  try {
    const { type, value } = req.body; // type = "phone" | "email"

    // For testing/dev, use fixed OTP 1111
    const otpCode = "1111";

    // Save OTP in DB with expiry 5 mins
    await Otp.create({
      type,
      value,
      code: otpCode,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      isUsed: false,
    });

    console.log(`OTP for ${type} ${value}: ${otpCode}`); // log OTP for testing

    res.json({ msg: "OTP sent successfully (dummy)" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// ------------------------
// Verify OTP (reusable for phone/email)
// ------------------------
export const verifyOtp = async (req, res) => {
  try {
    const { type, value, otp } = req.body;

    const otpRecord = await Otp.findOne({
      type,
      value,
      code: otp,
      isUsed: false,
      expiresAt: { $gte: new Date() },
    });

    if (!otpRecord) return res.status(400).json({ msg: "Invalid or expired OTP" });

    otpRecord.isUsed = true;
    await otpRecord.save();

    // Check if user exists (for login or profile update)
    const user = await User.findOne({ [type]: value });

    if (user) {
      const { accessToken, refreshToken } = generateTokens(user);
      user.refreshToken = refreshToken;
      await user.save();

      return res.json({
        msg: "OTP verified",
        accessToken,
        refreshToken,
        user: { id: user._id, role: user.role, email: user.email, phone: user.phone },
      });
    }

    // If user doesn't exist (e.g., signup flow)
    res.json({ msg: "OTP verified, proceed with signup" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// ------------------------
// Update profile (phone/email change requires OTP verification)
// ------------------------
export const updateProfile = async (req, res) => {
  try {
    const { userId, updates } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // If updating phone/email, check OTP verified
    if (updates.phone || updates.email) {
      const phoneVerified = updates.phone
        ? await Otp.findOne({ type: "phone", value: updates.phone, isUsed: true })
        : true;
      const emailVerified = updates.email
        ? await Otp.findOne({ type: "email", value: updates.email, isUsed: true })
        : true;

      if (!phoneVerified || !emailVerified)
        return res.status(400).json({ msg: "OTP verification required for phone/email changes" });
    }

    Object.assign(user, updates);
    await user.save();

    res.json({ msg: "Profile updated", user });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};
