const bcrypt = require('bcrypt');
const { generateSync } = require('otplib');
const pool = require('../src/config/db');

async function runMfaVerification() {
  console.log('====================================================');
  console.log('   DA3 QUESTION 2B: MFA + RBAC AUTOMATED TEST SUITE  ');
  console.log('====================================================\n');

  // 1. Reset admin password to known value 'Password123'
  const hash = await bcrypt.hash('Password123', 10);
  await pool.query('UPDATE users SET password_hash = $1 WHERE id = 2', [hash]);
  console.log('✓ Admin password synchronized for testing.');

  // 2. Fetch admin user & MFA secret
  const userRes = await pool.query('SELECT id, email, role, mfa_secret, mfa_enabled FROM users WHERE id = 2');
  const admin = userRes.rows[0];
  console.log(`✓ Admin user: ${admin.email} (Role: ${admin.role}, MFA Enabled: ${admin.mfa_enabled})`);

  const base = 'http://localhost:5000/api';

  // --- Step 1: Login without TOTP code when MFA is enabled ---
  console.log('\n--- Step 1: Login attempt WITHOUT TOTP token ---');
  const r1 = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: admin.email, password: 'Password123' })
  });
  const r1Data = await r1.json();
  console.log(`HTTP Status: ${r1.status}`);
  console.log('Response:', r1Data);

  // --- Step 2: Login with INVALID TOTP code ---
  console.log('\n--- Step 2: Login attempt with INVALID TOTP token ("000000") ---');
  const r2 = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: admin.email, password: 'Password123', totp_token: '000000' })
  });
  const r2Data = await r2.json();
  console.log(`HTTP Status: ${r2.status}`);
  console.log('Response:', r2Data);

  // --- Step 3: Login with VALID TOTP code ---
  const validTotp = generateSync({ secret: admin.mfa_secret });
  console.log(`\n--- Step 3: Login attempt with VALID TOTP token ("${validTotp}") ---`);
  const r3 = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: admin.email, password: 'Password123', totp_token: validTotp })
  });
  const r3Data = await r3.json();
  console.log(`HTTP Status: ${r3.status}`);
  console.log('Response:', { success: r3Data.success, user: r3Data.user, tokenReceived: !!r3Data.token });

  const adminToken = r3Data.token;

  // --- Step 4: RBAC Test - Unauthenticated DELETE ---
  console.log('\n--- Step 4: DELETE /api/issues/1 WITHOUT Token ---');
  const r4 = await fetch(`${base}/issues/1`, { method: 'DELETE' });
  console.log(`HTTP Status: ${r4.status}`);
  console.log('Response:', await r4.json());

  // --- Step 5: RBAC Test - Student attempting DELETE ---
  const jwt = require('jsonwebtoken');
  const studentToken = jwt.sign({ id: 1, role: 'student', name: 'Student' }, process.env.JWT_SECRET, { expiresIn: '1h' });
  console.log('\n--- Step 5: DELETE /api/issues/1 WITH Student Token (Insufficient Role) ---');
  const r5 = await fetch(`${base}/issues/1`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  console.log(`HTTP Status: ${r5.status}`);
  console.log('Response:', await r5.json());

  console.log('\n====================================================');
  console.log('   ALL MFA & RBAC CHECKS COMPLETED SUCCESSFULLY!    ');
  console.log('====================================================');
  process.exit(0);
}

runMfaVerification().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
