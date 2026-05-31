const { Employee, EmployeeWorkExperience } = require('../models');

function buildPayload(body) {
  const {
    organizationName,
    position,
    department,
    startDate,
    endDate,
    isCurrent,
    description,
  } = body;

  return {
    organizationName,
    position: position ?? null,
    department: department ?? null,
    startDate: startDate || null,
    endDate: endDate || null,
    isCurrent: isCurrent ?? false,
    description: description ?? null,
  };
}

// GET /api/employees/:employeeId/work-experiences
exports.getWorkExperiences = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const items = await EmployeeWorkExperience.findAll({
      where: { employeeId },
      order: [
        ['isCurrent', 'DESC'],
        ['startDate', 'DESC'],
      ],
    });
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
};

// POST /api/employees/:employeeId/work-experiences
exports.createWorkExperience = async (req, res, next) => {
  try {
    const { employeeId } = req.params;

    if (!req.body.organizationName) {
      return res
        .status(400)
        .json({ success: false, message: 'organizationName is required' });
    }

    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      return res
        .status(404)
        .json({ success: false, message: 'Employee not found' });
    }

    const item = await EmployeeWorkExperience.create({
      employeeId: Number(employeeId),
      ...buildPayload(req.body),
    });

    res.status(201).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

// PUT /api/work-experiences/:id
exports.updateWorkExperience = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await EmployeeWorkExperience.findByPk(id);

    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: 'Work experience not found' });
    }

    await item.update(buildPayload({ ...item.toJSON(), ...req.body }));
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/work-experiences/:id
exports.deleteWorkExperience = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await EmployeeWorkExperience.findByPk(id);

    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: 'Work experience not found' });
    }

    await item.destroy();
    res.json({ success: true, data: { id: Number(id) } });
  } catch (err) {
    next(err);
  }
};
