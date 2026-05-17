const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// GET /payments — List all payments for the user (JOIN with subscriptions for context)
router.get('/', auth, async (req, res) => {
  try {
    const [payments] = await db.query(`
      SELECT 
        p.id,
        p.subscription_id,
        p.amount,
        p.payment_date,
        p.status,
        p.created_at,
        s.service_name,
        s.category,
        s.billing_cycle
      FROM payments p
      JOIN subscriptions s ON p.subscription_id = s.id
      WHERE p.user_id = ?
      ORDER BY p.payment_date DESC
    `, [req.user.id]);

    // Also return aggregate stats using a subquery
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total_payments,
        COALESCE(SUM(amount), 0) as total_spent,
        COALESCE(AVG(amount), 0) as avg_payment,
        COALESCE(MAX(amount), 0) as largest_payment,
        MAX(payment_date) as last_payment_date
      FROM payments
      WHERE user_id = ?
    `, [req.user.id]);

    res.json({ payments, stats: stats[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching payments' });
  }
});

// POST /payments — Record a new payment (uses Transaction)
router.post('/', auth, async (req, res) => {
  const { subscription_id, amount, payment_date } = req.body;

  if (!subscription_id || !amount || !payment_date) {
    return res.status(400).json({ error: 'subscription_id, amount, and payment_date are required' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Verify subscription belongs to user
    const [subs] = await connection.query(
      'SELECT * FROM subscriptions WHERE id = ? AND user_id = ?',
      [subscription_id, req.user.id]
    );
    if (subs.length === 0) {
      throw new Error('Subscription not found or unauthorized');
    }

    const sub = subs[0];

    // Insert payment record
    const [result] = await connection.query(
      'INSERT INTO payments (subscription_id, user_id, amount, payment_date, status) VALUES (?, ?, ?, ?, ?)',
      [subscription_id, req.user.id, amount, payment_date, 'completed']
    );

    // Auto-advance next_due_date based on billing_cycle
    let intervalExpr = 'INTERVAL 1 MONTH';
    if (sub.billing_cycle === 'yearly') intervalExpr = 'INTERVAL 1 YEAR';
    else if (sub.billing_cycle === 'weekly') intervalExpr = 'INTERVAL 1 WEEK';

    await connection.query(
      `UPDATE subscriptions SET next_due_date = DATE_ADD(next_due_date, ${intervalExpr}) WHERE id = ?`,
      [subscription_id]
    );

    await connection.commit();
    res.status(201).json({ message: 'Payment recorded successfully', id: result.insertId });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(400).json({ error: err.message || 'Server error recording payment' });
  } finally {
    connection.release();
  }
});

// DELETE /payments/:id — Remove a payment
router.delete('/:id', auth, async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM payments WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Payment not found or unauthorized' });
    }
    res.json({ message: 'Payment deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error deleting payment' });
  }
});

module.exports = router;
