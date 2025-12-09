const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Budget = require('../models/Budget');
const Loan = require('../models/Loan');
const BillPayment = require('../models/BillPayment');

/**
 * @route   GET /api/v1/budget/current
 * @desc    Get current month's budget
 * @access  Private
 */
router.get('/current', protect, async (req, res) => {
  try {
    const budget = await Budget.getCurrentBudget(req.user.id);
    
    if (!budget) {
      return res.json({ message: 'No budget set for current month', budget: null });
    }

    const analysis = await Budget.getBudgetAnalysis(req.user.id);
    const suggestions = Budget.getSuggestions(analysis);

    res.json({ budget, analysis, suggestions });
  } catch (error) {
    console.error('Error fetching budget:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/v1/budget
 * @desc    Create or update budget
 * @access  Private
 */
router.post('/', protect, async (req, res) => {
  try {
    const {
      monthly_income,
      emi_allocation,
      bills_allocation,
      savings_allocation,
      shopping_allocation,
      other_allocation
    } = req.body;

    if (!monthly_income || monthly_income <= 0) {
      return res.status(400).json({ message: 'Valid monthly income required' });
    }

    // Validate total allocation is 100%
    const total = parseFloat(emi_allocation || 0) + 
                  parseFloat(bills_allocation || 0) +
                  parseFloat(savings_allocation || 0) +
                  parseFloat(shopping_allocation || 0) +
                  parseFloat(other_allocation || 0);

    if (Math.abs(total - 100) > 0.01) {
      return res.status(400).json({ message: 'Total allocation must equal 100%' });
    }

    const now = new Date();
    const budget = await Budget.createOrUpdate({
      user_id: req.user.id,
      monthly_income,
      emi_allocation: emi_allocation || 0,
      bills_allocation: bills_allocation || 0,
      savings_allocation: savings_allocation || 0,
      shopping_allocation: shopping_allocation || 0,
      other_allocation: other_allocation || 0,
      month: now.getMonth() + 1,
      year: now.getFullYear()
    });

    res.json({
      message: 'Budget saved successfully',
      budget
    });
  } catch (error) {
    console.error('Error saving budget:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   POST /api/v1/budget/auto-allocate
 * @desc    Get AI-suggested budget allocation
 * @access  Private
 */
router.post('/auto-allocate', protect, async (req, res) => {
  try {
    const { monthly_income } = req.body;

    if (!monthly_income || monthly_income <= 0) {
      return res.status(400).json({ message: 'Valid monthly income required' });
    }

    // Get user's current loans and average bills
    let currentLoans = 0;
    let averageBills = 0;

    try {
      const loanStats = await Loan.getStatistics(req.user.id);
      // Use total_amount for active loans estimation
      currentLoans = parseFloat(loanStats.total_amount || 0);
    } catch (error) {
      console.error('Error getting loan stats:', error);
      // Continue with 0 if error
    }

    try {
      const billStats = await BillPayment.getStatistics(req.user.id);
      const totalBills = parseInt(billStats.total_bills || 0);
      const totalAmount = parseFloat(billStats.total_amount_paid || 0);
      averageBills = totalBills > 0 ? totalAmount / totalBills : 0;
    } catch (error) {
      console.error('Error getting bill stats:', error);
      // Continue with 0 if error
    }

    const allocation = Budget.calculateOptimalAllocation(
      monthly_income,
      currentLoans,
      averageBills
    );

    res.json({
      message: 'AI-generated budget allocation',
      allocation,
      insights: {
        currentLoans,
        averageBills,
        recommendations: [
          allocation.emi_allocation > 40 ? 'EMI burden is high. Consider consolidating loans.' : null,
          allocation.savings_allocation < 15 ? 'Try to increase savings to at least 15%.' : null,
          allocation.bills_allocation > 25 ? 'Bills are consuming too much. Look for cost-saving options.' : null
        ].filter(Boolean)
      }
    });
  } catch (error) {
    console.error('Error calculating allocation:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   PUT /api/v1/budget/spending/:category
 * @desc    Update spending in a category
 * @access  Private
 */
router.put('/spending/:category', protect, async (req, res) => {
  try {
    const { category } = req.params;
    const { amount } = req.body;

    const validCategories = ['emi', 'bills', 'savings', 'shopping', 'other'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const budget = await Budget.updateSpending(req.user.id, category, parseFloat(amount));
    
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found for current month' });
    }

    res.json({
      message: 'Spending updated',
      budget
    });
  } catch (error) {
    console.error('Error updating spending:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/v1/budget/history
 * @desc    Get budget history
 * @access  Private
 */
router.get('/history', protect, async (req, res) => {
  try {
    const months = parseInt(req.query.months) || 6;
    const history = await Budget.getHistory(req.user.id, months);
    res.json(history);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/v1/budget/analysis
 * @desc    Get detailed budget analysis
 * @access  Private
 */
router.get('/analysis', protect, async (req, res) => {
  try {
    const analysis = await Budget.getBudgetAnalysis(req.user.id);
    
    if (!analysis) {
      return res.json({ message: 'No budget data available', analysis: null });
    }

    const suggestions = Budget.getSuggestions(analysis);

    res.json({ analysis, suggestions });
  } catch (error) {
    console.error('Error fetching analysis:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
