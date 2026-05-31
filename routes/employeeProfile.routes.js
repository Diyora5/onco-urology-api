const express = require('express');
const router = express.Router();
const controller = require('../controllers/employeeProfile.controller');

// Mounted at /api
router.get('/employees/:employeeId/profile', controller.getProfile);
router.post('/employees/:employeeId/profile', controller.createProfile);
router.put('/employees/:employeeId/profile', controller.updateProfile);
router.delete('/employees/:employeeId/profile', controller.deleteProfile);

module.exports = router;
