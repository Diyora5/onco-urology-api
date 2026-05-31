const { Employee, EmployeeEducation } = require('../models');

function buildPayload(body) {
  const {
    institutionName,
    educationType,
    direction,
    specialization,
    startDate,
    endDate,
    description,
  } = body;

  return {
    institutionName,
    educationType: educationType ?? null,
    direction: direction ?? null,
    specialization: specialization ?? null,
    startDate: startDate || null,
    endDate: endDate || null,
    description: description ?? null,
  };
}

function validateType(educationType) {
  if (educationType == null) return true;
  return EmployeeEducation.EDUCATION_TYPES.includes(educationType);
}

// GET /api/employees/:employeeId/educations
exports.getEducations = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const items = await EmployeeEducation.findAll({
      where: { employeeId },
      order: [['startDate', 'DESC']],
    });
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
};

// POST /api/employees/:employeeId/educations
exports.createEducation = async (req, res, next) => {
  try {
    const { employeeId } = req.params;

    if (!req.body.institutionName) {
      return res
        .status(400)
        .json({ success: false, message: 'institutionName is required' });
    }

    if (!validateType(req.body.educationType)) {
      return res.status(400).json({
        success: false,
        message: `educationType must be one of: ${EmployeeEducation.EDUCATION_TYPES.join(', ')}`,
      });
    }

    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      return res
        .status(404)
        .json({ success: false, message: 'Employee not found' });
    }

    const item = await EmployeeEducation.create({
      employeeId: Number(employeeId),
      ...buildPayload(req.body),
    });

    res.status(201).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

// PUT /api/educations/:id
exports.updateEducation = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!validateType(req.body.educationType)) {
      return res.status(400).json({
        success: false,
        message: `educationType must be one of: ${EmployeeEducation.EDUCATION_TYPES.join(', ')}`,
      });
    }

    const item = await EmployeeEducation.findByPk(id);
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: 'Education not found' });
    }

    await item.update(buildPayload({ ...item.toJSON(), ...req.body }));
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/educations/:id
exports.deleteEducation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await EmployeeEducation.findByPk(id);

    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: 'Education not found' });
    }

    await item.destroy();
    res.json({ success: true, data: { id: Number(id) } });
  } catch (err) {
    next(err);
  }
};
