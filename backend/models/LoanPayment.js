const { query } = require('../config/database');

class LoanPayment {
  /**
   * Create a new loan payment record
   * This is created BEFORE the UPI payment to track the transaction
   */
  static async create(paymentData) {
    const {
      loan_id,
      user_id,
      amount,
      payment_type, // 'emi', 'prepayment', 'closing'
      transaction_ref, // Unique reference for this transaction
      upi_vpa, // User's UPI ID (optional)
      status = 'pending', // pending, success, failed
      notes
    } = paymentData;

    const sql = `
      INSERT INTO loan_payments (
        loan_id, user_id, amount, payment_type, transaction_ref, 
        upi_vpa, status, notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      loan_id,
      user_id,
      amount,
      payment_type,
      transaction_ref,
      upi_vpa,
      status,
      notes
    ];

    const result = await query(sql, values);
    return result.rows[0];
  }

  /**
   * Find payment by transaction reference
   */
  static async findByTransactionRef(transactionRef) {
    const sql = `
      SELECT lp.*, l.amount as loan_amount, l.emi, u.full_name, u.email, u.phone
      FROM loan_payments lp
      JOIN loans l ON lp.loan_id = l.id
      JOIN users u ON lp.user_id = u.id
      WHERE lp.transaction_ref = $1
    `;
    const result = await query(sql, [transactionRef]);
    return result.rows[0];
  }

  /**
   * Find payment by ID
   */
  static async findById(id) {
    const sql = `
      SELECT lp.*, l.amount as loan_amount, l.emi, u.full_name
      FROM loan_payments lp
      JOIN loans l ON lp.loan_id = l.id
      JOIN users u ON lp.user_id = u.id
      WHERE lp.id = $1
    `;
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  /**
   * Get all payments for a loan
   */
  static async findByLoanId(loanId) {
    const sql = `
      SELECT *
      FROM loan_payments
      WHERE loan_id = $1
      ORDER BY created_at DESC
    `;
    const result = await query(sql, [loanId]);
    return result.rows;
  }

  /**
   * Get all payments for a user
   */
  static async findByUserId(userId) {
    const sql = `
      SELECT lp.*, l.amount as loan_amount, l.emi
      FROM loan_payments lp
      JOIN loans l ON lp.loan_id = l.id
      WHERE lp.user_id = $1
      ORDER BY lp.created_at DESC
    `;
    const result = await query(sql, [userId]);
    return result.rows;
  }

  /**
   * Update payment status after UPI callback/verification
   */
  static async updateStatus(transactionRef, statusData) {
    const {
      status, // 'success', 'failed'
      upi_txn_id, // Transaction ID from UPI app
      response_code, // Response code from UPI
      payment_date = new Date()
    } = statusData;

    const sql = `
      UPDATE loan_payments
      SET 
        status = $1,
        upi_txn_id = $2,
        response_code = $3,
        payment_date = $4,
        updated_at = CURRENT_TIMESTAMP
      WHERE transaction_ref = $5
      RETURNING *
    `;

    const values = [status, upi_txn_id, response_code, payment_date, transactionRef];
    const result = await query(sql, values);
    
    // If payment is successful, update loan payment tracking
    if (result.rows[0] && status === 'success') {
      await this.updateLoanAfterPayment(result.rows[0]);
    }
    
    return result.rows[0];
  }

  /**
   * Update loan status and paid amount after successful payment
   */
  static async updateLoanAfterPayment(payment) {
    const { loan_id, amount } = payment;

    // Get current loan details
    const loanSql = 'SELECT * FROM loans WHERE id = $1';
    const loanResult = await query(loanSql, [loan_id]);
    const loan = loanResult.rows[0];

    if (!loan) return null;

    // Calculate new paid amount
    const paidAmount = parseFloat(loan.paid_amount || 0) + parseFloat(amount);
    const totalAmount = parseFloat(loan.amount);
    const remainingAmount = totalAmount - paidAmount;

    // Determine new status based on payment progress
    let newStatus = loan.status;
    let disbursementDate = loan.disbursement_date;
    
    if (remainingAmount <= 0) {
      // Loan fully paid
      newStatus = 'repaid';
    } else if (loan.status === 'approved' && paidAmount > 0) {
      // First payment activates the loan
      newStatus = 'disbursed';
      disbursementDate = disbursementDate || new Date(); // Set disbursement date on first payment
    }
    // If already 'disbursed', keep it that way until fully repaid

    // Update loan with new paid amount, status, and disbursement date
    const updateSql = `
      UPDATE loans
      SET 
        paid_amount = $1,
        status = $2,
        disbursement_date = $3,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `;

    const result = await query(updateSql, [paidAmount, newStatus, disbursementDate, loan_id]);
    return result.rows[0];
  }

  /**
   * Get payment statistics for a loan
   */
  static async getLoanPaymentStats(loanId) {
    const sql = `
      SELECT 
        COUNT(*) as total_payments,
        COUNT(CASE WHEN status = 'success' THEN 1 END) as successful_payments,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_payments,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_payments,
        COALESCE(SUM(CASE WHEN status = 'success' THEN amount ELSE 0 END), 0) as total_paid,
        MAX(CASE WHEN status = 'success' THEN payment_date END) as last_payment_date
      FROM loan_payments
      WHERE loan_id = $1
    `;
    const result = await query(sql, [loanId]);
    return result.rows[0];
  }

  /**
   * Get upcoming EMI details for a loan
   */
  static async getNextEMI(loanId) {
    const sql = `
      SELECT 
        l.*,
        COALESCE(l.paid_amount, 0) as paid_amount,
        (l.amount - COALESCE(l.paid_amount, 0)) as remaining_amount,
        COUNT(lp.id) FILTER (WHERE lp.status = 'success') as payments_made
      FROM loans l
      LEFT JOIN loan_payments lp ON l.id = lp.loan_id
      WHERE l.id = $1
      GROUP BY l.id
    `;
    const result = await query(sql, [loanId]);
    const loan = result.rows[0];

    if (!loan) return null;

    const remainingAmount = parseFloat(loan.remaining_amount);
    const emi = parseFloat(loan.emi);
    const paymentsMade = parseInt(loan.payments_made);
    const tenureMonths = parseInt(loan.tenure_months);

    return {
      loan_id: loanId,
      emi_amount: Math.min(emi, remainingAmount),
      remaining_emis: Math.max(0, tenureMonths - paymentsMade),
      total_remaining: remainingAmount,
      next_due_date: this.calculateNextDueDate(loan.disbursement_date || loan.application_date, paymentsMade)
    };
  }

  /**
   * Calculate next EMI due date
   */
  static calculateNextDueDate(startDate, paymentsMade) {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + paymentsMade + 1);
    return date;
  }

  /**
   * Generate unique transaction reference
   */
  static generateTransactionRef() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10).toUpperCase();
    return `FLEMI${timestamp}${random}`;
  }
}

module.exports = LoanPayment;
