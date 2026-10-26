const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// A single shared connection pool for the whole app.
// pg reuses connections instead of opening a new one per query —
// important when many users hit the API from different locations.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // required by Neon/Render managed Postgres
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
});

module.exports = pool;
