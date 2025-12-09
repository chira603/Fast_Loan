const { query } = require('../config/database');

class Recharge {
  // Create recharge
  static async create(rechargeData) {
    const {
      user_id,
      recharge_type,
      operator_name,
      circle,
      mobile_number,
      account_number,
      amount,
      plan_id,
      plan_details,
      status,
      transaction_id,
      operator_transaction_id
    } = rechargeData;

    const sql = `
      INSERT INTO recharges (
        user_id, recharge_type, operator_name, circle, mobile_number,
        account_number, amount, plan_id, plan_details, status,
        transaction_id, operator_transaction_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    const values = [
      user_id,
      recharge_type,
      operator_name,
      circle,
      mobile_number,
      account_number,
      amount,
      plan_id,
      JSON.stringify(plan_details || {}),
      status || 'pending',
      transaction_id || `RCH${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      operator_transaction_id
    ];

    const result = await query(sql, values);
    return result.rows[0];
  }

  // Find by ID
  static async findById(id) {
    const sql = 'SELECT * FROM recharges WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // Find by user
  static async findByUserId(userId, filters = {}) {
    let sql = 'SELECT * FROM recharges WHERE user_id = $1';
    const values = [userId];
    let paramCount = 2;

    if (filters.recharge_type) {
      sql += ` AND recharge_type = $${paramCount}`;
      values.push(filters.recharge_type);
      paramCount++;
    }

    if (filters.status) {
      sql += ` AND status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    sql += ' ORDER BY payment_date DESC';

    if (filters.limit) {
      sql += ` LIMIT $${paramCount}`;
      values.push(filters.limit);
    }

    const result = await query(sql, values);
    return result.rows;
  }

  // Update status
  static async updateStatus(id, status, operatorTxnId = null) {
    const sql = `
      UPDATE recharges
      SET status = $1, operator_transaction_id = $2
      WHERE id = $3
      RETURNING *
    `;
    const result = await query(sql, [status, operatorTxnId, id]);
    return result.rows[0];
  }

  // Get statistics for user
  static async getStatsByUserId(userId) {
    const sql = `
      SELECT 
        COUNT(*) as total_recharges,
        COUNT(CASE WHEN status = 'success' THEN 1 END) as successful_recharges,
        COALESCE(SUM(CASE WHEN status = 'success' THEN amount ELSE 0 END), 0) as total_amount_recharged,
        COUNT(CASE WHEN recharge_type = 'MOBILE' THEN 1 END) as mobile_recharges,
        COUNT(CASE WHEN recharge_type = 'DTH' THEN 1 END) as dth_recharges
      FROM recharges
      WHERE user_id = $1
    `;
    const result = await query(sql, [userId]);
    return result.rows[0];
  }
}

module.exports = Recharge;
