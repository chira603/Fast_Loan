const { query } = require('../config/database');

class Loan {
  // Create a new loan application
  static async create(loanData) {
    const {
      user_id,
      amount,
      tenure_months,
      interest_rate,
      emi,
      purpose,
      employment_status,
      monthly_income,
      repayment_schedule
    } = loanData;

    const sql = `
      INSERT INTO loans (
        user_id, amount, tenure_months, interest_rate, emi, 
        purpose, employment_status, monthly_income, repayment_schedule
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      user_id,
      amount,
      tenure_months,
      interest_rate,
      emi,
      purpose,
      employment_status,
      monthly_income,
      JSON.stringify(repayment_schedule)
    ];

    const result = await query(sql, values);
    return result.rows[0];
  }

  // Find loan by ID
  static async findById(id) {
    const sql = `
      SELECT l.*, u.full_name, u.email, u.phone
      FROM loans l
      JOIN users u ON l.user_id = u.id
      WHERE l.id = $1
    `;
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // Get all loans for a user
  static async findByUserId(userId, filters = {}) {
    let sql = `
      SELECT *
      FROM loans
      WHERE user_id = $1
    `;
    const values = [userId];
    let paramCount = 2;

    if (filters.status) {
      sql += ` AND status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    sql += ' ORDER BY application_date DESC';

    if (filters.limit) {
      sql += ` LIMIT $${paramCount}`;
      values.push(filters.limit);
      paramCount++;
    }

    const result = await query(sql, values);
    return result.rows;
  }

  // Get all loans (admin)
  static async findAll(filters = {}) {
    let sql = `
      SELECT l.*, u.full_name, u.email, u.phone
      FROM loans l
      JOIN users u ON l.user_id = u.id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (filters.status) {
      sql += ` AND l.status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    if (filters.user_id) {
      sql += ` AND l.user_id = $${paramCount}`;
      values.push(filters.user_id);
      paramCount++;
    }

    sql += ' ORDER BY l.application_date DESC';

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

  // Update loan status
  static async updateStatus(id, status, notes = null) {
    let sql = `
      UPDATE loans
      SET status = $1, notes = $2
    `;
    const values = [status, notes];
    let paramCount = 3;

    if (status === 'approved' || status === 'disbursed') {
      sql += `, approval_date = CURRENT_TIMESTAMP`;
    }

    sql += ` WHERE id = $${paramCount} RETURNING *`;
    values.push(id);

    const result = await query(sql, values);
    return result.rows[0];
  }

  // Update loan
  static async update(id, updates) {
    const allowedUpdates = ['amount', 'tenure_months', 'interest_rate', 'emi', 'status', 'notes', 'repayment_schedule'];
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        if (key === 'repayment_schedule') {
          updateFields.push(`${key} = $${paramCount}`);
          values.push(JSON.stringify(updates[key]));
        } else {
          updateFields.push(`${key} = $${paramCount}`);
          values.push(updates[key]);
        }
        paramCount++;
      }
    });

    if (updateFields.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(id);
    const sql = `
      UPDATE loans
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(sql, values);
    return result.rows[0];
  }

  // Delete loan
  static async delete(id) {
    const sql = 'DELETE FROM loans WHERE id = $1 RETURNING id';
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // Get loan statistics
  static async getStatistics(userId = null) {
    let sql = `
      SELECT 
        COUNT(*) as total_loans,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_loans,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_loans,
        COUNT(CASE WHEN status = 'disbursed' THEN 1 END) as disbursed_loans,
        COUNT(CASE WHEN status = 'repaid' THEN 1 END) as repaid_loans,
        COALESCE(SUM(amount), 0) as total_amount,
        COALESCE(AVG(amount), 0) as average_amount
      FROM loans
    `;

    if (userId) {
      sql += ' WHERE user_id = $1';
      const result = await query(sql, [userId]);
      return result.rows[0];
    } else {
      const result = await query(sql);
      return result.rows[0];
    }
  }

  // Get active loans for a user
  static async getActiveLoans(userId) {
    const sql = `
      SELECT *
      FROM loans
      WHERE user_id = $1 AND status IN ('approved', 'disbursed')
      ORDER BY application_date DESC
    `;
    const result = await query(sql, [userId]);
    return result.rows;
  }

  // Update repayment schedule
  static async updateRepaymentSchedule(loanId, schedule) {
    const sql = `
      UPDATE loans
      SET repayment_schedule = $1
      WHERE id = $2
      RETURNING *
    `;
    const result = await query(sql, [JSON.stringify(schedule), loanId]);
    return result.rows[0];
  }
}

module.exports = Loan;
