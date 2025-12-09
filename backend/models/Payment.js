const { query } = require('../config/database');

class Payment {
  // Create a new payment
  static async create(paymentData) {
    const {
      loan_id,
      amount,
      transaction_id,
      payment_method = 'online',
      status = 'success',
      notes
    } = paymentData;

    const sql = `
      INSERT INTO payments (loan_id, amount, transaction_id, payment_method, status, notes)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [loan_id, amount, transaction_id, payment_method, status, notes];
    const result = await query(sql, values);
    return result.rows[0];
  }

  // Find payment by ID
  static async findById(id) {
    const sql = 'SELECT * FROM payments WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // Get all payments for a loan
  static async findByLoanId(loanId) {
    const sql = `
      SELECT *
      FROM payments
      WHERE loan_id = $1
      ORDER BY payment_date DESC
    `;
    const result = await query(sql, [loanId]);
    return result.rows;
  }

  // Get all payments for a user
  static async findByUserId(userId) {
    const sql = `
      SELECT p.*, l.amount as loan_amount, l.emi
      FROM payments p
      JOIN loans l ON p.loan_id = l.id
      WHERE l.user_id = $1
      ORDER BY p.payment_date DESC
    `;
    const result = await query(sql, [userId]);
    return result.rows;
  }

  // Get payment statistics
  static async getStatistics(loanId = null) {
    let sql = `
      SELECT 
        COUNT(*) as total_payments,
        COUNT(CASE WHEN status = 'success' THEN 1 END) as successful_payments,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_payments,
        COALESCE(SUM(CASE WHEN status = 'success' THEN amount ELSE 0 END), 0) as total_paid
      FROM payments
    `;

    if (loanId) {
      sql += ' WHERE loan_id = $1';
      const result = await query(sql, [loanId]);
      return result.rows[0];
    } else {
      const result = await query(sql);
      return result.rows[0];
    }
  }

  // Update payment status
  static async updateStatus(id, status) {
    const sql = `
      UPDATE payments
      SET status = $1
      WHERE id = $2
      RETURNING *
    `;
    const result = await query(sql, [status, id]);
    return result.rows[0];
  }
}

module.exports = Payment;
