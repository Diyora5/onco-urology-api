const express = require('express');
const router = express.Router();
const controller = require('../controllers/employeeEducation.controller');

// Mounted at /api
router.get('/employees/:employeeId/educations', controller.getEducations);
router.post('/employees/:employeeId/educations', controller.createEducation);
router.put('/educations/:id', controller.updateEducation);
router.delete('/educations/:id', controller.deleteEducation);

module.exports = router;
