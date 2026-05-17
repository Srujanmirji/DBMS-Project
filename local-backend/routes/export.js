const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// GET /export/csv — Export subscription + payment data as CSV
// Uses: Stored Procedure sp_get_user_spending_report, JOINs, Aggregates
router.get('/csv', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Fetch all subscriptions
    const [subscriptions] = await db.query(`
      SELECT 
        service_name, category, recurring_amount, billing_cycle, 
        status, next_due_date, is_trial, trial_end_date, uses,
        fn_calculate_true_value(recurring_amount, uses) as true_value
      FROM subscriptions
      WHERE user_id = ?
      ORDER BY recurring_amount DESC
    `, [userId]);

    // 2. Category spending report via Stored Procedure
    const [categoryResult] = await db.query('CALL sp_get_user_spending_report(?)', [userId]);
    const categoryReport = categoryResult[0];

    // 3. Payment history summary
    const [payments] = await db.query(`
      SELECT 
        s.service_name, p.amount, p.payment_date, p.status
      FROM payments p
      JOIN subscriptions s ON p.subscription_id = s.id
      WHERE p.user_id = ?
      ORDER BY p.payment_date DESC
    `, [userId]);

    // 4. Monthly summary from view
    const [monthlySummary] = await db.query(`
      SELECT * FROM vw_monthly_summary WHERE user_id = ?
    `, [userId]);

    // Build CSV content
    let csv = '';

    // Section 1: Subscriptions
    csv += '=== SUBSCRIPTION REPORT ===\n';
    csv += 'Service,Category,Amount,Billing Cycle,Status,Next Due Date,Is Trial,Uses,True Value\n';
    subscriptions.forEach(s => {
      csv += `"${s.service_name}","${s.category || ''}",${s.recurring_amount},${s.billing_cycle},${s.status},${s.next_due_date || ''},${s.is_trial ? 'Yes' : 'No'},${s.uses || 0},${s.true_value || s.recurring_amount}\n`;
    });

    // Section 2: Category Breakdown (from Stored Procedure)
    csv += '\n=== CATEGORY BREAKDOWN (via Stored Procedure) ===\n';
    csv += 'Category,Total Monthly Spend\n';
    categoryReport.forEach(c => {
      csv += `"${c.category}",${c.total_spent}\n`;
    });

    // Section 3: Monthly Summary (from View)
    csv += '\n=== MONTHLY SUMMARY (via Database View) ===\n';
    csv += 'Total Monthly Spend,Active Subscriptions\n';
    if (monthlySummary.length > 0) {
      const ms = monthlySummary[0];
      csv += `${ms.total_monthly_spend},${ms.active_subscriptions}\n`;
    }

    // Section 4: Payment History
    csv += '\n=== PAYMENT HISTORY ===\n';
    csv += 'Service,Amount,Payment Date,Status\n';
    payments.forEach(p => {
      csv += `"${p.service_name}",${p.amount},${p.payment_date},${p.status}\n`;
    });

    // Send as downloadable CSV
    const filename = `SubTracker_Report_${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error generating export' });
  }
});

module.exports = router;
