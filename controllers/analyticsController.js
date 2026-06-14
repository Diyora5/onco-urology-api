const {
  sequelize,
  Employee,
  Comment,
  CommentReaction,
  EmployeeView,
} = require('../models');


const REACTION_TYPES = CommentReaction.REACTION_TYPES;

function emptyReactionStats() {
  return REACTION_TYPES.reduce((acc, t) => {
    acc[t] = 0;
    return acc;
  }, {});
}

function statsToCounts(stats) {
  return {
    likesCount: stats.LIKE || 0,
    dislikesCount: stats.DISLIKE || 0,
    heartsCount: stats.HEART || 0,
    smilesCount: stats.SMILE || 0,
    firesCount: stats.FIRE || 0,
  };
}


// GET /api/analytics/employees
exports.getEmployeesAnalytics = async (req, res, next) => {
  try {
    // DB-side aggregation to avoid loading entire tables in Node.
    const [employees, viewsAgg, commentsAgg, reactionsAgg] = await Promise.all([
      Employee.findAll({ order: [['id', 'ASC']], attributes: ['id', 'fullName', 'position'] }),

      EmployeeView.findAll({
        attributes: ['employeeId', [sequelize.fn('COUNT', sequelize.col('id')), 'viewsCount']],
        group: ['employeeId'],
        raw: true,
      }),

      Comment.findAll({
        attributes: ['employeeId', [sequelize.fn('COUNT', sequelize.col('id')), 'commentsCount']],
        group: ['employeeId'],
        raw: true,
      }),

      // reactions -> comment -> employee mapping
      sequelize.query(
        `SELECT c.employee_id AS "employeeId", cr.type AS "type", COUNT(cr.id)::int AS "count"
         FROM comment_reactions cr
         JOIN comments c ON c.id = cr.comment_id
         GROUP BY c.employee_id, cr.type`,
        { type: sequelize.QueryTypes.SELECT }
      ),
    ]);

    const viewsByEmployee = {};
    viewsAgg.forEach((r) => {
      viewsByEmployee[r.employeeId] = Number(r.viewsCount) || 0;
    });

    const commentsByEmployee = {};
    commentsAgg.forEach((r) => {
      commentsByEmployee[r.employeeId] = Number(r.commentsCount) || 0;
    });

    const reactionStatsByEmployee = {};
    reactionsAgg.forEach((r) => {
      const employeeId = r.employeeId;
      if (reactionStatsByEmployee[employeeId] == null) {
        reactionStatsByEmployee[employeeId] = emptyReactionStats();
      }
      reactionStatsByEmployee[employeeId][r.type] = Number(r.count) || 0;
    });

    const data = employees.map((emp) => {
      const stats = reactionStatsByEmployee[emp.id] || emptyReactionStats();
      const counts = statsToCounts(stats);
      const reactionsCount = Object.values(stats).reduce((a, b) => a + b, 0);

      return {
        employeeId: emp.id,
        fullName: emp.fullName,
        position: emp.position,
        viewsCount: viewsByEmployee[emp.id] || 0,
        commentsCount: commentsByEmployee[emp.id] || 0,
        reactionsCount,
        ...counts,
      };
    });

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};


// GET /api/analytics/employees/:employeeId
exports.getEmployeeAnalytics = async (req, res, next) => {
  try {
    const { employeeId } = req.params;

    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      return res
        .status(404)
        .json({ success: false, message: 'Employee not found' });
    }

    // Production perf: avoid building a large commentIds array and doing IN (...) queries.
    // Use SQL aggregation / join to compute reaction stats and counts for this employee.

    const [viewsCount, commentsCount, reactionAgg] = await Promise.all([
      EmployeeView.count({ where: { employeeId } }),
      Comment.count({ where: { employeeId } }),
      sequelize.query(
        `SELECT cr.type AS "type", COUNT(cr.id)::int AS "count"
         FROM comment_reactions cr
         JOIN comments c ON c.id = cr.comment_id
         WHERE c.employee_id = :employeeId
         GROUP BY cr.type`,
        {
          type: sequelize.QueryTypes.SELECT,
          replacements: { employeeId: Number(employeeId) },
        }
      ),
    ]);

    const reactionStats = emptyReactionStats();
    let reactionsCount = 0;
    reactionAgg.forEach((r) => {
      reactionStats[r.type] = Number(r.count) || 0;
      reactionsCount += Number(r.count) || 0;
    });

    const [recentViews, recentComments, recentReactions] = await Promise.all([
      EmployeeView.findAll({
        where: { employeeId },
        order: [['viewed_at', 'DESC']],
        limit: 10,
      }),
      Comment.findAll({
        where: { employeeId },
        order: [['commented_at', 'DESC']],
        limit: 10,
      }),
      CommentReaction.findAll({
        order: [['reactedAt', 'DESC']],
        limit: 10,
        include: [
          {
            model: Comment,
            as: 'comment',
            attributes: ['id', 'text'],
            where: { employeeId: Number(employeeId) },
          },
        ],
      }),
    ]);

    res.json({
      success: true,
      data: {
        employee,
        viewsCount,
        commentsCount,
        reactionsCount,
        reactionStats,
        recentViews,
        recentComments,
        recentReactions,
      },
    });
  } catch (err) {
    next(err);
  }
};


// GET /api/analytics/comments
exports.getCommentsAnalytics = async (req, res, next) => {
  try {
    // DB-side aggregation to avoid loading all reactions in Node.
    const [comments, reactionsAgg] = await Promise.all([
      Comment.findAll({
        order: [['id', 'ASC']],
        attributes: ['id', 'employeeId', 'authorName', 'text'],
      }),
      sequelize.query(
        `SELECT cr.comment_id AS "commentId", cr.type AS "type", COUNT(cr.id)::int AS "count"
         FROM comment_reactions cr
         GROUP BY cr.comment_id, cr.type`,
        { type: sequelize.QueryTypes.SELECT }
      ),
    ]);

    const statsByComment = {};
    reactionsAgg.forEach((r) => {
      if (statsByComment[r.commentId] == null) {
        statsByComment[r.commentId] = emptyReactionStats();
      }
      statsByComment[r.commentId][r.type] = Number(r.count) || 0;
    });

    const data = comments.map((c) => {
      const stats = statsByComment[c.id] || emptyReactionStats();
      const reactionsCount = Object.values(stats).reduce((a, b) => a + b, 0);
      return {
        commentId: c.id,
        employeeId: c.employeeId,
        authorName: c.authorName,
        text: c.text,
        reactionsCount,
        reactionStats: stats,
      };
    });

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};


// GET /api/analytics/history
exports.getHistory = async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);

    const [views, comments, reactions] = await Promise.all([
      EmployeeView.findAll({
        order: [['viewed_at', 'DESC']],
        limit,
        include: [
          { model: Employee, as: 'employee', attributes: ['id', 'fullName'] },
        ],
      }),
      Comment.findAll({
        order: [['commented_at', 'DESC']],
        limit,
        include: [
          { model: Employee, as: 'employee', attributes: ['id', 'fullName'] },
        ],
      }),
      CommentReaction.findAll({
        order: [['reacted_at', 'DESC']],
        limit,
        include: [
          {
            model: Comment,
            as: 'comment',
            attributes: ['id', 'employeeId', 'text'],
          },
        ],
      }),
    ]);

    res.json({
      success: true,
      data: { views, comments, reactions },
    });
  } catch (err) {
    next(err);
  }
};
