// routes/auth.js
import express from "express";
import {
  signup,
  login,
  loginWithPhone,
  refreshToken,
  logout,
  sendOtp,
  verifyOtp,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";

const router = express.Router();

// signup/login
router.post("/signup", signup);
router.post("/login", login);
router.post("/login-phone", loginWithPhone);

// OTP (reusable)
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

// token
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);

// profile & security
router.put("/update-profile", updateProfile);
router.put("/change-password", changePassword);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
