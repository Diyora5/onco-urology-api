const { Employee, EmployeeProfile } = require('../models');

function normalizeInterests(value) {
  if (Array.isArray(value)) return value;
  return [];
}

// GET /api/employees/:employeeId/profile
exports.getProfile = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const profile = await EmployeeProfile.findOne({ where: { employeeId } });

    if (!profile) {
      return res
        .status(404)
        .json({ success: false, message: 'Profile not found' });
    }

    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
};

// POST /api/employees/:employeeId/profile
exports.createProfile = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const {
      bio,
      scientificInterests,
      academicDegree,
      academicTitle,
      academyMembership,
    } = req.body;

    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      return res
        .status(404)
        .json({ success: false, message: 'Employee not found' });
    }

    const existing = await EmployeeProfile.findOne({ where: { employeeId } });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Profile already exists. Use PUT to update it.',
      });
    }

    const profile = await EmployeeProfile.create({
      employeeId: Number(employeeId),
      bio: bio ?? null,
      scientificInterests: normalizeInterests(scientificInterests),
      academicDegree: academicDegree ?? null,
      academicTitle: academicTitle ?? null,
      academyMembership: academyMembership ?? null,
    });

    res.status(201).json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
};

// PUT /api/employees/:employeeId/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const {
      bio,
      scientificInterests,
      academicDegree,
      academicTitle,
      academyMembership,
    } = req.body;

    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      return res
        .status(404)
        .json({ success: false, message: 'Employee not found' });
    }

    let profile = await EmployeeProfile.findOne({ where: { employeeId } });

    const payload = {
      employeeId: Number(employeeId),
      bio: bio ?? null,
      academicDegree: academicDegree ?? null,
      academicTitle: academicTitle ?? null,
      academyMembership: academyMembership ?? null,
    };
    if (scientificInterests !== undefined) {
      payload.scientificInterests = normalizeInterests(scientificInterests);
    }

    if (!profile) {
      // Upsert behaviour: create if it does not exist yet.
      profile = await EmployeeProfile.create({
        ...payload,
        scientificInterests: normalizeInterests(scientificInterests),
      });
      return res.status(201).json({ success: true, data: profile });
    }

    await profile.update(payload);
    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/employees/:employeeId/profile
exports.deleteProfile = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const profile = await EmployeeProfile.findOne({ where: { employeeId } });

    if (!profile) {
      return res
        .status(404)
        .json({ success: false, message: 'Profile not found' });
    }

    await profile.destroy();
    res.json({ success: true, data: { id: profile.id } });
  } catch (err) {
    next(err);
  }
};
