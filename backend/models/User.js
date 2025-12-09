const { query } = require('../config/database');
const bcrypt = require('bcrypt');

class User {
  // Create a new user
  static async create(userData) {
    const { username, email, password, role = 'client', full_name, phone, address } = userData;
    
    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const sql = `
      INSERT INTO users (username, email, password_hash, role, full_name, phone, address)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, username, email, role, full_name, phone, address, kyc_verified, created_at
    `;

    const values = [username, email, password_hash, role, full_name, phone, address];
    const result = await query(sql, values);
    return result.rows[0];
  }

  // Find user by ID
  static async findById(id) {
    const sql = `
      SELECT id, username, email, role, full_name, phone, address, kyc_verified, 
             date_of_birth, gender, occupation, company_name, annual_income,
             pan_number, aadhar_number, emergency_contact_name, emergency_contact_phone,
             emergency_contact_relation, aadhar_front_url, aadhar_back_url, 
             pan_card_url, bank_statement_url, salary_slip_url, profile_photo_url,
             created_at, updated_at
      FROM users
      WHERE id = $1
    `;
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // Find user by email
  static async findByEmail(email) {
    const sql = `
      SELECT *
      FROM users
      WHERE email = $1
    `;
    const result = await query(sql, [email]);
    return result.rows[0];
  }

  // Find user by username
  static async findByUsername(username) {
    const sql = `
      SELECT *
      FROM users
      WHERE username = $1
    `;
    const result = await query(sql, [username]);
    return result.rows[0];
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Update user
  static async update(id, updates) {
    const allowedUpdates = [
      'full_name', 'phone', 'address', 'kyc_verified',
      'date_of_birth', 'gender', 'occupation', 'company_name', 'annual_income',
      'pan_number', 'aadhar_number',
      'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relation',
      'aadhar_front_url', 'aadhar_back_url', 'pan_card_url', 
      'bank_statement_url', 'salary_slip_url', 'profile_photo_url'
    ];
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updateFields.push(`${key} = $${paramCount}`);
        values.push(updates[key]);
        paramCount++;
      }
    });

    if (updateFields.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(id);
    const sql = `
      UPDATE users
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING id, username, email, role, full_name, phone, address, kyc_verified, 
                date_of_birth, gender, occupation, company_name, annual_income,
                pan_number, aadhar_number, emergency_contact_name, emergency_contact_phone,
                emergency_contact_relation, aadhar_front_url, aadhar_back_url, 
                pan_card_url, bank_statement_url, salary_slip_url, profile_photo_url, updated_at
    `;

    const result = await query(sql, values);
    return result.rows[0];
  }

  // Get all users (admin only)
  static async findAll(filters = {}) {
    let sql = `
      SELECT id, username, email, role, full_name, phone, kyc_verified, created_at
      FROM users
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (filters.role) {
      sql += ` AND role = $${paramCount}`;
      values.push(filters.role);
      paramCount++;
    }

    if (filters.kyc_verified !== undefined) {
      sql += ` AND kyc_verified = $${paramCount}`;
      values.push(filters.kyc_verified);
      paramCount++;
    }

    sql += ' ORDER BY created_at DESC';

    if (filters.limit) {
      sql += ` LIMIT $${paramCount}`;
      values.push(filters.limit);
      paramCount++;
    }

    if (filters.offset) {
      sql += ` OFFSET $${paramCount}`;
      values.push(filters.offset);
    }

    const result = await query(sql, values);
    return result.rows;
  }

  // Delete user
  static async delete(id) {
    const sql = 'DELETE FROM users WHERE id = $1 RETURNING id';
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // Update password
  static async updatePassword(id, newPassword) {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
    const password_hash = await bcrypt.hash(newPassword, saltRounds);

    const sql = `
      UPDATE users
      SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id
    `;

    const result = await query(sql, [password_hash, id]);
    return result.rows[0];
  }

  // Check if email exists
  static async emailExists(email) {
    const sql = 'SELECT id FROM users WHERE email = $1';
    const result = await query(sql, [email]);
    return result.rows.length > 0;
  }

  // Check if username exists
  static async usernameExists(username) {
    const sql = 'SELECT id FROM users WHERE username = $1';
    const result = await query(sql, [username]);
    return result.rows.length > 0;
  }
}

module.exports = User;
