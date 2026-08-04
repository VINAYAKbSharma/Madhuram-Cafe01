import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../server/db.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  console.log('POST /api/auth/register', { body: req.body });
  try {
    const { fullName, mobile, email, password, address } = req.body;
    if (!mobile || !password) {
      console.log('Register failed: missing mobile or password');
      return res.status(400).json({ success: false, message: 'Mobile and password required' });
    }

    const db = await getDb();
    const [existingRows] = await db.query('SELECT id FROM users WHERE mobile = ?', [mobile]);
    if (existingRows.length) {
      console.log('Register failed: mobile already registered', mobile);
      return res.status(409).json({ success: false, message: 'Mobile already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const [result] = await db.query(
      'INSERT INTO users (fullName, mobile, email, password, address) VALUES (?, ?, ?, ?, ?)',
      [fullName || null, mobile, email || null, hash, JSON.stringify(address || {})]
    );

    console.log('Register successful:', { id: result.insertId, mobile });
    return res.json({ success: true, message: 'Registered successfully' });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { mobile, password } = req.body;
    if (!mobile || !password) return res.status(400).json({ success: false, message: 'Mobile and password required' });

    const db = await getDb();
    const [rows] = await db.query('SELECT id, fullName, mobile, password FROM users WHERE mobile = ?', [mobile]);
    if (!rows.length) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, mobile: user.mobile }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    return res.json({ success: true, token, user: { id: user.id, mobile: user.mobile, fullName: user.fullName } });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/auth/users — list all registered users
router.get('/users', async (req, res) => {
  try {
    const db = await getDb();
    const [rows] = await db.query(
      'SELECT id, fullName, mobile, email, createdAt FROM users ORDER BY id DESC'
    );
    return res.json({ success: true, users: rows });
  } catch (err) {
    console.error('Fetch users error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
