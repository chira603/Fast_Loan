const pool = require('../config/database');

class Budget {
  /**
   * Create or update budget for a month
   */
  static async createOrUpdate(budgetData) {
    const {
      user_id,
      monthly_income,
      emi_allocation,
      bills_allocation,
      savings_allocation,
      shopping_allocation,
      other_allocation,
      month,
      year
    } = budgetData;

    const query = `
      INSERT INTO budgets 
      (user_id, monthly_income, emi_allocation, bills_allocation, savings_allocation, 
       shopping_allocation, other_allocation, month, year)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (user_id, month, year) 
      DO UPDATE SET 
        monthly_income = EXCLUDED.monthly_income,
        emi_allocation = EXCLUDED.emi_allocation,
        bills_allocation = EXCLUDED.bills_allocation,
        savings_allocation = EXCLUDED.savings_allocation,
        shopping_allocation = EXCLUDED.shopping_allocation,
        other_allocation = EXCLUDED.other_allocation,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const values = [
      user_id,
      monthly_income,
      emi_allocation || 0,
      bills_allocation || 0,
      savings_allocation || 0,
      shopping_allocation || 0,
      other_allocation || 0,
      month,
      year
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Get current month budget
   */
  static async getCurrentBudget(userId) {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const query = `
      SELECT * FROM budgets
      WHERE user_id = $1 AND month = $2 AND year = $3
    `;
    const result = await pool.query(query, [userId, month, year]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  }

  /**
   * Update spending in a category
   */
  static async updateSpending(userId, category, amount) {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const categoryField = `${category}_spent`;
    
    const query = `
      UPDATE budgets 
      SET ${categoryField} = ${categoryField} + $1, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $2 AND month = $3 AND year = $4
      RETURNING *
    `;
    
    const result = await pool.query(query, [amount, userId, month, year]);
    return result.rows[0];
  }

  /**
   * Calculate optimal allocation using AI algorithm
   */
  static calculateOptimalAllocation(monthlyIncome, currentLoans = 0, averageBills = 0) {
    const income = parseFloat(monthlyIncome);
    
    // Base allocations (percentages)
    let emi = 0;
    let bills = 15; // Default 15%
    let savings = 20; // Always start with 20% to savings
    let shopping = 30; // 30% to shopping/discretionary
    let other = 15; // 15% to other expenses
    
    // Calculate EMI allocation based on current loans
    if (currentLoans > 0) {
      const suggestedEMI = currentLoans;
      emi = Math.min((suggestedEMI / income) * 100, 40); // Max 40% to EMI
    } else {
      emi = 0;
    }
    
    // Calculate bills allocation based on average bills
    if (averageBills > 0) {
      bills = Math.min((averageBills / income) * 100, 25); // Max 25% to bills
    }
    
    // Adjust other categories if EMI + Bills exceed 50%
    const essential = emi + bills;
    if (essential > 50) {
      const remaining = 100 - essential;
      savings = remaining * 0.30; // 30% of remaining
      shopping = remaining * 0.50; // 50% of remaining
      other = remaining * 0.20; // 20% of remaining
    }
    
    // Round all values
    emi = Math.round(emi);
    bills = Math.round(bills);
    savings = Math.round(savings);
    shopping = Math.round(shopping);
    other = Math.round(other);
    
    // Ensure total is exactly 100% by adjusting shopping (most flexible category)
    const total = emi + bills + savings + shopping + other;
    if (total !== 100) {
      shopping += (100 - total);
    }
    
    console.log('AI Allocation calculated:', {
      emi_allocation: emi,
      bills_allocation: bills,
      savings_allocation: savings,
      shopping_allocation: shopping,
      other_allocation: other,
      total: emi + bills + savings + shopping + other
    });
    
    return {
      emi_allocation: emi,
      bills_allocation: bills,
      savings_allocation: savings,
      shopping_allocation: shopping,
      other_allocation: other
    };
  }

  /**
   * Get budget analysis
   */
  static async getBudgetAnalysis(userId) {
    const budget = await this.getCurrentBudget(userId);
    
    if (!budget) {
      return null;
    }

    const income = parseFloat(budget.monthly_income);
    
    const analysis = {
      emi: {
        allocated: (income * budget.emi_allocation) / 100,
        spent: parseFloat(budget.emi_spent),
        percentage: budget.emi_allocation,
        remaining: ((income * budget.emi_allocation) / 100) - parseFloat(budget.emi_spent)
      },
      bills: {
        allocated: (income * budget.bills_allocation) / 100,
        spent: parseFloat(budget.bills_spent),
        percentage: budget.bills_allocation,
        remaining: ((income * budget.bills_allocation) / 100) - parseFloat(budget.bills_spent)
      },
      savings: {
        allocated: (income * budget.savings_allocation) / 100,
        spent: parseFloat(budget.savings_spent),
        percentage: budget.savings_allocation,
        remaining: ((income * budget.savings_allocation) / 100) - parseFloat(budget.savings_spent)
      },
      shopping: {
        allocated: (income * budget.shopping_allocation) / 100,
        spent: parseFloat(budget.shopping_spent),
        percentage: budget.shopping_allocation,
        remaining: ((income * budget.shopping_allocation) / 100) - parseFloat(budget.shopping_spent)
      },
      other: {
        allocated: (income * budget.other_allocation) / 100,
        spent: parseFloat(budget.other_spent),
        percentage: budget.other_allocation,
        remaining: ((income * budget.other_allocation) / 100) - parseFloat(budget.other_spent)
      }
    };

    // Calculate overall status
    const totalAllocated = income;
    const totalSpent = Object.values(analysis).reduce((sum, cat) => sum + cat.spent, 0);
    
    analysis.overall = {
      income,
      totalAllocated,
      totalSpent,
      remaining: totalAllocated - totalSpent,
      spendingRate: (totalSpent / totalAllocated) * 100
    };

    return analysis;
  }

  /**
   * Get budget history
   */
  static async getHistory(userId, months = 6) {
    const query = `
      SELECT * FROM budgets
      WHERE user_id = $1
      ORDER BY year DESC, month DESC
      LIMIT $2
    `;
    const result = await pool.query(query, [userId, months]);
    return result.rows;
  }

  /**
   * Get spending suggestions
   */
  static getSuggestions(analysis) {
    const suggestions = [];

    if (!analysis) return suggestions;

    // Check overspending
    Object.entries(analysis).forEach(([category, data]) => {
      if (category === 'overall') return;
      
      if (data.spent > data.allocated) {
        suggestions.push({
          type: 'warning',
          category,
          message: `You've overspent in ${category} by ₹${Math.abs(data.remaining).toFixed(2)}`
        });
      } else if (data.remaining > data.allocated * 0.5) {
        suggestions.push({
          type: 'success',
          category,
          message: `Great! You've saved ₹${data.remaining.toFixed(2)} in ${category}`
        });
      }
    });

    // Overall suggestions
    if (analysis.overall.spendingRate > 90) {
      suggestions.push({
        type: 'alert',
        category: 'overall',
        message: 'You\'ve used 90% of your budget. Consider reducing discretionary spending.'
      });
    } else if (analysis.overall.spendingRate < 70) {
      suggestions.push({
        type: 'info',
        category: 'overall',
        message: 'You\'re doing well! Consider moving extra savings to investments.'
      });
    }

    return suggestions;
  }
}

module.exports = Budget;
