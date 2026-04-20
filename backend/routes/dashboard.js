const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// GET /dashboard
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 1. Subscription status counts and sum of monthly spend (for active only)
    const [spendStats] = await db.query(`
      SELECT 
        COUNT(CASE WHEN status = 'active' THEN 1 END) AS active_subs,
        COUNT(CASE WHEN status = 'paused' THEN 1 END) AS paused_subs,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) AS cancelled_subs,
        SUM(
          CASE 
            WHEN status = 'active' AND billing_cycle = 'monthly' THEN recurring_amount
            WHEN status = 'active' AND billing_cycle = 'yearly' THEN recurring_amount / 12
            WHEN status = 'active' AND billing_cycle = 'weekly' THEN recurring_amount * 4.33
            ELSE 0 
          END
        ) AS estimated_monthly_spend
      FROM subscriptions 
      WHERE user_id = ?
    `, [userId]);

    // 2. Category-wise breakdown (Using Stored Procedure)
    const [categoryProcResult] = await db.query('CALL sp_get_user_spending_report(?)', [userId]);
    const categoryBreakdown = categoryProcResult[0]; // First result set

    // 3. Upcoming renewals (next 30 days)
    const [upcomingRenewals] = await db.query(`
      SELECT id, service_name, category, recurring_amount, next_due_date, status
      FROM subscriptions
      WHERE user_id = ? AND status = 'active' AND next_due_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
      ORDER BY next_due_date ASC
    `, [userId]);

    // 4. Due this week (Using Database View)
    const [dueThisWeek] = await db.query('SELECT * FROM vw_due_this_week WHERE user_id = ?', [userId]);

    const [paymentHistory] = await db.query(`
      SELECT 
        s.service_name, 
        SUM(p.amount) as total_amount_paid,
        MAX(p.payment_date) as last_payment_date
      FROM subscriptions s
      LEFT JOIN payments p ON s.id = p.subscription_id
      WHERE s.user_id = ?
      GROUP BY s.id, s.service_name
      ORDER BY total_amount_paid DESC
    `, [userId]);

    // 5. Monthly Spending Trend
    const [trendData] = await db.query(`
      SELECT 
        DATE_FORMAT(payment_date, '%b %Y') as month_label,
        SUM(amount) as total_spent
      FROM payments
      WHERE user_id = ? AND payment_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(payment_date, '%b %Y'), YEAR(payment_date), MONTH(payment_date)
      ORDER BY YEAR(payment_date) ASC, MONTH(payment_date) ASC
    `, [userId]);

    // 6. Phase 3: Shared Debts Tracking (Who Owes You)
    const [whoOwesMe] = await db.query(`SELECT * FROM vw_shared_debts WHERE owner_id = ?`, [userId]);

    // 7. Phase 3: Native Budget Alerts
    const [budgetAlerts] = await db.query(`SELECT alert_message FROM budget_alerts WHERE user_id = ? ORDER BY created_at DESC LIMIT 3`, [userId]);

    const stats = spendStats[0];
    stats.estimated_annual_spend = (stats.estimated_monthly_spend || 0) * 12;

    res.json({
      stats,
      categoryBreakdown,
      upcomingRenewals,
      dueThisWeek,
      paymentHistory,
      trendData,
      whoOwesMe,
      budgetAlerts: budgetAlerts.map(a => a.alert_message)
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error generating dashboard data' });
  }
});

module.exports = router;
