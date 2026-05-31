const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const commentController = require('../controllers/commentController');
const viewController = require('../controllers/viewController');

router.get('/', employeeController.getAllEmployees);
router.post('/', employeeController.createEmployee);
router.get('/:id', employeeController.getEmployeeById);

// Comments nested under employees
router.get('/:employeeId/comments', commentController.getCommentsByEmployee);
router.post('/:employeeId/comments', commentController.createComment);

// View history nested under employees
router.post('/:employeeId/views', viewController.createView);

module.exports = router;
