const { query } = require('../config/database');

class Contact {
  // Create a new contact submission
  static async create(contactData) {
    const { user_id = null, name, email, message } = contactData;

    const sql = `
      INSERT INTO contacts (user_id, name, email, message)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const values = [user_id, name, email, message];
    const result = await query(sql, values);
    return result.rows[0];
  }

  // Find contact by ID
  static async findById(id) {
    const sql = 'SELECT * FROM contacts WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // Get all contact submissions
  static async findAll(filters = {}) {
    let sql = 'SELECT * FROM contacts WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (filters.resolved !== undefined) {
      sql += ` AND resolved = $${paramCount}`;
      values.push(filters.resolved);
      paramCount++;
    }

    if (filters.user_id) {
      sql += ` AND user_id = $${paramCount}`;
      values.push(filters.user_id);
      paramCount++;
    }

    sql += ' ORDER BY submitted_at DESC';

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

  // Mark as resolved
  static async markResolved(id) {
    const sql = `
      UPDATE contacts
      SET resolved = true
      WHERE id = $1
      RETURNING *
    `;
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // Delete contact
  static async delete(id) {
    const sql = 'DELETE FROM contacts WHERE id = $1 RETURNING id';
    const result = await query(sql, [id]);
    return result.rows[0];
  }
}

module.exports = Contact;
