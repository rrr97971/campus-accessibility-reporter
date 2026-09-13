const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');

const SALT_ROUNDS = 10;

// Basic structural check (something@something.tld) — catches typos and
// garbage before we even get to the domain check below.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Only this college's email domain may register — change this if your
// institution uses a different domain.
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
  const { email, password } = req.body;

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

  const token = signToken(user);

  res.json({
    success: true,
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
});

module.exports = { register, login };