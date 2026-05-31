const express = require('express');
const departmentInfoController = require('../controllers/departmentInfoController');

const router = express.Router();

router.get('/', departmentInfoController.getDepartmentInfo);

module.exports = router;
