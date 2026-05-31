const {
  sequelize,
  Employee,
  WorkSchedule,
  Comment,
  CommentReaction,
  EmployeeProfile,
  EmployeeWorkExperience,
  EmployeeEducation,
  EmployeePublication,
  EmployeeCertificate,
  EmployeeInternship,
} = require('../models');

// GET /api/employees
exports.getAllEmployees = async (req, res, next) => {
  try {
    const employees = await Employee.findAll({
      order: [['id', 'ASC']],
    });
    res.json({ success: true, data: employees });
  } catch (err) {
    next(err);
  }
};

// GET /api/employees/:id
exports.getEmployeeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findByPk(id, {
      include: [
        { model: EmployeeProfile, as: 'profile' },
        { model: EmployeeWorkExperience, as: 'workExperiences' },
        { model: EmployeeEducation, as: 'educations' },
        { model: EmployeePublication, as: 'publications' },
        { model: EmployeeCertificate, as: 'certificates' },
        { model: EmployeeInternship, as: 'internships' },
        { model: WorkSchedule, as: 'workSchedules' },
        {
          model: Comment,
          as: 'comments',
          include: [{ model: CommentReaction, as: 'reactions' }],
        },
      ],
      order: [
        [{ model: Comment, as: 'comments' }, 'created_at', 'DESC'],
        [{ model: EmployeeWorkExperience, as: 'workExperiences' }, 'start_date', 'DESC'],
        [{ model: EmployeeEducation, as: 'educations' }, 'start_date', 'DESC'],
        [{ model: EmployeePublication, as: 'publications' }, 'id', 'ASC'],
        [{ model: EmployeeCertificate, as: 'certificates' }, 'id', 'ASC'],
        [{ model: EmployeeInternship, as: 'internships' }, 'id', 'ASC'],
      ],
    });

    if (!employee) {
      return res
        .status(404)
        .json({ success: false, message: 'Employee not found' });
    }

    res.json({ success: true, data: employee });
  } catch (err) {
    next(err);
  }
};

// Map an incoming work schedule item to the WorkSchedule model shape.
// Accepts both `isWorkingDay` (new) and `isDayOff` (existing) flags.
function mapSchedule(item) {
  let isDayOff = false;
  if (typeof item.isWorkingDay === 'boolean') {
    isDayOff = !item.isWorkingDay;
  } else if (typeof item.isDayOff === 'boolean') {
    isDayOff = item.isDayOff;
  }
  return {
    dayOfWeek: item.dayOfWeek,
    startTime: item.startTime ?? null,
    endTime: item.endTime ?? null,
    isDayOff,
  };
}

// POST /api/employees
// Creates an employee together with its optional nested resources
// (profile, workSchedules, workExperiences, educations) in a single transaction.
exports.createEmployee = async (req, res, next) => {
  const {
    fullName,
    position,
    department,
    imageUrl,
    photoUrl,
    phone,
    address,
    isActive,
    description,
    profile,
    workSchedules,
    workExperiences,
    educations,
  } = req.body;

  if (!fullName || !position) {
    return res.status(400).json({
      success: false,
      message: 'fullName and position are required',
    });
  }

  const t = await sequelize.transaction();
  try {
    const employee = await Employee.create(
      {
        fullName,
        position,
        department: department ?? null,
        imageUrl: imageUrl ?? null,
        // Keep photoUrl populated for backward compatibility with the frontend.
        photoUrl: photoUrl ?? imageUrl ?? null,
        phone: phone ?? null,
        address: address ?? null,
        description: description ?? null,
        isActive: isActive ?? true,
      },
      { transaction: t }
    );

    if (profile && typeof profile === 'object') {
      await EmployeeProfile.create(
        {
          employeeId: employee.id,
          bio: profile.bio ?? null,
          scientificInterests: Array.isArray(profile.scientificInterests)
            ? profile.scientificInterests
            : [],
          academicDegree: profile.academicDegree ?? null,
          academicTitle: profile.academicTitle ?? null,
          academyMembership: profile.academyMembership ?? null,
        },
        { transaction: t }
      );
    }

    if (Array.isArray(workSchedules) && workSchedules.length) {
      await WorkSchedule.bulkCreate(
        workSchedules.map((s) => ({
          employeeId: employee.id,
          ...mapSchedule(s),
        })),
        { transaction: t }
      );
    }

    if (Array.isArray(workExperiences) && workExperiences.length) {
      await EmployeeWorkExperience.bulkCreate(
        workExperiences.map((w) => ({
          employeeId: employee.id,
          organizationName: w.organizationName,
          position: w.position ?? null,
          department: w.department ?? null,
          startDate: w.startDate || null,
          endDate: w.endDate || null,
          isCurrent: w.isCurrent ?? false,
          description: w.description ?? null,
        })),
        { transaction: t }
      );
    }

    if (Array.isArray(educations) && educations.length) {
      await EmployeeEducation.bulkCreate(
        educations.map((e) => ({
          employeeId: employee.id,
          institutionName: e.institutionName,
          educationType: e.educationType ?? null,
          direction: e.direction ?? null,
          specialization: e.specialization ?? null,
          startDate: e.startDate || null,
          endDate: e.endDate || null,
          description: e.description ?? null,
        })),
        { transaction: t }
      );
    }

    await t.commit();

    const created = await Employee.findByPk(employee.id, {
      include: [
        { model: EmployeeProfile, as: 'profile' },
        { model: EmployeeWorkExperience, as: 'workExperiences' },
        { model: EmployeeEducation, as: 'educations' },
        { model: WorkSchedule, as: 'workSchedules' },
        {
          model: Comment,
          as: 'comments',
          include: [{ model: CommentReaction, as: 'reactions' }],
        },
      ],
    });

    res.status(201).json({ success: true, data: created });
  } catch (err) {
    await t.rollback();
    next(err);
  }
};
