const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const auth = require('../middleware/auth');

// Dashboard routes
router.get('/metrics', auth, dashboardController.getAgencyMetrics);
router.get('/charts/monthly-earnings', auth, dashboardController.getMonthlyEarnings);
router.get('/charts/deal-status', auth, dashboardController.getDealStatusChart);
router.get('/recent-deals', auth, dashboardController.getRecentDeals);

module.exports = router;
