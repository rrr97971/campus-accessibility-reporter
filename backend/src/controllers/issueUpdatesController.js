const pool = require('../config/db');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');

// GET /api/issues/:id/updates  (owner or admin)
const getUpdates = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const issueResult = await pool.query('SELECT user_id FROM accessibility_issues WHERE id = $1', [id]);
  if (issueResult.rows.length === 0) {
    throw new ApiError(404, `Issue with id ${id} not found`);
  }
  const isOwner = issueResult.rows[0].user_id === req.user.id;
  if (!isOwner && req.user.role !== 'admin') {
    throw new ApiError(403, 'You do not have permission to view this history');
  }

  const result = await pool.query(
    `SELECT iu.*, u.name AS updated_by_name
     FROM issue_updates iu
     JOIN users u ON u.id = iu.updated_by
     WHERE iu.issue_id = $1
     ORDER BY iu.created_at ASC`,
    [id]
  );

  res.json({ success: true, updates: result.rows });
});

// POST /api/issues/:id/updates  (admin only)
const createUpdate = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { new_status, comment } = req.body;

  if (!new_status) {
    throw new ApiError(400, 'new_status is required');
  }

  const issueResult = await pool.query('SELECT status FROM accessibility_issues WHERE id = $1', [id]);
  if (issueResult.rows.length === 0) {
    throw new ApiError(404, `Issue with id ${id} not found`);
  }
  const previous_status = issueResult.rows[0].status;

  const result = await pool.query(
    `INSERT INTO issue_updates (issue_id, updated_by, previous_status, new_status, comment)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [id, req.user.id, previous_status, new_status, comment || null]
  );

  res.status(201).json({ success: true, update: result.rows[0] });
});

module.exports = { getUpdates, createUpdate };