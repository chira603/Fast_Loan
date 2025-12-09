const { query } = require('../config/database');

class Biller {
  // Get all billers by category
  static async findByCategory(category) {
    const sql = `
      SELECT * FROM billers
      WHERE category = $1 AND is_active = true
      ORDER BY name ASC
    `;
    const result = await query(sql, [category]);
    return result.rows;
  }

  // Get all active billers
  static async findAll() {
    const sql = `
      SELECT * FROM billers
      WHERE is_active = true
      ORDER BY category, name ASC
    `;
    const result = await query(sql);
    return result.rows;
  }

  // Find biller by ID
  static async findById(id) {
    const sql = 'SELECT * FROM billers WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // Find biller by biller_id
  static async findByBillerId(billerId) {
    const sql = 'SELECT * FROM billers WHERE biller_id = $1';
    const result = await query(sql, [billerId]);
    return result.rows[0];
  }

  // Create new biller
  static async create(billerData) {
    const { biller_id, name, category, logo_url, fetch_requirement, payment_modes, input_params } = billerData;
    
    const sql = `
      INSERT INTO billers (biller_id, name, category, logo_url, fetch_requirement, payment_modes, input_params)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const values = [
      biller_id,
      name,
      category,
      logo_url,
      fetch_requirement,
      JSON.stringify(payment_modes || []),
      JSON.stringify(input_params || [])
    ];
    
    const result = await query(sql, values);
    return result.rows[0];
  }
}

module.exports = Biller;
