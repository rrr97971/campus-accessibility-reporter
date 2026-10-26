const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { generateSecret, generateURI, verifySync } = require('otplib');
const QRCode = require('qrcode');
const pool = require('../config/db');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');

const SALT_ROUNDS = 10;

// Basic structural check (something@something.tld)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Only this college's email domain may register
const ALLOWED_EMAIL_DOMAIN = '@vitstudent.ac.in';

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, 'name, email and password are required');
  }
  if (!EMAIL_REGEX.test(email)) {
    throw new ApiError(400, 'Please enter a valid email address');
  }
  if (!email.toLowerCase().endsWith(ALLOWED_EMAIL_DOMAIN)) {
    throw new ApiError(400, `Only ${ALLOWED_EMAIL_DOMAIN} email addresses can register`);
  }
  if (password.length < 6) {
    throw new ApiError(400, 'password must be at least 6 characters');
  }

  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, 'student')
     RETURNING id, name, email, role, created_at`,
    [name, email, password_hash]
  );

  const user = result.rows[0];
  const token = signToken(user);

  res.status(201).json({ success: true, token, user });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password, totp_token } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'email and password are required');
  }

  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  if (result.rows.length === 0) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const user = result.rows[0];
  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // --- Multi-Factor Authentication (TOTP for Q2b) ---
  if (user.mfa_enabled) {
    if (!totp_token) {
      return res.status(200).json({
        success: true,
        mfa_required: true,
        message: 'MFA is enabled. Please provide your 6-digit Authenticator code as totp_token.'
      });
    }

    try {
      const checkResult = verifySync({ token: String(totp_token).trim(), secret: user.mfa_secret });
      if (!checkResult || !checkResult.valid) {
        throw new ApiError(401, 'Invalid MFA verification code from Authenticator app');
      }
    } catch (err) {
      throw new ApiError(401, 'Invalid MFA verification code from Authenticator app');
    }
  }

  const token = signToken(user);

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      mfa_enabled: !!user.mfa_enabled
    }
  });
});

// POST /api/auth/mfa/setup (Requires auth token)
const setupMfa = asyncHandler(async (req, res) => {
  const userRes = await pool.query('SELECT id, email, mfa_enabled FROM users WHERE id = $1', [req.user.id]);
  const user = userRes.rows[0];
  if (!user) throw new ApiError(404, 'User not found');

  const secret = generateSecret();
  const otpauth = generateURI({
    issuer: 'CampusAccessibility',
    label: user.email,
    secret
  });
  const qrCodeUrl = await QRCode.toDataURL(otpauth);

  await pool.query('UPDATE users SET mfa_secret = $1 WHERE id = $2', [secret, req.user.id]);

  res.json({
    success: true,
    message: 'Scan this QR code with Google Authenticator or Microsoft Authenticator',
    secret,
    otpauth_url: otpauth,
    qr_code_image: qrCodeUrl
  });
});

// POST /api/auth/mfa/verify (Requires auth token)
const verifyMfa = asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (!token) throw new ApiError(400, '6-digit verification token is required');

  const userRes = await pool.query('SELECT mfa_secret FROM users WHERE id = $1', [req.user.id]);
  const user = userRes.rows[0];
  if (!user || !user.mfa_secret) {
    throw new ApiError(400, 'MFA setup has not been initiated for this account');
  }

  try {
    const checkResult = verifySync({ token: String(token).trim(), secret: user.mfa_secret });
    if (!checkResult || !checkResult.valid) {
      throw new ApiError(400, 'Invalid TOTP verification code');
    }
  } catch (err) {
    throw new ApiError(400, 'Invalid TOTP verification code');
  }

  await pool.query('UPDATE users SET mfa_enabled = true WHERE id = $1', [req.user.id]);

  res.json({
    success: true,
    message: 'MFA successfully verified and activated. Future logins will require Authenticator code.'
  });
});

// GET /api/auth/mfa/status (Requires auth token)
const getMfaStatus = asyncHandler(async (req, res) => {
  const userRes = await pool.query('SELECT mfa_enabled FROM users WHERE id = $1', [req.user.id]);
  res.json({ success: true, mfa_enabled: !!userRes.rows[0]?.mfa_enabled });
});

module.exports = {
  register,
  login,
  setupMfa,
  verifyMfa,
  getMfaStatus
};