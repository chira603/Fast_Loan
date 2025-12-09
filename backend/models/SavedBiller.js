const { query } = require('../config/database');

class SavedBiller {
  // Create saved biller
  static async create(billerData) {
    const { user_id, biller_id, nickname, account_number, operator_name, category } = billerData;

    const sql = `
      INSERT INTO saved_billers (user_id, biller_id, nickname, account_number, operator_name, category)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (user_id, account_number, category) 
      DO UPDATE SET nickname = $3, biller_id = $2, operator_name = $5
      RETURNING *
    `;

    const values = [user_id, biller_id, nickname, account_number, operator_name, category];
    const result = await query(sql, values);
    return result.rows[0];
  }

  // Find by user
  static async findByUserId(userId, category = null) {
    let sql = `
      SELECT sb.*, b.name as biller_name, b.logo_url, b.category
      FROM saved_billers sb
      LEFT JOIN billers b ON sb.biller_id = b.id
      WHERE sb.user_id = $1
    `;
    const values = [userId];

    if (category) {
      sql += ' AND sb.category = $2';
      values.push(category);
    }

    sql += ' ORDER BY sb.created_at DESC';

    const result = await query(sql, values);
    return result.rows;
  }

  // Delete saved biller
  static async delete(id, userId) {
    const sql = 'DELETE FROM saved_billers WHERE id = $1 AND user_id = $2 RETURNING *';
    const result = await query(sql, [id, userId]);
    return result.rows[0];
  }

  // Find by ID
  static async findById(id) {
    const sql = 'SELECT * FROM saved_billers WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0];
  }
}

module.exports = SavedBiller;
