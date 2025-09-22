import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  type: { type: String, enum: ["phone", "email"], required: true },
  value: { type: String, required: true }, // phone number or email
  code: { type: String, required: true },  // the OTP itself
  expiresAt: { type: Date, required: true },
  isUsed: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("Otp", otpSchema);
