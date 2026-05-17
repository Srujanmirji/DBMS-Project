const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

const ADMIN_EMAILS = ['srujanmirji10@gmail.com', 'srujanmirji20@gmail.com'];

// GET /admin/analytics — Platform-wide statistics
router.get('/analytics', auth, async (req, res) => {
  try {
    // Verify Admin Access
    const [users] = await db.query('SELECT email FROM users WHERE id = ?', [req.user.id]);
    const userEmail = users[0]?.email?.toLowerCase();
    
    if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    // 1. Core KPIs
    const [coreStats] = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM subscriptions WHERE status = 'active') as total_active_subs,
        (SELECT COALESCE(SUM(recurring_amount), 0) FROM subscriptions WHERE status = 'active') as total_mrr
    `);

    // 2. Most Popular Services (Global)
    const [popularServices] = await db.query(`
      SELECT service_name, COUNT(*) as count 
      FROM subscriptions 
      GROUP BY service_name 
      ORDER BY count DESC 
      LIMIT 5
    `);

    // 3. Category Distribution (Global)
    const [categoryDistribution] = await db.query(`
      SELECT category, COUNT(*) as count, SUM(recurring_amount) as total_value
      FROM subscriptions 
      WHERE status = 'active'
      GROUP BY category 
      ORDER BY total_value DESC
    `);

    // 4. Recent Activity (Global Audit Logs)
    const [recentActivity] = await db.query(`
      SELECT sal.action, sal.old_status, sal.new_status, sal.log_date, s.service_name, u.name as user_name
      FROM subscription_audit_logs sal
      JOIN subscriptions s ON sal.subscription_id = s.id
      JOIN users u ON s.user_id = u.id
      ORDER BY sal.log_date DESC
      LIMIT 10
    `);

    // 5. Churn Metrics
    const [churnMetrics] = await db.query(`
      SELECT 
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_count,
        COUNT(CASE WHEN status = 'paused' THEN 1 END) as paused_count
      FROM subscriptions
    `);

    res.json({
      kpis: coreStats[0],
      popularServices,
      categoryDistribution,
      recentActivity,
      churnMetrics: churnMetrics[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error generating admin analytics' });
  }
});

module.exports = router;
