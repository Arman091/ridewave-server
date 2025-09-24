// controllers/authController.js
import User from "../models/users.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// 🔑 JWT Generator
const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

/**
 * @desc Login with Email + Password
 * @route POST /api/auth/login
 */
export const loginWithEmail = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user._id);

    return res.json({
      message: "Login successful",
      token,
      user: { id: user._id, email: user.email, phone: user.phone },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Reset Password Request
 * @route POST /api/auth/reset-password-request
 */
export const resetPasswordRequest = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    // sendResetEmail(email, `https://yourapp.com/reset/${resetToken}`);

    return res.json({ message: "Reset link sent to email" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Reset Password Confirm
 * @route POST /api/auth/reset-password-confirm
 */
export const resetPasswordConfirm = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(400).json({ message: "Invalid token" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({ message: "Password reset successful" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
