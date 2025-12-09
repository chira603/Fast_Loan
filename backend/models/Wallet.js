const pool = require('../config/database');

class Wallet {
  /**
   * Create a new wallet for user
   */
  static async create(userId, upiId = null) {
    const query = `
      INSERT INTO wallets (user_id, upi_id, balance)
      VALUES ($1, $2, 0)
      RETURNING *
    `;
    const result = await pool.query(query, [userId, upiId]);
    return result.rows[0];
  }

  /**
   * Get wallet by user ID
   */
  static async findByUserId(userId) {
    const query = 'SELECT * FROM wallets WHERE user_id = $1';
    const result = await pool.query(query, [userId]);
    
    // Create wallet if doesn't exist
    if (result.rows.length === 0) {
      return await this.create(userId);
    }
    
    return result.rows[0];
  }

  /**
   * Get wallet balance
   */
  static async getBalance(userId) {
    const wallet = await this.findByUserId(userId);
    return wallet.balance;
  }

  /**
   * Add money to wallet (credit)
   */
  static async addMoney(userId, amount, description = 'Added to wallet', referenceId = null) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Get wallet
      const walletResult = await client.query('SELECT * FROM wallets WHERE user_id = $1 FOR UPDATE', [userId]);
      const wallet = walletResult.rows[0];
      
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      // Update balance
      const newBalance = parseFloat(wallet.balance) + parseFloat(amount);
      await client.query(
        'UPDATE wallets SET balance = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [newBalance, wallet.id]
      );

      // Convenience fee (₹0.50 per transaction)
      const convenienceFee = 0.50;

      // Create transaction record
      const transactionResult = await client.query(
        `INSERT INTO wallet_transactions 
         (wallet_id, type, amount, balance_after, description, reference_id, convenience_fee, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [wallet.id, 'credit', amount, newBalance, description, referenceId, convenienceFee, 'completed']
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
   * Deduct money from wallet (debit)
   */
  static async deductMoney(userId, amount, description = 'Payment from wallet', referenceId = null) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Get wallet with lock
      const walletResult = await client.query('SELECT * FROM wallets WHERE user_id = $1 FOR UPDATE', [userId]);
      const wallet = walletResult.rows[0];
      
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      // Check sufficient balance
      if (parseFloat(wallet.balance) < parseFloat(amount)) {
        throw new Error('Insufficient wallet balance');
      }

      // Update balance
      const newBalance = parseFloat(wallet.balance) - parseFloat(amount);
      await client.query(
        'UPDATE wallets SET balance = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [newBalance, wallet.id]
      );

      // Convenience fee
      const convenienceFee = 0.50;

      // Create transaction record
      const transactionResult = await client.query(
        `INSERT INTO wallet_transactions 
         (wallet_id, type, amount, balance_after, description, reference_id, convenience_fee, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [wallet.id, 'debit', amount, newBalance, description, referenceId, convenienceFee, 'completed']
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
   * Send money to another user
   */
  static async sendMoney(fromUserId, toUserId, amount, description = 'Money transfer') {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Get sender wallet
      const fromWalletResult = await client.query('SELECT * FROM wallets WHERE user_id = $1 FOR UPDATE', [fromUserId]);
      const fromWallet = fromWalletResult.rows[0];

      if (!fromWallet || parseFloat(fromWallet.balance) < parseFloat(amount)) {
        throw new Error('Insufficient balance');
      }

      // Get receiver wallet
      const toWalletResult = await client.query('SELECT * FROM wallets WHERE user_id = $1 FOR UPDATE', [toUserId]);
      let toWallet = toWalletResult.rows[0];

      if (!toWallet) {
        // Create wallet for receiver if doesn't exist
        const createResult = await client.query(
          'INSERT INTO wallets (user_id, balance) VALUES ($1, 0) RETURNING *',
          [toUserId]
        );
        toWallet = createResult.rows[0];
      }

      // Update sender balance
      const newFromBalance = parseFloat(fromWallet.balance) - parseFloat(amount);
      await client.query(
        'UPDATE wallets SET balance = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [newFromBalance, fromWallet.id]
      );

      // Update receiver balance
      const newToBalance = parseFloat(toWallet.balance) + parseFloat(amount);
      await client.query(
        'UPDATE wallets SET balance = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [newToBalance, toWallet.id]
      );

      const convenienceFee = 0.50;
      const referenceId = `TXN${Date.now()}`;

      // Create send transaction
      await client.query(
        `INSERT INTO wallet_transactions 
         (wallet_id, type, amount, balance_after, description, reference_id, to_user_id, convenience_fee, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [fromWallet.id, 'send', amount, newFromBalance, description, referenceId, toUserId, convenienceFee, 'completed']
      );

      // Create receive transaction
      await client.query(
        `INSERT INTO wallet_transactions 
         (wallet_id, type, amount, balance_after, description, reference_id, from_user_id, convenience_fee, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [toWallet.id, 'receive', amount, newToBalance, description, referenceId, fromUserId, 0, 'completed']
      );

      await client.query('COMMIT');
      return { referenceId, fromBalance: newFromBalance, toBalance: newToBalance };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get transaction history
   */
  static async getTransactions(userId, limit = 50) {
    const query = `
      SELECT wt.*, w.user_id,
             fu.full_name as from_user_name,
             tu.full_name as to_user_name
      FROM wallet_transactions wt
      JOIN wallets w ON wt.wallet_id = w.id
      LEFT JOIN users fu ON wt.from_user_id = fu.id
      LEFT JOIN users tu ON wt.to_user_id = tu.id
      WHERE w.user_id = $1
      ORDER BY wt.created_at DESC
      LIMIT $2
    `;
    const result = await pool.query(query, [userId, limit]);
    return result.rows;
  }

  /**
   * Update UPI ID
   */
  static async updateUpiId(userId, upiId) {
    const query = `
      UPDATE wallets 
      SET upi_id = $1, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [upiId, userId]);
    return result.rows[0];
  }
}

module.exports = Wallet;
