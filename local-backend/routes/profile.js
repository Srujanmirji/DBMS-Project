const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// GET /api/profile
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, email, full_name, phone, monthly_budget, preferred_currency, profile_completed FROM users WHERE id = ?',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ error: 'Server error fetching profile' });
  }
});

// POST /api/profile
router.post('/', auth, async (req, res) => {
  const { full_name, phone, monthly_budget, preferred_currency } = req.body;
  
  if (!full_name || !phone || !monthly_budget) {
     return res.status(400).json({ error: 'Validation failed: Missing required fields' });
  }

  try {
    const [result] = await db.query(
      'UPDATE users SET full_name = ?, phone = ?, monthly_budget = ?, preferred_currency = ?, profile_completed = TRUE WHERE id = ?',
      [full_name, phone, monthly_budget, preferred_currency || 'INR', req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Profile completed successfully', profile_completed: true });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: 'Server error updating profile' });
  }
});

module.exports = router;
