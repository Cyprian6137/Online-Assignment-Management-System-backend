const express = require('express');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');
const { createAssignment, getAssignments } = require('../controllers/assignmentController');

const router = express.Router();

// Only Admins (Lecturers) can create assignments
router.post('/create', authMiddleware, authorizeRoles('admin'), createAssignment);

// Students & Admins can view assignments
router.get('/', authMiddleware, getAssignments);

module.exports = router;
