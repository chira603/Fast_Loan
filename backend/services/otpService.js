const crypto = require('crypto');
const Otp = require('../models/Otp');

class OtpService {
  // Generate a 6-digit OTP
  static generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
  }

  // Get OTP expiration time (1 minute from now)
  static getExpirationTime() {
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + 1); // Changed to 1 minute
    return expiryTime;
  }

  // Create and store OTP for email
  static async createEmailOTP(email) {
    const otpCode = this.generateOTP();
    const expiresAt = this.getExpirationTime();
    
    const otp = await Otp.create(email, null, otpCode, expiresAt);
    return {
      otpCode,
      expiresAt,
      otpId: otp.id
    };
  }

  // Create and store OTP for phone
  static async createPhoneOTP(phone) {
    const otpCode = this.generateOTP();
    const expiresAt = this.getExpirationTime();
    
    const otp = await Otp.create(null, phone, otpCode, expiresAt);
    return {
      otpCode,
      expiresAt,
      otpId: otp.id
    };
  }

  // Verify email OTP
  static async verifyEmailOTP(email, otpCode) {
    const result = await Otp.verifyByEmail(email, otpCode);
    if (!result) {
      throw new Error('Invalid or expired OTP');
    }
    return true;
  }

  // Verify phone OTP
  static async verifyPhoneOTP(phone, otpCode) {
    const result = await Otp.verifyByPhone(phone, otpCode);
    if (!result) {
      throw new Error('Invalid or expired OTP');
    }
    return true;
  }

  // Check if email is verified
  static async isEmailVerified(email) {
    return await Otp.isEmailVerified(email);
  }

  // Check if phone is verified
  static async isPhoneVerified(phone) {
    return await Otp.isPhoneVerified(phone);
  }

  // Cleanup expired OTPs
  static async cleanupExpired() {
    return await Otp.deleteExpired();
  }
}

module.exports = OtpService;
