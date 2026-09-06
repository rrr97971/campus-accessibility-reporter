const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const {
  getAllIssues,
  getDashboardStats,
  updateStatus,
  updatePriority,
  assignIssue,
  deleteIssueAdmin
} = require('../controllers/adminController');

// Every route below requires a valid JWT AND the 'admin' role.
router.use(verifyToken, requireRole('admin'));

router.get('/issues', getAllIssues);
router.get('/dashboard', getDashboardStats);
router.put('/issues/:id/status', updateStatus);
router.put('/issues/:id/priority', updatePriority);
router.put('/issues/:id/assign', assignIssue);
router.delete('/issues/:id', deleteIssueAdmin);

module.exports = router;