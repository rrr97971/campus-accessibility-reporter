const pool = require('../config/db');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');

const VALID_CATEGORIES = [
  'Wheelchair Ramp', 'Elevator/Lift', 'Accessible Parking', 'Pathway',
  'Handrail', 'Entrance', 'Signage', 'Restroom', 'Other'
];
const VALID_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

// POST /api/issues  (student, authenticated)
// user_id now comes from the verified JWT (req.user.id), never from the
// request body — a user can no longer create an issue "as" someone else.
const createIssue = asyncHandler(async (req, res) => {
  const {
    title, description, category,
    location_building, location_area, location_description,
    latitude, longitude, priority
  } = req.body;
  const user_id = req.user.id;

  if (!title || !description || !category) {
    throw new ApiError(400, 'title, description and category are required');
  }
  if (!VALID_CATEGORIES.includes(category)) {
    throw new ApiError(400, `category must be one of: ${VALID_CATEGORIES.join(', ')}`);
  }
  if (priority && !VALID_PRIORITIES.includes(priority)) {
    throw new ApiError(400, `priority must be one of: ${VALID_PRIORITIES.join(', ')}`);
  }

  const result = await pool.query(
    `INSERT INTO accessibility_issues
      (user_id, title, description, category, location_building, location_area,
       location_description, latitude, longitude, priority)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,COALESCE($10,'Medium'))
     RETURNING *`,
    [user_id, title, description, category, location_building, location_area,
     location_description, latitude || null, longitude || null, priority]
  );

  res.status(201).json({ success: true, issue: result.rows[0] });
});

// GET /api/issues?status=&priority=&category=  (student, authenticated)
// Always scoped to the logged-in user's own issues — a student can never
// list someone else's reports through this route. Admin-wide listing
// lives separately at GET /api/admin/issues (Phase 8).
const getIssues = asyncHandler(async (req, res) => {
  const { status, priority, category } = req.query;
  const user_id = req.user.id;

  const conditions = ['user_id = $1'];
  const values = [user_id];

  if (status) { values.push(status); conditions.push(`status = $${values.length}`); }
  if (priority) { values.push(priority); conditions.push(`priority = $${values.length}`); }
  if (category) { values.push(category); conditions.push(`category = $${values.length}`); }

  const result = await pool.query(
    `SELECT * FROM accessibility_issues WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC`,
    values
  );

  res.json({ success: true, count: result.rows.length, issues: result.rows });
});

// GET /api/issues/:id  (owner or admin)
const getIssueById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await pool.query('SELECT * FROM accessibility_issues WHERE id = $1', [id]);

  if (result.rows.length === 0) {
    throw new ApiError(404, `Issue with id ${id} not found`);
  }

  const issue = result.rows[0];
  const isOwner = issue.user_id === req.user.id;
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) {
    throw new ApiError(403, 'You do not have permission to view this issue');
  }

  res.json({ success: true, issue });
});

// PUT /api/issues/:id  (owner only, and only while status = 'Reported')
const updateIssue = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, category, location_building, location_area,
          location_description, latitude, longitude } = req.body;

  const existing = await pool.query('SELECT * FROM accessibility_issues WHERE id = $1', [id]);
  if (existing.rows.length === 0) {
    throw new ApiError(404, `Issue with id ${id} not found`);
  }
  const issue = existing.rows[0];

  if (issue.user_id !== req.user.id) {
    throw new ApiError(403, 'You can only edit your own reports');
  }
  if (issue.status !== 'Reported') {
    throw new ApiError(400, 'This report can no longer be edited once it is under review');
  }

  const result = await pool.query(
    `UPDATE accessibility_issues SET
       title = COALESCE($1, title),
       description = COALESCE($2, description),
       category = COALESCE($3, category),
       location_building = COALESCE($4, location_building),
       location_area = COALESCE($5, location_area),
       location_description = COALESCE($6, location_description),
       latitude = COALESCE($7, latitude),
       longitude = COALESCE($8, longitude)
     WHERE id = $9
     RETURNING *`,
    [title, description, category, location_building, location_area,
     location_description, latitude, longitude, id]
  );

  res.json({ success: true, issue: result.rows[0] });
});

// DELETE /api/issues/:id  (owner only, and only while status = 'Reported')
const deleteIssue = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existing = await pool.query('SELECT * FROM accessibility_issues WHERE id = $1', [id]);
  if (existing.rows.length === 0) {
    throw new ApiError(404, `Issue with id ${id} not found`);
  }
  const issue = existing.rows[0];

  if (issue.user_id !== req.user.id) {
    throw new ApiError(403, 'You can only delete your own reports');
  }
  if (issue.status !== 'Reported') {
    throw new ApiError(400, 'This report can no longer be deleted once it is under review');
  }

  await pool.query('DELETE FROM accessibility_issues WHERE id = $1', [id]);
  res.json({ success: true, message: `Issue ${id} deleted` });
});

module.exports = { createIssue, getIssues, getIssueById, updateIssue, deleteIssue };
