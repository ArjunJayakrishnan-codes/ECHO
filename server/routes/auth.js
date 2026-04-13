import express from 'express';
import jwt from 'jsonwebtoken';
import db from '../database.js';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// Initialize Supabase client in routes as well
const supabaseUrl = process.env.SUPABASE_URL || 'https://hwvkodrvjrpfhkihezoy.supabase.co';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseServiceRoleKey 
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : null;

// Sign up - Create user in Supabase Auth, store metadata in local DB
router.post('/signup', async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  console.log(`\n📝 Signup request: email=${email}, supabase=${!!supabase ? 'YES' : 'NO (FALLBACK)'}`);

  try {
    // If Supabase is available, use it
    if (supabase) {
      console.log(`🔵 Attempting Supabase signup for ${email}`);
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        user_metadata: { name },
        email_confirm: true,
      });

      if (authError) {
        console.error('❌ Supabase signup error:', authError);
        return res.status(400).json({ error: authError.message || 'Signup failed' });
      }

      console.log('✅ Supabase user created:', authData.user.id);
      const userId = authData.user.id;

      // Store user in local DB for app data
      try {
        db.prepare('INSERT INTO users (id, email, name) VALUES (?, ?, ?)')
          .run(userId, email, name);
      } catch (dbError) {
        console.error('DB insert error:', dbError);
        // User created in Supabase even if local DB fails
      }

      // Initialize user status
      try {
        db.prepare('INSERT INTO user_status (user_id, is_online) VALUES (?, 0)')
          .run(userId);
      } catch (statusError) {
        console.error('Status insert error:', statusError);
      }

      // Generate local JWT for session
      const token = jwt.sign({ id: userId, email }, process.env.JWT_SECRET, { expiresIn: '7d' });

      res.status(201).json({
        user: { id: userId, email, name },
        token,
      });
    } else {
      // Fallback to local DB if Supabase not configured
      const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      db.prepare('INSERT INTO users (id, email, name) VALUES (?, ?, ?)')
        .run(userId, email, name);

      db.prepare('INSERT INTO user_status (user_id, is_online) VALUES (?, 0)')
        .run(userId);

      const token = jwt.sign({ id: userId, email }, process.env.JWT_SECRET, { expiresIn: '7d' });

      res.status(201).json({
        user: { id: userId, email, name },
        token,
      });
    }
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login - Verify with Supabase or local DB
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // If Supabase is available, use it
    if (supabase) {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error('Supabase login error:', authError);
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const userId = authData.user.id;

      // Get user info from local DB
      const user = db.prepare('SELECT * FROM users WHERE id = ? OR email = ?').get(userId, email);

      if (!user) {
        // User exists in Supabase but not in local DB, create entry
        try {
          db.prepare('INSERT INTO users (id, email, name) VALUES (?, ?, ?)')
            .run(userId, email, email.split('@')[0]);
        } catch (err) {
          console.error('Failed to create user entry in DB:', err);
        }
      }

      // Update user status to online
      try {
        db.prepare('UPDATE user_status SET is_online = 1, last_seen = CURRENT_TIMESTAMP WHERE user_id = ?')
          .run(userId);
      } catch (err) {
        console.error('Failed to update status:', err);
      }

      // Generate local JWT for session
      const token = jwt.sign({ id: userId, email }, process.env.JWT_SECRET, { expiresIn: '7d' });

      res.json({
        user: {
          id: userId,
          email,
          name: user ? user.name : email.split('@')[0],
        },
        token,
      });
    } else {
      // Fallback to local DB if Supabase not configured
      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // For fallback, just check user exists (no password validation without bcrypt)
      db.prepare('UPDATE user_status SET is_online = 1, last_seen = CURRENT_TIMESTAMP WHERE user_id = ?')
        .run(user.id);

      const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

      res.json({
        user: { id: user.id, email: user.email, name: user.name },
        token,
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


// Logout
router.post('/logout', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      db.prepare('UPDATE user_status SET is_online = 0, last_seen = CURRENT_TIMESTAMP WHERE user_id = ?')
        .run(decoded.id);
    } catch (error) {
      console.error('Token verification error:', error);
    }
  }

  res.json({ message: 'Logged out successfully' });
});

export default router;
