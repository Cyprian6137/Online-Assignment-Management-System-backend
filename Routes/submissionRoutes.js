const express = require('express');
const { submitAssignment, getSubmissionsByAssignment, gradeSubmission ,updateSubmission, deleteSubmission} = require('../controllers/submissionController');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/submit', authMiddleware, submitAssignment);
router.get('/:assignmentId/submissions', authMiddleware, getSubmissionsByAssignment);
router.put('/:submissionId/grade', authMiddleware, authorizeRoles('admin'), gradeSubmission);
router.put('/update/:submissionId', authMiddleware, updateSubmission);
router.delete("/:submissionId/delete", authMiddleware, deleteSubmission);
module.exports = router;
