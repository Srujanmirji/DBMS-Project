const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const db = require('../config/db');

// POST /google
router.post('/google', async (req, res) => {
  try {
    const { access_token } = req.body;
    
    // Fetch profile securely from Google
    const profileRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    
    const { email, name, picture, sub } = profileRes.data;

    if (!email) throw new Error("No email returned from Google");

    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    let user = rows[0];

    if (!user) {
      // Register new Google user
      const [result] = await db.query(
        'INSERT INTO users (email, name, full_name, avatar_url, google_id, provider) VALUES (?, ?, ?, ?, ?, ?)',
        [email, name, name, picture, sub, 'google']
      );
      const [newRows] = await db.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
      user = newRows[0];
    } else {
      // If user exists but has no google_id, update them
      if (!user.google_id) {
        await db.query('UPDATE users SET google_id = ?, avatar_url = ?, provider = ? WHERE id = ?', [sub, picture, 'google', user.id]);
        user.google_id = sub;
        user.avatar_url = picture;
        user.provider = 'google';
      }
    }

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'super_secret_jwt_key_123',
      { expiresIn: '30d' }
    );
    
    const { password_hash: _, ...safeUser } = user;

    res.json({ token, user: safeUser, message: 'Google login successful' });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(500).json({ error: 'Google login failed' });
  }
});

// POST /register
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(400).json({ error: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const [result] = await db.query(
      'INSERT INTO users (email, password_hash) VALUES (?, ?)',
      [email, password_hash]
    );

    // Fetch the created user and return a token so the frontend can auto-login
    const [newUser] = await db.query('SELECT id, email, name, profile_picture FROM users WHERE id = ?', [result.insertId]);
    const user = newUser[0];
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'super_secret_jwt_key_123', { expiresIn: '30d' });

    res.status(201).json({ token, user, message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// POST /login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) return res.status(400).json({ error: 'Invalid credentials' });

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'super_secret_jwt_key_123', { expiresIn: '30d' });
    // Return user data (without password_hash) alongside the token
    const { password_hash: _, ...safeUser } = user;
    res.json({ token, user: safeUser, message: 'Logged in successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

module.exports = router;
