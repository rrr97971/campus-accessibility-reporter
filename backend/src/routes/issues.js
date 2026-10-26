const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const {
  createIssue,
  getIssues,
  getIssueById,
  updateIssue,
  deleteIssue
} = require('../controllers/issuesController');
const { getUpdates, createUpdate } = require('../controllers/issueUpdatesController');

// Every route below requires a valid JWT.
router.use(verifyToken);

router.post('/', createIssue);
router.get('/', getIssues);
router.get('/:id', getIssueById);
// Restrict Update and Delete APIs to administrative staff/supervisors (Q2b)
router.put('/:id', requireRole('admin'), updateIssue);
router.delete('/:id', requireRole('admin'), deleteIssue);

router.get('/:id/updates', getUpdates);
router.post('/:id/updates', requireRole('admin'), createUpdate);

module.exports = router;
