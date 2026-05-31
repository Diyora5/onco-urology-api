const { DepartmentInfo, DepartmentWorkSchedule } = require('../models');

const DAY_ORDER = DepartmentWorkSchedule.DAYS_OF_WEEK;

function sortSchedules(schedules = []) {
  return [...schedules].sort(
    (a, b) => DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek)
  );
}

// GET /api/department-info
exports.getDepartmentInfo = async (req, res, next) => {
  try {
    const record = await DepartmentInfo.findOne({
      include: [{ model: DepartmentWorkSchedule, as: 'workSchedules' }],
      order: [[{ model: DepartmentWorkSchedule, as: 'workSchedules' }, 'id', 'ASC']],
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Department info not found',
      });
    }

    const data = record.toJSON();
    data.workSchedules = sortSchedules(data.workSchedules || []);

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
