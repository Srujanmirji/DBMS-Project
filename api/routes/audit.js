const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// GET /audit — List audit logs for the user's subscriptions (JOIN with subscriptions)
router.get('/', auth, async (req, res) => {
  try {
    const [logs] = await db.query(`
      SELECT 
        sal.id,
        sal.subscription_id,
        sal.action,
        sal.old_status,
        sal.new_status,
        sal.log_date,
        s.service_name,
        s.category
      FROM subscription_audit_logs sal
      JOIN subscriptions s ON sal.subscription_id = s.id
      WHERE s.user_id = ?
      ORDER BY sal.log_date DESC
      LIMIT 100
    `, [req.user.id]);

    // Summary stats
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total_events,
        COUNT(CASE WHEN sal.new_status = 'paused' THEN 1 END) as pause_events,
        COUNT(CASE WHEN sal.new_status = 'cancelled' THEN 1 END) as cancel_events,
        COUNT(CASE WHEN sal.new_status = 'active' THEN 1 END) as reactivation_events,
        MIN(sal.log_date) as first_event,
        MAX(sal.log_date) as last_event
      FROM subscription_audit_logs sal
      JOIN subscriptions s ON sal.subscription_id = s.id
      WHERE s.user_id = ?
    `, [req.user.id]);

    res.json({ logs, stats: stats[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching audit logs' });
  }
});

module.exports = router;
