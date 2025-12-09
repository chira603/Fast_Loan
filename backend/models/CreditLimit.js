const pool = require('../config/database');

class CreditLimit {
  /**
   * Create or get credit limit for user
   */
  static async findByUserId(userId) {
    const query = 'SELECT * FROM credit_limits WHERE user_id = $1';
    const result = await pool.query(query, [userId]);
    
    if (result.rows.length === 0) {
      // Create default credit limit
      return await this.create(userId);
    }
    
    return result.rows[0];
  }

  /**
   * Create initial credit limit
   */
  static async create(userId, initialLimit = 500) {
    const query = `
      INSERT INTO credit_limits (user_id, total_limit, used_limit)
      VALUES ($1, $2, 0)
      RETURNING *
    `;
    const result = await pool.query(query, [userId, initialLimit]);
    return result.rows[0];
  }

  /**
   * Calculate credit limit based on payment history
   */
  static async calculateLimit(userId) {
    const query = `
      SELECT 
        COUNT(*) as total_loans,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_loans,
        COALESCE(AVG(CASE WHEN status = 'completed' THEN amount END), 0) as avg_loan_amount
      FROM loans
      WHERE user_id = $1
    `;
    
    const result = await pool.query(query, [userId]);
    const stats = result.rows[0];
    
    let limit = 500; // Base limit
    
    // Increase limit based on completed loans
    const completedLoans = parseInt(stats.completed_loans);
    if (completedLoans >= 5) limit = 2000;
    else if (completedLoans >= 3) limit = 1500;
    else if (completedLoans >= 1) limit = 1000;
    
    // Bonus for high-value loans paid
    const avgLoan = parseFloat(stats.avg_loan_amount);
    if (avgLoan > 50000) limit += 500;
    else if (avgLoan > 30000) limit += 300;
    
    return limit;
  }

  /**
   * Update credit limit
   */
  static async updateLimit(userId, newLimit) {
    const query = `
      UPDATE credit_limits 
      SET total_limit = $1, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [newLimit, userId]);
    return result.rows[0];
  }

  /**
   * Use credit (make a purchase)
   */
  static async useCredit(userId, amount, description, billPaymentId = null) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Get credit limit with lock
      const limitResult = await client.query(
        'SELECT * FROM credit_limits WHERE user_id = $1 FOR UPDATE',
        [userId]
      );
      const creditLimit = limitResult.rows[0];

      if (!creditLimit) {
        throw new Error('Credit limit not found');
      }

      const available = parseFloat(creditLimit.total_limit) - parseFloat(creditLimit.used_limit);
      
      if (available < parseFloat(amount)) {
        throw new Error('Insufficient credit limit');
      }

      // Calculate processing fee (0.02% per transaction)
      const processingFee = parseFloat(amount) * parseFloat(creditLimit.processing_fee_rate);

      // Update used limit
      const newUsed = parseFloat(creditLimit.used_limit) + parseFloat(amount) + processingFee;
      await client.query(
        'UPDATE credit_limits SET used_limit = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [newUsed, creditLimit.id]
      );

      // Create transaction record
      const transactionResult = await client.query(
        `INSERT INTO credit_transactions 
         (credit_limit_id, user_id, type, amount, processing_fee, description, bill_payment_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [creditLimit.id, userId, 'purchase', amount, processingFee, description, billPaymentId]
      );

      await client.query('COMMIT');
      return transactionResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Make payment to credit
   */
  static async makePayment(userId, amount) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Get credit limit
      const limitResult = await client.query(
        'SELECT * FROM credit_limits WHERE user_id = $1 FOR UPDATE',
        [userId]
      );
      const creditLimit = limitResult.rows[0];

      if (!creditLimit) {
        throw new Error('Credit limit not found');
      }

      // Update used limit (reduce it)
      const newUsed = Math.max(0, parseFloat(creditLimit.used_limit) - parseFloat(amount));
      await client.query(
        'UPDATE credit_limits SET used_limit = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [newUsed, creditLimit.id]
      );

      // Create payment transaction
      const transactionResult = await client.query(
        `INSERT INTO credit_transactions 
         (credit_limit_id, user_id, type, amount, processing_fee, description)
         VALUES ($1, $2, $3, $4, 0, $5)
         RETURNING *`,
        [creditLimit.id, userId, 'payment', amount, 'Credit payment']
      );

      await client.query('COMMIT');
      return transactionResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Apply daily interest
   */
  static async applyDailyInterest(userId) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const limitResult = await client.query(
        'SELECT * FROM credit_limits WHERE user_id = $1 FOR UPDATE',
        [userId]
      );
      const creditLimit = limitResult.rows[0];

      if (!creditLimit || parseFloat(creditLimit.used_limit) === 0) {
        await client.query('COMMIT');
        return null;
      }

      // Calculate interest (0.03% per day on used amount)
      const interest = parseFloat(creditLimit.used_limit) * parseFloat(creditLimit.daily_interest_rate);

      if (interest > 0) {
        // Add interest to used limit
        const newUsed = parseFloat(creditLimit.used_limit) + interest;
        await client.query(
          'UPDATE credit_limits SET used_limit = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [newUsed, creditLimit.id]
        );

        // Record interest transaction
        await client.query(
          `INSERT INTO credit_transactions 
           (credit_limit_id, user_id, type, amount, processing_fee, description)
           VALUES ($1, $2, $3, $4, 0, $5)`,
          [creditLimit.id, userId, 'interest', interest, 'Daily interest charge']
        );
      }

      await client.query('COMMIT');
      return { interest, newUsed: parseFloat(creditLimit.used_limit) + interest };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get credit transaction history
   */
  static async getTransactions(userId, limit = 50) {
    const query = `
      SELECT ct.*, bp.service_type, bp.service_provider
      FROM credit_transactions ct
      LEFT JOIN bill_payments bp ON ct.bill_payment_id = bp.id
      WHERE ct.user_id = $1
      ORDER BY ct.created_at DESC
      LIMIT $2
    `;
    const result = await pool.query(query, [userId, limit]);
    return result.rows;
  }

  /**
   * Get credit statistics
   */
  static async getStatistics(userId) {
    const query = `
      SELECT 
        COUNT(*) as total_transactions,
        COALESCE(SUM(CASE WHEN type = 'purchase' THEN amount ELSE 0 END), 0) as total_purchases,
        COALESCE(SUM(CASE WHEN type = 'payment' THEN amount ELSE 0 END), 0) as total_payments,
        COALESCE(SUM(CASE WHEN type = 'interest' THEN amount ELSE 0 END), 0) as total_interest,
        COALESCE(SUM(processing_fee), 0) as total_fees
      FROM credit_transactions
      WHERE user_id = $1
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }
}

module.exports = CreditLimit;
