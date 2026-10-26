const express = require('express');
const router = express.Router();
const { register, login, setupMfa, verifyMfa, getMfaStatus } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);

// MFA routes (Q2b)
router.post('/mfa/setup', verifyToken, setupMfa);
router.post('/mfa/verify', verifyToken, verifyMfa);
router.get('/mfa/status', verifyToken, getMfaStatus);

module.exports = router;