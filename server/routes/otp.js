const express = require('express');
const router = express.Router();
const db = require('../config/db');
const jwt = require('jsonwebtoken');
const { sendOTPEmail } = require('../utils/mailer');

// Generate a 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /otp/send — Generate and email an OTP
router.post('/send', async (req, res) => {
  const { email, purpose } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 60 * 1000); // 60 seconds from now

    // Invalidate any previous unused OTPs for this email
    await db.query(
      'UPDATE otp_codes SET used = TRUE WHERE email = ? AND used = FALSE',
      [email]
    );

    // Insert new OTP into the database
    await db.query(
      'INSERT INTO otp_codes (email, otp, purpose, expires_at) VALUES (?, ?, ?, ?)',
      [email, otp, purpose || 'login', expiresAt]
    );

    // Send the email via Google Apps Script
    await sendOTPEmail(email, otp);

    res.json({ message: 'OTP sent successfully', expiresIn: '60 seconds' });
  } catch (err) {
    console.error('OTP Send Error:', err);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// POST /otp/verify — Verify an OTP and log the user in
router.post('/verify', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

  try {
    // Find a valid, unused OTP that hasn't expired
    const [rows] = await db.query(
      `SELECT * FROM otp_codes 
       WHERE email = ? AND otp = ? AND used = FALSE AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [email, otp]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Mark OTP as used
    await db.query('UPDATE otp_codes SET used = TRUE WHERE id = ?', [rows[0].id]);

    // Mark user's email as verified
    await db.query('UPDATE users SET email_verified = TRUE WHERE email = ?', [email]);

    // Check if user exists; create if new
    let [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    let user = users[0];

    if (!user) {
      // Auto-register via OTP (passwordless signup)
      const [result] = await db.query(
        "INSERT INTO users (email, email_verified, provider) VALUES (?, TRUE, 'otp')",
        [email]
      );
      const [newUsers] = await db.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
      user = newUsers[0];
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'super_secret_jwt_key_123',
      { expiresIn: '30d' }
    );

    const { password_hash: _, ...safeUser } = user;
    res.json({ token, user: safeUser, message: 'OTP verified — logged in successfully' });
  } catch (err) {
    console.error('OTP Verify Error:', err);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

module.exports = router;
