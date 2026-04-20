const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// GET /subscriptions
router.get('/', auth, async (req, res) => {
  try {
    const [subscriptions] = await db.query(
      'SELECT * FROM subscriptions WHERE user_id = ? ORDER BY next_due_date ASC',
      [req.user.id]
    );
    res.json(subscriptions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching subscriptions' });
  }
});

// POST /subscriptions
router.post('/', auth, async (req, res) => {
  const { service_name, category, recurring_amount, billing_cycle, start_date, next_due_date, status, is_trial, trial_end_date } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO subscriptions (user_id, service_name, category, recurring_amount, billing_cycle, start_date, next_due_date, status, is_trial, trial_end_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, service_name, category, recurring_amount, billing_cycle, start_date, next_due_date, status || 'active', is_trial || false, trial_end_date || null]
    );
    res.status(201).json({ message: 'Subscription added successfully', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error saving subscription' });
  }
});

// PUT /subscriptions/:id
router.put('/:id', auth, async (req, res) => {
  const { id } = req.params;
  const { service_name, category, recurring_amount, billing_cycle, start_date, next_due_date, status, is_trial, trial_end_date } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE subscriptions SET service_name=?, category=?, recurring_amount=?, billing_cycle=?, start_date=?, next_due_date=?, status=?, is_trial=?, trial_end_date=? WHERE id=? AND user_id=?',
      [service_name, category, recurring_amount, billing_cycle, start_date, next_due_date, status, is_trial || false, trial_end_date || null, id, req.user.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Subscription not found or unauthorized' });
    res.json({ message: 'Subscription updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error updating subscription' });
  }
});

// POST /subscriptions/:id/share (Uses MySQL Transactions)
router.post('/:id/share', auth, async (req, res) => {
  const { id } = req.params;
  const { shared_with_email, split_percentage } = req.body;
  
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Verify sub belongs to user
    const [subs] = await connection.query('SELECT * FROM subscriptions WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (subs.length === 0) throw new Error("Subscription not found or unauthorized");

    // Find the recipient user
    const [users] = await connection.query('SELECT id FROM users WHERE email = ?', [shared_with_email]);
    if (users.length === 0) throw new Error("User to share with not found in database");
    const targetUserId = users[0].id;

    // Check if already shared
    const [existing] = await connection.query('SELECT * FROM shared_subscriptions WHERE subscription_id = ? AND shared_with_user_id = ?', [id, targetUserId]);
    if (existing.length > 0) throw new Error("Subscription already shared with this user");

    // Insert mapped transaction
    await connection.query(
      'INSERT INTO shared_subscriptions (subscription_id, shared_with_user_id, split_percentage) VALUES (?, ?, ?)',
      [id, targetUserId, split_percentage || 50.00]
    );

    await connection.commit();
    res.json({ message: 'Subscription successfully linked to transaction mapping' });
  } catch (err) {
    await connection.rollback();
    res.status(400).json({ error: err.message || 'Server error splitting transaction cost' });
  } finally {
    connection.release();
  }
});

// PATCH /subscriptions/:id/status
router.patch('/:id/status', auth, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'active', 'paused', 'cancelled'
  if (!['active', 'paused', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  try {
    const [result] = await db.query(
      'UPDATE subscriptions SET status = ? WHERE id = ? AND user_id = ?',
      [status, id, req.user.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Subscription not found or unauthorized' });
    res.json({ message: `Subscription marked as ${status}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error updating status' });
  }
});

// DELETE /subscriptions/:id
router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query(
      'DELETE FROM subscriptions WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Subscription not found or unauthorized' });
    res.json({ message: 'Subscription deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error deleting subscription' });
  }
});

module.exports = router;
