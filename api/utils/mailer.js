const axios = require('axios');

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;

/**
 * Send an email via Google Apps Script Web App
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} body - HTML body content
 */
async function sendEmail(to, subject, body) {
  if (!APPS_SCRIPT_URL) {
    console.warn('[Mailer] APPS_SCRIPT_URL not set in .env — skipping email to:', to);
    return { status: 'skipped', reason: 'No APPS_SCRIPT_URL configured' };
  }

  try {
    const res = await axios.post(APPS_SCRIPT_URL, { to, subject, body }, {
      headers: { 'Content-Type': 'application/json' },
      // Google Apps Script redirects on POST, so we need to follow it
      maxRedirects: 5
    });
    console.log(`[Mailer] Email sent to ${to}: ${subject}`);
    return res.data;
  } catch (err) {
    console.error(`[Mailer] Failed to send email to ${to}:`, err.message);
    return { status: 'error', message: err.message };
  }
}

// ── Email Templates ──

function sendOTPEmail(to, otp) {
  const subject = '🔐 SubTracker - Your Login OTP';
  const body = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0a0a0a; border-radius: 16px; overflow: hidden; border: 1px solid #1e1e1e;">
      <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 32px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">SubTracker</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0;">Subscription Manager</p>
      </div>
      <div style="padding: 32px; text-align: center;">
        <p style="color: #ccc; font-size: 16px; margin: 0 0 24px;">Your one-time login code is:</p>
        <div style="background: #111; border: 2px dashed #f97316; border-radius: 12px; padding: 20px; margin: 0 auto; display: inline-block;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #fff;">${otp}</span>
        </div>
        <p style="color: #888; font-size: 13px; margin: 24px 0 0;">This code expires in <strong style="color:#f97316;">60 seconds</strong>. Do not share it with anyone.</p>
      </div>
      <div style="background: #111; padding: 16px; text-align: center; border-top: 1px solid #1e1e1e;">
        <p style="color: #555; font-size: 12px; margin: 0;">If you didn't request this, ignore this email.</p>
      </div>
    </div>
  `;
  return sendEmail(to, subject, body);
}

function sendWelcomeEmail(to, name) {
  const subject = '🎉 Welcome to SubTracker!';
  const body = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0a0a0a; border-radius: 16px; overflow: hidden; border: 1px solid #1e1e1e;">
      <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 32px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Welcome, ${name || 'there'}! 👋</h1>
      </div>
      <div style="padding: 32px;">
        <p style="color: #ccc; font-size: 15px; line-height: 1.6;">Your SubTracker account is ready. Start tracking your subscriptions, set budgets, and never miss a renewal again.</p>
        <div style="background: #111; border-radius: 12px; padding: 16px; margin: 20px 0; border: 1px solid #1e1e1e;">
          <p style="color: #f97316; font-weight: bold; margin: 0 0 8px;">Quick Start:</p>
          <p style="color: #aaa; font-size: 13px; margin: 0;">✅ Add your first subscription<br/>✅ Set a monthly budget<br/>✅ Get alerts before renewals</p>
        </div>
      </div>
    </div>
  `;
  return sendEmail(to, subject, body);
}

function sendBudgetAlertEmail(to, name, totalSpend, budget) {
  const percentage = ((totalSpend / budget) * 100).toFixed(0);
  const subject = `⚠️ Budget Alert — You've used ${percentage}% of your budget!`;
  const body = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0a0a0a; border-radius: 16px; overflow: hidden; border: 1px solid #1e1e1e;">
      <div style="background: linear-gradient(135deg, #f59e0b, #ef4444); padding: 32px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">⚠️ Budget Warning</h1>
      </div>
      <div style="padding: 32px; text-align: center;">
        <p style="color: #ccc; font-size: 15px;">Hey ${name || 'there'},</p>
        <div style="background: #1a1a2e; border-radius: 12px; padding: 24px; margin: 20px 0;">
          <p style="color: #f59e0b; font-size: 48px; font-weight: bold; margin: 0;">${percentage}%</p>
          <p style="color: #888; font-size: 13px; margin: 8px 0 0;">of your monthly budget used</p>
        </div>
        <p style="color: #aaa; font-size: 14px;">Spending: <strong style="color:#ef4444;">₹${totalSpend}</strong> / Budget: <strong style="color:#10b981;">₹${budget}</strong></p>
      </div>
    </div>
  `;
  return sendEmail(to, subject, body);
}

function sendSettlementEmail(to, fromName, serviceName, amount) {
  const subject = `💰 Debt Settled — ${fromName} paid for ${serviceName}`;
  const body = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0a0a0a; border-radius: 16px; overflow: hidden; border: 1px solid #1e1e1e;">
      <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 32px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">💰 Payment Received</h1>
      </div>
      <div style="padding: 32px; text-align: center;">
        <p style="color: #ccc; font-size: 15px;"><strong style="color:#fff;">${fromName}</strong> has settled their share for <strong style="color:#f97316;">${serviceName}</strong>.</p>
        <div style="background: #111; border-radius: 12px; padding: 24px; margin: 20px 0; border: 1px solid #1e1e1e;">
          <p style="color: #10b981; font-size: 42px; font-weight: bold; margin: 0;">₹${amount}</p>
          <p style="color: #888; font-size: 13px; margin: 8px 0 0;">has been recorded as paid</p>
        </div>
      </div>
    </div>
  `;
  return sendEmail(to, subject, body);
}

module.exports = { sendEmail, sendOTPEmail, sendWelcomeEmail, sendBudgetAlertEmail, sendSettlementEmail };
