const express = require('express');
const router = express.Router();
const controller = require('../controllers/employeeWorkExperience.controller');

// Mounted at /api
router.get(
  '/employees/:employeeId/work-experiences',
  controller.getWorkExperiences
);
router.post(
  '/employees/:employeeId/work-experiences',
  controller.createWorkExperience
);
router.put('/work-experiences/:id', controller.updateWorkExperience);
router.delete('/work-experiences/:id', controller.deleteWorkExperience);

module.exports = router;
