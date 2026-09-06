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
router.put('/:id', updateIssue);
router.delete('/:id', deleteIssue);

router.get('/:id/updates', getUpdates);
router.post('/:id/updates', requireRole('admin'), createUpdate);

module.exports = router;
