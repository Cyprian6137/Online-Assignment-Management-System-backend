const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const { getStudentDashboardData } = require('../controllers/studentController');

const router = express.Router();

// Protect the dashboard route
router.get('/dashboard', authMiddleware, getStudentDashboardData);

module.exports = router;