const pool = require('../config/db');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');

const VALID_STATUSES = ['Reported', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Closed'];
const VALID_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

// GET /api/admin/issues?status=&priority=&category=&search=
const getAllIssues = asyncHandler(async (req, res) => {
  const { status, priority, category, search } = req.query;

  const conditions = [];
  const values = [];

  if (status) { values.push(status); conditions.push(`ai.status = $${values.length}`); }
  if (priority) { values.push(priority); conditions.push(`ai.priority = $${values.length}`); }
  if (category) { values.push(category); conditions.push(`ai.category = $${values.length}`); }
  if (search) { values.push(`%${search}%`); conditions.push(`ai.title ILIKE $${values.length}`); }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await pool.query(
    `SELECT ai.*, u.name AS reporter_name, u.email AS reporter_email
     FROM accessibility_issues ai
     JOIN users u ON u.id = ai.user_id
     ${whereClause}
     ORDER BY ai.created_at DESC`,
    values
  );

  res.json({ success: true, count: result.rows.length, issues: result.rows });
});

// GET /api/admin/dashboard
const getDashboardStats = asyncHandler(async (req, res) => {
  const result = await pool.query(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE status = 'Reported')::int AS reported,
      COUNT(*) FILTER (WHERE status = 'Under Review')::int AS under_review,
      COUNT(*) FILTER (WHERE status IN ('Assigned', 'In Progress'))::int AS in_progress,
      COUNT(*) FILTER (WHERE status = 'Resolved')::int AS resolved,
      COUNT(*) FILTER (WHERE priority = 'Critical')::int AS critical
    FROM accessibility_issues
  `);

  res.json({ success: true, stats: result.rows[0] });
});

async function logAndUpdate(issueId, adminId, updateSql, updateValues, statusChange) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const updateResult = await client.query(updateSql, updateValues);
    if (updateResult.rows.length === 0) {
      throw new ApiError(404, `Issue with id ${issueId} not found`);
    }

    if (statusChange) {
      await client.query(
        `INSERT INTO issue_updates (issue_id, updated_by, previous_status, new_status, comment)
         VALUES ($1, $2, $3, $4, $5)`,
        [issueId, adminId, statusChange.previous_status, statusChange.new_status, statusChange.comment || null]
      );
    }

    await client.query('COMMIT');
    return updateResult.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// PUT /api/admin/issues/:id/status
const updateStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, comment } = req.body;

  if (!status || !VALID_STATUSES.includes(status)) {
    throw new ApiError(400, `status must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  const existing = await pool.query('SELECT status FROM accessibility_issues WHERE id = $1', [id]);
  if (existing.rows.length === 0) {
    throw new ApiError(404, `Issue with id ${id} not found`);
  }
  const previous_status = existing.rows[0].status;

  const issue = await logAndUpdate(
    id, req.user.id,
    'UPDATE accessibility_issues SET status = $1 WHERE id = $2 RETURNING *',
    [status, id],
    { previous_status, new_status: status, comment }
  );

  res.json({ success: true, issue });
});

// PUT /api/admin/issues/:id/priority
const updatePriority = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { priority } = req.body;

  if (!priority || !VALID_PRIORITIES.includes(priority)) {
    throw new ApiError(400, `priority must be one of: ${VALID_PRIORITIES.join(', ')}`);
  }

  const result = await pool.query(
    'UPDATE accessibility_issues SET priority = $1 WHERE id = $2 RETURNING *',
    [priority, id]
  );
  if (result.rows.length === 0) {
    throw new ApiError(404, `Issue with id ${id} not found`);
  }

  res.json({ success: true, issue: result.rows[0] });
});

// PUT /api/admin/issues/:id/assign
const assignIssue = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { assigned_to } = req.body;

  if (!assigned_to) {
    throw new ApiError(400, 'assigned_to is required');
  }

  const result = await pool.query(
    'UPDATE accessibility_issues SET assigned_to = $1 WHERE id = $2 RETURNING *',
    [assigned_to, id]
  );
  if (result.rows.length === 0) {
    throw new ApiError(404, `Issue with id ${id} not found`);
  }

  res.json({ success: true, issue: result.rows[0] });
});

// DELETE /api/admin/issues/:id
const deleteIssueAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await pool.query('DELETE FROM accessibility_issues WHERE id = $1 RETURNING id', [id]);
  if (result.rows.length === 0) {
    throw new ApiError(404, `Issue with id ${id} not found`);
  }
  res.json({ success: true, message: `Issue ${id} deleted` });
});

module.exports = {
  getAllIssues,
  getDashboardStats,
  updateStatus,
  updatePriority,
  assignIssue,
  deleteIssueAdmin
};