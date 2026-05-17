require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Ensure the database is initialized
require('./config/db');

// Setup valid routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/otp', require('./routes/otp'));
app.use('/api/user', require('./routes/user'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/audit', require('./routes/audit'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/export', require('./routes/export'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Health check with DB verify
app.get('/api/health', async (req, res) => {
  try {
    const db = require('./config/db');
    await db.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Base placeholder route
app.get('/', (req, res) => {
  res.send('Subscription Tracker Backend API is running!');
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error', 
    message: err.message,
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
// Background Job: Email Budget Alerts (Skip on Vercel serverless environment to prevent timeout and database leakage)
if (!process.env.VERCEL) {
  const { sendBudgetAlertEmail } = require('./utils/mailer');
  setInterval(async () => {
    try {
      const db = require('./config/db');
      // Find un-emailed budget alerts
      const [alerts] = await db.query(`
        SELECT ba.id, u.email, u.name, u.monthly_budget, v.total_monthly_spend
        FROM budget_alerts ba
        JOIN users u ON ba.user_id = u.id
        JOIN vw_monthly_summary v ON u.id = v.user_id
        WHERE ba.emailed = FALSE AND u.email IS NOT NULL
      `);

      for (const alert of alerts) {
        if (alert.email) {
          await sendBudgetAlertEmail(alert.email, alert.name, alert.total_monthly_spend, alert.monthly_budget);
        }
        // Mark as emailed even if it failed, to prevent infinite loops of sending
        await db.query('UPDATE budget_alerts SET emailed = TRUE WHERE id = ?', [alert.id]);
      }
    } catch (err) {
      console.error('[Cron] Failed to process budget alerts:', err.message);
    }
  }, 60000); // Check every 60 seconds
}

module.exports = app;
