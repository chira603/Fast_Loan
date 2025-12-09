const pool = require('../config/database');

class Otp {
  // Create a new OTP record
  static async create(email, phone, otpCode, expiresAt) {
    const query = `
      INSERT INTO otps (email, phone, otp_code, expires_at)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [email || null, phone || null, otpCode, expiresAt];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Find OTP by email
  static async findByEmail(email) {
    const query = `
      SELECT * FROM otps
      WHERE email = $1 AND verified = false AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  // Find OTP by phone
  static async findByPhone(phone) {
    const query = `
      SELECT * FROM otps
      WHERE phone = $1 AND verified = false AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const result = await pool.query(query, [phone]);
    return result.rows[0];
  }

  // Verify OTP by email
  static async verifyByEmail(email, otpCode) {
    const query = `
      UPDATE otps
      SET verified = true
      WHERE email = $1 AND otp_code = $2 AND verified = false AND expires_at > NOW()
      RETURNING *
    `;
    const result = await pool.query(query, [email, otpCode]);
    return result.rows[0];
  }

  // Verify OTP by phone
  static async verifyByPhone(phone, otpCode) {
    const query = `
      UPDATE otps
      SET verified = true
      WHERE phone = $1 AND otp_code = $2 AND verified = false AND expires_at > NOW()
      RETURNING *
    `;
    const result = await pool.query(query, [phone, otpCode]);
    return result.rows[0];
  }

  // Delete expired OTPs (cleanup)
  static async deleteExpired() {
    const query = `
      DELETE FROM otps
      WHERE expires_at < NOW()
      RETURNING *
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  // Check if email is verified
  static async isEmailVerified(email) {
    const query = `
      SELECT * FROM otps
      WHERE email = $1 AND verified = true
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const result = await pool.query(query, [email]);
    return result.rows.length > 0;
  }

  // Check if phone is verified
  static async isPhoneVerified(phone) {
    const query = `
      SELECT * FROM otps
      WHERE phone = $1 AND verified = true
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const result = await pool.query(query, [phone]);
    return result.rows.length > 0;
  }
}

module.exports = Otp;
