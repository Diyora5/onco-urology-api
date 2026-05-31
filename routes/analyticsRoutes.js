const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

router.get('/employees', analyticsController.getEmployeesAnalytics);
router.get('/employees/:employeeId', analyticsController.getEmployeeAnalytics);
router.get('/comments', analyticsController.getCommentsAnalytics);
router.get('/history', analyticsController.getHistory);

module.exports = router;
