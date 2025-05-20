const express = require('express');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');
const { getLecturerDashboardData } = require('../controllers/lecturerController');

const router = express.Router();

// Protect the dashboard route and allow only lecturers
router.get('/dashboard', authMiddleware, authorizeRoles('lecturer'), getLecturerDashboardData);

module.exports = router;