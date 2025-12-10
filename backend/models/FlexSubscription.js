const pool = require('../config/database');

class FlexSubscription {
  /**
   * Create a new Flex+ subscription
   */
  static async create(subscriptionData) {
    const {
      user_id,
      subscription_type = 'flex_plus',
      duration_months = 1,
      amount_paid = 99.00,
      payment_method,
      transaction_id,
      auto_renewal = false
    } = subscriptionData;

    // Calculate end date based on duration
    const query = `
      INSERT INTO flex_subscriptions 
      (user_id, subscription_type, end_date, amount_paid, payment_method, transaction_id, auto_renewal, status)
      VALUES ($1, $2, CURRENT_TIMESTAMP + ($3 || ' months')::INTERVAL, $4, $5, $6, $7, 'active')
      RETURNING *
    `;

    const values = [
      user_id,
      subscription_type,
      duration_months,
      amount_paid,
      payment_method,
      transaction_id,
      auto_renewal
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Get active subscription for user
   */
  static async getActiveSubscription(userId) {
    const query = `
      SELECT * FROM flex_subscriptions
      WHERE user_id = $1 
      AND status = 'active' 
      AND end_date > CURRENT_TIMESTAMP
      ORDER BY end_date DESC
      LIMIT 1
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  /**
   * Check if user has active Flex+ subscription
   */
  static async hasActiveSubscription(userId) {
    const subscription = await this.getActiveSubscription(userId);
    return !!subscription;
  }

  /**
   * Get all subscriptions for user
   */
  static async getUserSubscriptions(userId) {
    const query = `
      SELECT 
        fs.*,
        CASE 
          WHEN fs.end_date > CURRENT_TIMESTAMP THEN 
            EXTRACT(DAY FROM (fs.end_date - CURRENT_TIMESTAMP))
          ELSE 0
        END as days_remaining
      FROM flex_subscriptions fs
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  /**
   * Cancel subscription
   */
  static async cancel(subscriptionId, userId) {
    const query = `
      UPDATE flex_subscriptions 
      SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [subscriptionId, userId]);
    return result.rows[0];
  }

  /**
   * Renew subscription
   */
  static async renew(userId, durationMonths = 1) {
    // Get current active subscription
    const currentSub = await this.getActiveSubscription(userId);
    
    let startDate = new Date();
    if (currentSub && currentSub.end_date > new Date()) {
      // Extend from current end date
      startDate = new Date(currentSub.end_date);
    }

    const query = `
      INSERT INTO flex_subscriptions 
      (user_id, subscription_type, start_date, end_date, amount_paid, status)
      VALUES ($1, 'flex_plus', $2, $2 + ($3 || ' months')::INTERVAL, $4, 'active')
      RETURNING *
    `;

    const amount = durationMonths === 1 ? 99 : durationMonths === 3 ? 249 : durationMonths === 12 ? 899 : 99;
    const values = [userId, startDate, durationMonths, amount];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Get subscription statistics
   */
  static async getStats() {
    const query = `
      SELECT 
        COUNT(*) FILTER (WHERE status = 'active' AND end_date > CURRENT_TIMESTAMP) as active_count,
        COUNT(*) FILTER (WHERE status = 'expired') as expired_count,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_count,
        COALESCE(SUM(amount_paid) FILTER (WHERE status = 'active'), 0) as total_revenue,
        COALESCE(AVG(amount_paid) FILTER (WHERE status = 'active'), 0) as avg_subscription_value
      FROM flex_subscriptions
    `;
    const result = await pool.query(query);
    return result.rows[0];
  }

  /**
   * Get pricing plans
   */
  static async getPricingPlans() {
    const query = `
      SELECT * FROM flex_pricing
      WHERE is_active = TRUE
      ORDER BY duration_months
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Expire old subscriptions (cron job)
   */
  static async expireOldSubscriptions() {
    const query = `
      UPDATE flex_subscriptions 
      SET status = 'expired', updated_at = CURRENT_TIMESTAMP
      WHERE status = 'active' 
      AND end_date <= CURRENT_TIMESTAMP
      RETURNING *
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Get subscription by ID
   */
  static async findById(id) {
    const query = 'SELECT * FROM flex_subscriptions WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Track Flex+ delay usage
   */
  static async trackDelayUsage(userId) {
    const query = `
      UPDATE users 
      SET total_flex_delays_used = total_flex_delays_used + 1
      WHERE id = $1
      RETURNING total_flex_delays_used
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }
}

module.exports = FlexSubscription;
