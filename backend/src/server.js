require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');
const issuesRouter = require('./routes/issues');
const authRouter = require('./routes/auth');
const uploadsRouter = require('./routes/uploads');
const adminRouter = require('./routes/admin');

const os = require('os');
const INSTANCE_ID = process.env.INSTANCE_ID || `${os.hostname()}-${process.pid}`;

const app = express();

// --- Middleware ---
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN?.split(',') || '*'
}));
app.use(express.json());

// Track backend instance for load balancing verification (Q1a)
app.use((req, res, next) => {
  res.setHeader('X-Served-By', INSTANCE_ID);
  next();
});

// --- Health check (useful for confirming cloud deployment works & load balancing) ---
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      success: true,
      message: 'API is running',
      database: 'connected',
      instance: INSTANCE_ID,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database not reachable', instance: INSTANCE_ID });
  }
});

// --- Routes ---
app.use('/api/auth', authRouter);
app.use('/api/issues', issuesRouter);
app.use('/api/uploads', uploadsRouter);
app.use('/api/admin', adminRouter);

// --- 404 handler ---
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// --- Centralized error handler (must be last) ---
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
