import express from 'express';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import pool from '../config/database.js';
import Joi from 'joi';

const router = express.Router();

// Email transporter setup
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASSWORD;
const emailService = process.env.EMAIL_SERVICE || 'gmail';

if (!emailUser || !emailPass) {
  console.error('❌ CRITICAL: EMAIL_USER and EMAIL_PASSWORD environment variables are required');
  process.exit(1);
}

// Build transporter options with a short connection timeout for faster failures
const transporterOptions = {
  service: emailService,
  auth: {
    user: emailUser,
    pass: emailPass
  },
  // Make connection attempts fail fast in production to avoid long startup delays
  connectionTimeout: parseInt(process.env.EMAIL_CONNECTION_TIMEOUT_MS || '5000', 10)
};

const transporter = nodemailer.createTransport(transporterOptions);

// Allow skipping verification in environments where SMTP is not configured
if (process.env.SKIP_EMAIL_VERIFY === 'true') {
  console.log('Skipping email transporter verification (SKIP_EMAIL_VERIFY=true)');
} else {
  transporter.verify()
    .then(() => console.log('Email transporter verified'))
    .catch(err => console.error('Email transporter verify failed:', err && err.message ? err.message : err));
}

// Security & crypto settings
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
const REFRESH_TOKEN_EXPIRE_DAYS = parseInt(process.env.REFRESH_TOKEN_EXPIRE_DAYS || '7', 10);
const LOCKOUT_THRESHOLD = parseInt(process.env.LOCKOUT_THRESHOLD || '5', 10);
const LOCKOUT_MINUTES = parseInt(process.env.LOCKOUT_MINUTES || '30', 10);

// Validation schemas
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'any.required': 'Password is required'
  })
});

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Name must be at least 2 characters',
    'any.required': 'Name is required'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email',
    'any.required': 'Email is required'
  }),
  password: Joi.string().pattern(PASSWORD_REGEX).required().messages({
    'string.pattern.base': 'Password must be at least 12 characters and include uppercase, lowercase, number and special character',
    'any.required': 'Password is required'
  })
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email',
    'any.required': 'Email is required'
  })
});

const verifyOtpSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required(),
  newPassword: Joi.string().pattern(PASSWORD_REGEX).required().messages({
    'string.pattern.base': 'Password must be at least 12 characters and include uppercase, lowercase, number and special character'
  })
});

// Validation middleware
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const messages = error.details.map(detail => detail.message);
    return res.status(400).json({ error: messages.join(', ') });
  }
  req.validatedBody = value;
  next();
};

// Generate JWT token
const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Generate OTP (6 digits)
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Create a refresh token and persist in DB
const createRefreshToken = async (userId) => {
  const token = crypto.randomBytes(64).toString('hex');
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60 * 1000);
  await pool.query(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [userId, token, expiresAt]
  );
  return { token, expiresAt };
};

// Helper to find refresh token record
const findRefreshToken = async (token) => {
  const result = await pool.query('SELECT * FROM refresh_tokens WHERE token = $1 LIMIT 1', [token]);
  return result.rows[0];
};

// Login
router.post('/login', validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.validatedBody;

    // Query database for user
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return res.status(423).json({ error: `Account locked until ${new Date(user.locked_until).toISOString()}` });
    }

    // Compare password with hashed password
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      try {
        // Increment failed attempts
        const up = await pool.query('UPDATE users SET failed_login_attempts = failed_login_attempts + 1 WHERE id = $1 RETURNING failed_login_attempts', [user.id]);
        const attempts = up.rows[0]?.failed_login_attempts || 0;
        if (attempts >= LOCKOUT_THRESHOLD) {
          // Lock the account
          await pool.query('UPDATE users SET locked_until = NOW() + ($1 || \" minutes\")::interval, failed_login_attempts = 0 WHERE id = $2', [String(LOCKOUT_MINUTES), user.id]);
          return res.status(423).json({ error: `Account locked due to multiple failed attempts. Try again in ${LOCKOUT_MINUTES} minutes.` });
        }
      } catch (err) {
        console.error('Failed to update failed_login_attempts:', err && err.message ? err.message : err);
      }

      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Successful login - reset failed attempts and locked_until
    try {
      await pool.query('UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = $1', [user.id]);
    } catch (err) {
      console.error('Failed to reset failed_login_attempts after successful login:', err && err.message ? err.message : err);
    }

    const token = generateToken(user);
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile_completed: user.profile_completed
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed: ' + error.message });
  }
});

// Register
router.post('/register', validate(registerSchema), async (req, res) => {
  try {
    const { name, email, password } = req.validatedBody;

    // Check if email already exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
      const hashedPassword = await bcryptjs.hash(password, BCRYPT_SALT_ROUNDS);

    // Insert new user
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, hashedPassword, 'user']
    );

    const newUser = result.rows[0];
    const token = generateToken(newUser);
      // Create refresh token and set as httpOnly cookie
      try {
        const { token: refreshToken } = await createRefreshToken(newUser.id);
        res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60 * 1000
        });
      } catch (err) {
        console.error('Failed to create refresh token:', err.message);
      }

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        profile_completed: newUser.profile_completed
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed: ' + error.message });
  }
});

// Forgot Password - Send OTP
router.post('/forgot-password', validate(forgotPasswordSchema), async (req, res) => {
  try {
    const { email } = req.validatedBody;

    // Check if user exists
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      // For security, don't reveal if email exists
      return res.status(200).json({ 
        message: 'If an account exists with this email, an OTP will be sent' 
      });
    }

    const user = userResult.rows[0];
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database
    await pool.query(
      'INSERT INTO password_reset_otps (user_id, email, otp, expires_at) VALUES ($1, $2, $3, $4)',
      [user.id, email, otp, expiresAt]
    );

    // Send OTP via email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset OTP - BitMine',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>We received a request to reset your password. Use the OTP below to proceed:</p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; letter-spacing: 5px; margin: 0;">${otp}</h1>
          </div>
          <p style="color: #666;">This OTP is valid for 10 minutes.</p>
          <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email and your password will remain unchanged.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ 
      message: 'OTP sent to your email address' 
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// Verify OTP and Reset Password
router.post('/verify-otp-reset-password', validate(verifyOtpSchema), async (req, res) => {
  try {
    const { email, otp, newPassword } = req.validatedBody;

    // Find the OTP record
    const otpResult = await pool.query(
      'SELECT * FROM password_reset_otps WHERE email = $1 AND otp = $2 AND is_used = false AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
      [email, otp]
    );

    if (otpResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    const otpRecord = otpResult.rows[0];

    // Mark OTP as used
    await pool.query(
      'UPDATE password_reset_otps SET is_used = true WHERE id = $1',
      [otpRecord.id]
    );

    // Hash new password
    const hashedPassword = await bcryptjs.hash(newPassword, BCRYPT_SALT_ROUNDS);

    // Update user password
    await pool.query(
      'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
      [hashedPassword, otpRecord.user_id]
    );

    res.status(200).json({ 
      message: 'Password reset successfully. You can now login with your new password.' 
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query('SELECT id, name, email, role FROM users WHERE id = $1', [decoded.id]);
    
    const user = result.rows[0];
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Helper to parse refresh token from cookies or body
const parseRefreshTokenFromRequest = (req) => {
  if (req.body && req.body.refreshToken) return req.body.refreshToken;
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;
  const pairs = cookieHeader.split(';').map(p => p.trim());
  for (const pair of pairs) {
    const [k, v] = pair.split('=');
    if (k === 'refreshToken') return decodeURIComponent(v);
  }
  return null;
};

// Logout - revoke refresh token
router.post('/logout', async (req, res) => {
  try {
    const refreshToken = parseRefreshTokenFromRequest(req);
    if (!refreshToken) return res.status(400).json({ error: 'No refresh token provided' });

    await pool.query('UPDATE refresh_tokens SET revoked = true WHERE token = $1', [refreshToken]);
    // Clear cookie
    res.cookie('refreshToken', '', { maxAge: 0 });
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err.message);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Refresh endpoint - rotate refresh token and issue new access token
router.post('/refresh', async (req, res) => {
  try {
    const provided = parseRefreshTokenFromRequest(req) || req.body.refreshToken;
    if (!provided) return res.status(400).json({ error: 'No refresh token provided' });

    const record = await findRefreshToken(provided);
    if (!record || record.revoked) return res.status(401).json({ error: 'Invalid refresh token' });
    if (new Date(record.expires_at) <= new Date()) return res.status(401).json({ error: 'Refresh token expired' });

    // Rotate: revoke old token and create a new one
    await pool.query('UPDATE refresh_tokens SET revoked = true WHERE id = $1', [record.id]);
    const { token: newToken } = await createRefreshToken(record.user_id);

    // Issue new access token
    const userResult = await pool.query('SELECT id, name, email, role, profile_completed FROM users WHERE id = $1', [record.user_id]);
    const user = userResult.rows[0];
    if (!user) return res.status(404).json({ error: 'User not found' });
    const accessToken = generateToken(user);

    // Set new refresh token cookie
    res.cookie('refreshToken', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60 * 1000
    });

    res.json({ token: accessToken });
  } catch (err) {
    console.error('Refresh token error:', err.message);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

export default router;
