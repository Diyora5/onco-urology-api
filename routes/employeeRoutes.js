const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const commentController = require('../controllers/commentController');
const viewController = require('../controllers/viewController');

router.get('/', employeeController.getAllEmployees);
router.post('/', employeeController.createEmployee);
router.get('/:id', employeeController.getEmployeeById);

// Comments nested under employees
const { requireIntParam, validateRequiredBodyString, validateOptionalCleanText } = require('../middleware/validate');

router.get(
  '/:employeeId/comments',
  requireIntParam('employeeId'),
  commentController.getCommentsByEmployee
);
router.post(
  '/:employeeId/comments',
  requireIntParam('employeeId'),
  validateRequiredBodyString('authorName', { minLen: 1, maxLen: 80 }),
  validateRequiredBodyString('text', { minLen: 1, maxLen: 2000 }),
  commentController.createComment
);


// View history nested under employees
router.post('/:employeeId/views', viewController.createView);

module.exports = router;
