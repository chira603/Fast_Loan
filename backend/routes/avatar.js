const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Avatar = require('../models/Avatar');

/**
 * @route   GET /api/v1/avatar
 * @desc    Get user's avatar
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
  try {
    const avatar = await Avatar.findByUserId(req.user.id);
    res.json(avatar);
  } catch (error) {
    console.error('Error fetching avatar:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   PUT /api/v1/avatar/mood
 * @desc    Update avatar mood
 * @access  Private
 */
router.put('/mood', protect, async (req, res) => {
  try {
    const { mood } = req.body;

    const validMoods = ['happy', 'sad', 'excited', 'worried', 'celebrating'];
    if (!mood || !validMoods.includes(mood)) {
      return res.status(400).json({ message: 'Invalid mood' });
    }

    const avatar = await Avatar.updateMood(req.user.id, mood);
    res.json({ message: 'Mood updated', avatar });
  } catch (error) {
    console.error('Error updating mood:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/v1/avatar/experience
 * @desc    Add experience points (admin or system use)
 * @access  Private
 */
router.post('/experience', protect, async (req, res) => {
  try {
    const { points, reason } = req.body;

    if (!points || points <= 0) {
      return res.status(400).json({ message: 'Invalid points' });
    }

    const result = await Avatar.addExperience(req.user.id, points, reason);
    res.json({
      message: result.leveledUp ? `Level up! Now level ${result.newLevel}` : 'Experience gained',
      ...result
    });
  } catch (error) {
    console.error('Error adding experience:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/v1/avatar/shop
 * @desc    Get avatar shop (avatars and accessories)
 * @access  Private
 */
router.get('/shop', protect, async (req, res) => {
  try {
    const avatars = await Avatar.getAllAvatars();
    const accessories = await Avatar.getAllAccessories();
    
    // Group accessories by category
    const accessoriesByCategory = accessories.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});

    res.json({ avatars, accessories: accessoriesByCategory });
  } catch (error) {
    console.error('Error fetching shop:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/v1/avatar/purchase-accessory
 * @desc    Purchase an accessory
 * @access  Private
 */
router.post('/purchase-accessory', protect, async (req, res) => {
  try {
    const { accessory_id } = req.body;

    if (!accessory_id) {
      return res.status(400).json({ message: 'Accessory ID required' });
    }

    const result = await Avatar.purchaseAccessory(req.user.id, accessory_id);
    res.json({
      message: `Successfully purchased ${result.accessory.name}!`,
      accessory: result.accessory
    });
  } catch (error) {
    console.error('Error purchasing accessory:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   POST /api/v1/avatar/change
 * @desc    Change avatar character
 * @access  Private
 */
router.post('/change', protect, async (req, res) => {
  try {
    const { avatar_id } = req.body;

    if (!avatar_id) {
      return res.status(400).json({ message: 'Avatar ID required' });
    }

    const result = await Avatar.changeAvatar(req.user.id, avatar_id);
    res.json({
      message: `Avatar changed to ${result.avatar.name}!`,
      avatar: result.avatar
    });
  } catch (error) {
    console.error('Error changing avatar:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/v1/avatar/xp-rewards
 * @desc    Get XP reward amounts for different actions
 * @access  Private
 */
router.get('/xp-rewards', protect, async (req, res) => {
  try {
    const rewards = Avatar.getXPRewards();
    res.json(rewards);
  } catch (error) {
    console.error('Error fetching XP rewards:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
