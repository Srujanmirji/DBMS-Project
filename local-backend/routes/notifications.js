const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// GET /notifications — Fetch all budget alerts for the user
router.get('/', auth, async (req, res) => {
  try {
    const [alerts] = await db.query(`
      SELECT id, alert_message, is_read, created_at
      FROM budget_alerts
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `, [req.user.id]);

    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN is_read = FALSE THEN 1 END) as unread
      FROM budget_alerts
      WHERE user_id = ?
    `, [req.user.id]);

    res.json({ alerts, stats: stats[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching notifications' });
  }
});

// PATCH /notifications/:id/read — Mark single alert as read
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const [result] = await db.query(
      'UPDATE budget_alerts SET is_read = TRUE WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Alert not found' });
    res.json({ message: 'Marked as read' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /notifications/read-all — Mark all alerts as read
router.patch('/read-all', auth, async (req, res) => {
  try {
    await db.query('UPDATE budget_alerts SET is_read = TRUE WHERE user_id = ?', [req.user.id]);
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /notifications/:id — Delete a single alert
router.delete('/:id', auth, async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM budget_alerts WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Alert not found' });
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
