const express = require('express');
const { submitAssignment, getSubmissionsByAssignment, gradeSubmission } = require('../controllers/submissionController');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/submit', authMiddleware, submitAssignment);
router.get('/:assignmentId/submissions', authMiddleware, getSubmissionsByAssignment);
router.put('/:submissionId/grade', authMiddleware, authorizeRoles('admin'), gradeSubmission);

module.exports = router;
