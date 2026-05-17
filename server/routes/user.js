const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// GET /api/user/profile
router.get('/profile', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, full_name, email, phone, monthly_budget, preferred_currency, reminders_enabled, profile_picture, avatar_url, google_id, provider, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching profile' });
  }
});

// PUT /api/user/profile
router.put('/profile', auth, async (req, res) => {
  const { full_name, phone, monthly_budget, preferred_currency, reminders_enabled, profile_picture } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE users SET name = ?, full_name = ?, phone = ?, monthly_budget = ?, preferred_currency = ?, reminders_enabled = ?, profile_picture = ? WHERE id = ?',
      [full_name, full_name, phone, monthly_budget || 0, preferred_currency || 'INR', reminders_enabled !== undefined ? reminders_enabled : true, profile_picture, req.user.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error updating profile' });
  }
});

// PUT /api/user/password
router.put('/password', auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const [users] = await db.query('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, users[0].password_hash);
    if (!isMatch) return res.status(400).json({ error: 'Incorrect current password' });

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, req.user.id]);
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error changing password' });
  }
});

// DELETE /api/user
router.delete('/', auth, async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [req.user.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error deleting account' });
  }
});

module.exports = router;
