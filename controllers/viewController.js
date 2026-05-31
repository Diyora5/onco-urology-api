const { Employee, EmployeeView } = require('../models');
const { getVisitorInfo } = require('../utils/visitor');

// POST /api/employees/:employeeId/views
exports.createView = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const { visitorName } = req.body || {};

    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      return res
        .status(404)
        .json({ success: false, message: 'Employee not found' });
    }

    const { visitorIp, userAgent } = getVisitorInfo(req);

    const view = await EmployeeView.create({
      employeeId: Number(employeeId),
      visitorName: visitorName ? String(visitorName).trim() : null,
      visitorIp,
      userAgent,
      viewedAt: new Date(),
    });

    res.status(201).json({ success: true, data: view });
  } catch (err) {
    next(err);
  }
};
