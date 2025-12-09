const pool = require('../config/database');

class Avatar {
  /**
   * Get or create user avatar
   */
  static async findByUserId(userId) {
    const query = `
      SELECT ua.*, a.name as avatar_name, a.base_image_url
      FROM user_avatars ua
      LEFT JOIN avatars a ON ua.avatar_id = a.id
      WHERE ua.user_id = $1
    `;
    const result = await pool.query(query, [userId]);
    
    if (result.rows.length === 0) {
      // Create default avatar for user
      return await this.createDefaultAvatar(userId);
    }
    
    return result.rows[0];
  }

  /**
   * Create default avatar for new user
   */
  static async createDefaultAvatar(userId) {
    // Get first free avatar
    const avatarResult = await pool.query('SELECT * FROM avatars WHERE cost = 0 LIMIT 1');
    const defaultAvatar = avatarResult.rows[0];

    const query = `
      INSERT INTO user_avatars (user_id, avatar_id, level, experience_points, mood)
      VALUES ($1, $2, 1, 0, 'happy')
      RETURNING *
    `;
    const result = await pool.query(query, [userId, defaultAvatar.id]);
    return result.rows[0];
  }

  /**
   * Update avatar mood
   */
  static async updateMood(userId, mood) {
    const query = `
      UPDATE user_avatars 
      SET mood = $1, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [mood, userId]);
    return result.rows[0];
  }

  /**
   * Add experience points
   */
  static async addExperience(userId, points, reason = '') {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Get current avatar
      const avatarResult = await client.query('SELECT * FROM user_avatars WHERE user_id = $1 FOR UPDATE', [userId]);
      let avatar = avatarResult.rows[0];

      if (!avatar) {
        avatar = await this.createDefaultAvatar(userId);
      }

      const newXP = parseInt(avatar.experience_points) + parseInt(points);
      const currentLevel = parseInt(avatar.level);
      
      // Calculate new level (100 XP per level)
      const newLevel = Math.floor(newXP / 100) + 1;
      const leveledUp = newLevel > currentLevel;

      // Update avatar
      await client.query(
        `UPDATE user_avatars 
         SET experience_points = $1, level = $2, mood = $3, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $4`,
        [newXP, newLevel, leveledUp ? 'celebrating' : avatar.mood, userId]
      );

      await client.query('COMMIT');
      
      return { 
        newXP, 
        newLevel, 
        leveledUp,
        xpGained: points
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Purchase avatar accessory
   */
  static async purchaseAccessory(userId, accessoryId) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Get accessory details
      const accessoryResult = await client.query('SELECT * FROM avatar_accessories WHERE id = $1', [accessoryId]);
      const accessory = accessoryResult.rows[0];

      if (!accessory) {
        throw new Error('Accessory not found');
      }

      // Check wallet balance
      const Wallet = require('./Wallet');
      const wallet = await Wallet.findByUserId(userId);
      
      if (parseFloat(wallet.balance) < parseFloat(accessory.cost)) {
        throw new Error('Insufficient balance');
      }

      // Get user avatar
      const avatarResult = await client.query('SELECT * FROM user_avatars WHERE user_id = $1 FOR UPDATE', [userId]);
      const avatar = avatarResult.rows[0];

      // Check if already owned
      const currentAccessories = avatar.accessories || [];
      if (currentAccessories.includes(accessoryId)) {
        throw new Error('Already owned');
      }

      // Deduct from wallet
      await Wallet.deductMoney(userId, accessory.cost, `Purchased ${accessory.name}`, `ACC${accessoryId}`);

      // Add accessory to user avatar
      const updatedAccessories = [...currentAccessories, accessoryId];
      await client.query(
        `UPDATE user_avatars 
         SET accessories = $1, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $2`,
        [JSON.stringify(updatedAccessories), userId]
      );

      await client.query('COMMIT');
      return { success: true, accessory };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Change avatar character
   */
  static async changeAvatar(userId, avatarId) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Get avatar details
      const avatarResult = await client.query('SELECT * FROM avatars WHERE id = $1', [avatarId]);
      const newAvatar = avatarResult.rows[0];

      if (!newAvatar) {
        throw new Error('Avatar not found');
      }

      // Get user avatar
      const userAvatarResult = await client.query('SELECT * FROM user_avatars WHERE user_id = $1', [userId]);
      const userAvatar = userAvatarResult.rows[0];

      // Check level requirement
      if (userAvatar.level < newAvatar.unlock_level) {
        throw new Error(`Requires level ${newAvatar.unlock_level}`);
      }

      // Check cost
      if (newAvatar.cost > 0) {
        const Wallet = require('./Wallet');
        const wallet = await Wallet.findByUserId(userId);
        
        if (parseFloat(wallet.balance) < parseFloat(newAvatar.cost)) {
          throw new Error('Insufficient balance');
        }

        await Wallet.deductMoney(userId, newAvatar.cost, `Purchased avatar ${newAvatar.name}`, `AVT${avatarId}`);
      }

      // Update avatar
      await client.query(
        `UPDATE user_avatars 
         SET avatar_id = $1, mood = 'excited', updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $2`,
        [avatarId, userId]
      );

      await client.query('COMMIT');
      return { success: true, avatar: newAvatar };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get all available avatars
   */
  static async getAllAvatars() {
    const query = 'SELECT * FROM avatars ORDER BY unlock_level ASC, cost ASC';
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Get all accessories
   */
  static async getAllAccessories(category = null) {
    let query = 'SELECT * FROM avatar_accessories';
    const values = [];
    
    if (category) {
      query += ' WHERE category = $1';
      values.push(category);
    }
    
    query += ' ORDER BY category, cost ASC';
    
    const result = await pool.query(query, values);
    return result.rows;
  }

  /**
   * Award XP for actions
   */
  static getXPRewards() {
    return {
      loan_applied: 50,
      loan_approved: 100,
      payment_on_time: 75,
      payment_early: 100,
      loan_completed: 200,
      bill_paid: 25,
      wallet_transaction: 10,
      profile_updated: 20,
      referral: 150
    };
  }
}

module.exports = Avatar;
