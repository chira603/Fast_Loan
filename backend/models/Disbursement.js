const pool = require('../config/database');

class Disbursement {
  /**
   * Create a disbursement record
   */
  static async create(disbursementData) {
    const {
      loan_id,
      user_id,
      amount,
      from_account,
      to_account,
      to_account_holder_name,
      to_ifsc_code,
      payment_method = 'UPI',
      notes
    } = disbursementData;

    const query = `
      INSERT INTO loan_disbursements 
      (loan_id, user_id, amount, from_account, to_account, to_account_holder_name, 
       to_ifsc_code, payment_method, status, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', $9)
      RETURNING *
    `;

    const values = [
      loan_id,
      user_id,
      amount,
      from_account,
      to_account,
      to_account_holder_name,
      to_ifsc_code,
      payment_method,
      notes || null
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Update disbursement status
   */
  static async updateStatus(id, status, updateData = {}) {
    const {
      transaction_id,
      transaction_ref,
      utr_number,
      failure_reason
    } = updateData;

    const query = `
      UPDATE loan_disbursements 
      SET status = $1,
          transaction_id = COALESCE($2, transaction_id),
          transaction_ref = COALESCE($3, transaction_ref),
          utr_number = COALESCE($4, utr_number),
          failure_reason = $5,
          disbursed_at = CASE WHEN $1 = 'completed' THEN CURRENT_TIMESTAMP ELSE disbursed_at END,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `;

    const values = [
      status,
      transaction_id || null,
      transaction_ref || null,
      utr_number || null,
      failure_reason || null,
      id
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Get disbursement by ID
   */
  static async findById(id) {
    const query = 'SELECT * FROM loan_disbursements WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Get disbursement by loan ID
   */
  static async findByLoanId(loanId) {
    const query = `
      SELECT * FROM loan_disbursements 
      WHERE loan_id = $1 
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [loanId]);
    return result.rows;
  }

  /**
   * Get disbursement by transaction reference
   */
  static async findByTransactionRef(transactionRef) {
    const query = 'SELECT * FROM loan_disbursements WHERE transaction_ref = $1';
    const result = await pool.query(query, [transactionRef]);
    return result.rows[0];
  }

  /**
   * Get all disbursements for a user
   */
  static async findByUserId(userId) {
    const query = `
      SELECT ld.*, l.amount as loan_amount, l.tenure_months, l.emi
      FROM loan_disbursements ld
      JOIN loans l ON ld.loan_id = l.id
      WHERE ld.user_id = $1
      ORDER BY ld.created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  /**
   * Get pending disbursements (admin)
   */
  static async getPendingDisbursements() {
    const query = `
      SELECT ld.*, l.amount as loan_amount, u.full_name, u.email, u.phone
      FROM loan_disbursements ld
      JOIN loans l ON ld.loan_id = l.id
      JOIN users u ON ld.user_id = u.id
      WHERE ld.status = 'pending'
      ORDER BY ld.created_at ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Get disbursement statistics
   */
  static async getStatistics() {
    const query = `
      SELECT 
        COUNT(*) as total_disbursements,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
        COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing_count,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_count,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as total_disbursed,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as pending_amount
      FROM loan_disbursements
    `;
    const result = await pool.query(query);
    return result.rows[0];
  }

  /**
   * Generate unique transaction reference
   */
  static generateTransactionRef() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `FLDSB-${timestamp}-${random}`;
  }

  /**
   * Mark disbursement as completed and update loan status
   */
  static async complete(disbursementId, transactionData) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Update disbursement status
      const updateDisbQuery = `
        UPDATE loan_disbursements 
        SET status = 'completed',
            transaction_id = $1,
            utr_number = $2,
            disbursed_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING *
      `;
      const disbResult = await client.query(updateDisbQuery, [
        transactionData.transaction_id,
        transactionData.utr_number,
        disbursementId
      ]);
      const disbursement = disbResult.rows[0];

      // Update loan status to disbursed
      const updateLoanQuery = `
        UPDATE loans 
        SET status = 'disbursed',
            disbursement_date = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;
      const loanResult = await client.query(updateLoanQuery, [disbursement.loan_id]);

      await client.query('COMMIT');

      return {
        disbursement: disbResult.rows[0],
        loan: loanResult.rows[0]
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Mark disbursement as failed
   */
  static async fail(disbursementId, reason) {
    const query = `
      UPDATE loan_disbursements 
      SET status = 'failed',
          failure_reason = $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [reason, disbursementId]);
    return result.rows[0];
  }
}

module.exports = Disbursement;
