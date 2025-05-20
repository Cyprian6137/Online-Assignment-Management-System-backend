const express = require('express');
const router = express.Router();
const { getDashboardData } = require('../controllers/dashboardController');

router.get('/', getDashboardData); // Handle GET request to /api/dashboard

module.exports = router;