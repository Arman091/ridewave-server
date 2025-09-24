import User from "../models/users.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
// import { sendOtpToPhone, sendOtpToEmail, verifyOtp } from "../utils/otpService.js";

// 🔑 JWT Generator
const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

/**
 * @desc Send OTP to Phone for signup
 * @route POST /api/signup/send-phone-otp
 */
export const sendPhoneOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: "Phone required" });

    const { otpId, expiry } = await sendOtpToPhone(phone);

    return res.json({
      message: "OTP sent successfully",
      otpId,
      otpExpiryTime: expiry,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Send OTP to Email for signup
 * @route POST /api/signup/send-email-otp
 */
export const sendEmailOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const { otpId, expiry } = await sendOtpToEmail(email);

    return res.json({
      message: "OTP sent successfully",
      otpId,
      otpExpiryTime: expiry,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Verify OTP for signup (phone or email)
 * @route POST /api/signup/verify-otp
 */
export const verifyOtpController = async (req, res) => {
  try {
    const { otpCode, otpId } = req.body;
    if (!otpCode || !otpId)
      return res.status(400).json({ message: "OTP & otpId required" });

    const isValid = await verifyOtp(otpId, otpCode);
    if (!isValid) return res.status(400).json({ message: "Invalid OTP" });

    return res.json({ message: "OTP verified successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Signup user (after OTP verification)
 * @route POST /api/signup
 */
export const signup = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, userType } = req.body;

    // check if user already exists
    const exist = await User.findOne({ $or: [{ email }, { phone }] });
    if (exist) return res.status(400).json({ message: "User already exists" });

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      role: userType || "rider",
      password: hashedPassword,
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: user._id,
        firstName,
        lastName,
        email,
        phone,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
