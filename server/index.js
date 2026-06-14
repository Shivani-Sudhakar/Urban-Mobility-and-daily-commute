import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import db from './database.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'namma_card_fallback_secret_key_2026';

app.use(cors());
app.use(express.json());

// Configure Nodemailer Gmail SMTP Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

// Helper to check if SMTP is configured
const isEmailConfigured = () => {
  return !!(process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD);
};

// Reusable Helper to deliver OTP
const sendEmailOtp = async (email, otp) => {
  if (!isEmailConfigured()) {
    console.log('\n=========================================');
    console.log(`[MOCK EMAIL OTP] Verification code for ${email} is: ${otp}`);
    console.log('=========================================\n');
    return true;
  }

  const mailOptions = {
    from: `"Namma Card" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your verification code",
    text: `Your OTP for Namma Card login: ${otp}\n\nNote: This code will expire in 5 minutes.`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; max-width: 500px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0f766e; margin-bottom: 20px; font-weight: 600;">Namma Card Verification</h2>
        <p style="font-size: 15px; color: #1e293b; line-height: 1.5;">Your OTP for Namma Card login is:</p>
        <div style="font-size: 32px; font-weight: bold; color: #0f766e; letter-spacing: 4px; margin: 20px 0; padding: 12px; background-color: #f1f5f9; text-align: center; border-radius: 6px;">
          ${otp}
        </div>
        <p style="font-size: 13px; color: #64748b; line-height: 1.5;">This verification code is valid for 5 minutes. If you did not request this code, please ignore this email.</p>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// POST /api/check-email — body { email }
app.post('/api/check-email', (req, res) => {
  const { email } = req.body;
  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ error: 'Valid email address is required' });
  }

  try {
    const stmt = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)');
    const user = stmt.get(email.trim());
    return res.json({ exists: !!user });
  } catch (error) {
    console.error('Database error in check-email:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/send-otp — body { email }
app.post('/api/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ error: 'Valid email address is required' });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    // Generate a 4-digit code (1000-9999)
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

    // Delete any existing rows in otp_codes for this email
    db.prepare('DELETE FROM otp_codes WHERE email = ?').run(normalizedEmail);

    // Insert new OTP record
    db.prepare('INSERT INTO otp_codes (email, otp, expires_at) VALUES (?, ?, ?)').run(normalizedEmail, otp, expiresAt);

    // Send the email (real SMTP or mock fallback)
    await sendEmailOtp(normalizedEmail, otp);

    return res.json({ success: true, mockMode: !isEmailConfigured() });
  } catch (error) {
    console.error('Error in send-otp:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to deliver OTP' });
  }
});

// POST /api/resend-otp — body { email }
app.post('/api/resend-otp', async (req, res) => {
  const { email } = req.body;
  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ error: 'Valid email address is required' });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    db.prepare('DELETE FROM otp_codes WHERE email = ?').run(normalizedEmail);
    db.prepare('INSERT INTO otp_codes (email, otp, expires_at) VALUES (?, ?, ?)').run(normalizedEmail, otp, expiresAt);

    await sendEmailOtp(normalizedEmail, otp);

    return res.json({ success: true, mockMode: !isEmailConfigured() });
  } catch (error) {
    console.error('Error in resend-otp:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to resend OTP' });
  }
});

// POST /api/verify-otp — body { email, otp }
app.post('/api/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required' });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    // Look up the most recent otp_codes row for this email
    const stmt = db.prepare('SELECT * FROM otp_codes WHERE email = ? ORDER BY id DESC LIMIT 1');
    const record = stmt.get(normalizedEmail);

    if (!record) {
      return res.json({ success: false, error: 'Incorrect OTP' });
    }

    // Check if OTP has expired
    const expiresAtTime = new Date(record.expires_at).getTime();
    if (Date.now() > expiresAtTime) {
      db.prepare('DELETE FROM otp_codes WHERE email = ?').run(normalizedEmail);
      return res.json({ success: false, error: 'OTP expired' });
    }

    // Check if OTP matches
    if (record.otp !== otp.trim()) {
      return res.json({ success: false, error: 'Incorrect OTP' });
    }

    // On match: delete the row (so it can't be reused)
    db.prepare('DELETE FROM otp_codes WHERE email = ?').run(normalizedEmail);

    return res.json({ success: true });
  } catch (error) {
    console.error('Error in verify-otp:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /api/register — body { name, email, password }
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Valid email address is required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    // Hash password with bcrypt
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const stmt = db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)');
    const result = stmt.run(name, normalizedEmail, passwordHash);
    const userId = result.lastInsertRowid;

    // Generate signed JWT expiring in 30 days
    const token = jwt.sign(
      { userId, name, email: normalizedEmail },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.json({ token });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE' || error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Email address already registered' });
    }
    console.error('Database error in register:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/login — body { email, password }
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Valid email address is required' });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const stmt = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)');
    const user = stmt.get(normalizedEmail);

    if (!user) {
      return res.json({ success: false, error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.json({ success: false, error: 'Incorrect password' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.json({ token });
  } catch (error) {
    console.error('Database error in login:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/me — reads the JWT from the Authorization: Bearer <token> header
app.get('/api/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header missing or invalid' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.json({
      name: decoded.name,
      email: decoded.email
    });
  } catch (error) {
    console.error('JWT verification failed:', error.message);
    return res.status(401).json({ error: 'Unauthorized, session expired or invalid' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
