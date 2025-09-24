import express from "express";
import * as signupCtrl from "../controllers/signupController.js";
import * as authCtrl from "../controllers/authController.js";

const router = express.Router();

// Signup APIs
router.post("/send-phone-otp", signupCtrl.sendPhoneOtp);
router.post("/send-email-otp", signupCtrl.sendEmailOtp);
router.post("/verify-otp", signupCtrl.verifyOtpController); // ✅ renamed export
router.post("/", signupCtrl.signup);

// Auth APIs
router.post("/login", authCtrl.loginWithEmail);
router.post("/reset-password-request", authCtrl.resetPasswordRequest);
router.post("/reset-password-confirm", authCtrl.resetPasswordConfirm);

export default router;
