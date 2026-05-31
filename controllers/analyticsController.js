const {
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
    const [employees, views, comments, reactions] = await Promise.all([
      Employee.findAll({ order: [['id', 'ASC']] }),
      EmployeeView.findAll({ attributes: ['employeeId'] }),
      Comment.findAll({ attributes: ['id', 'employeeId'] }),
      CommentReaction.findAll({ attributes: ['commentId', 'type'] }),
    ]);

    // Maps for fast aggregation
    const viewsByEmployee = {};
    views.forEach((v) => {
      viewsByEmployee[v.employeeId] = (viewsByEmployee[v.employeeId] || 0) + 1;
    });

    const commentsByEmployee = {};
    const commentToEmployee = {};
    comments.forEach((c) => {
      commentToEmployee[c.id] = c.employeeId;
      commentsByEmployee[c.employeeId] =
        (commentsByEmployee[c.employeeId] || 0) + 1;
    });

    const reactionStatsByEmployee = {};
    reactions.forEach((r) => {
      const employeeId = commentToEmployee[r.commentId];
      if (employeeId == null) return;
      if (!reactionStatsByEmployee[employeeId]) {
        reactionStatsByEmployee[employeeId] = emptyReactionStats();
      }
      reactionStatsByEmployee[employeeId][r.type] += 1;
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

    const employeeComments = await Comment.findAll({
      where: { employeeId },
      attributes: ['id'],
    });
    const commentIds = employeeComments.map((c) => c.id);

    const [viewsCount, commentsCount, reactions] = await Promise.all([
      EmployeeView.count({ where: { employeeId } }),
      Comment.count({ where: { employeeId } }),
      commentIds.length
        ? CommentReaction.findAll({ where: { commentId: commentIds } })
        : Promise.resolve([]),
    ]);

    const reactionStats = emptyReactionStats();
    reactions.forEach((r) => {
      reactionStats[r.type] += 1;
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
      commentIds.length
        ? CommentReaction.findAll({
            where: { commentId: commentIds },
            order: [['reacted_at', 'DESC']],
            limit: 10,
            include: [
              { model: Comment, as: 'comment', attributes: ['id', 'text'] },
            ],
          })
        : Promise.resolve([]),
    ]);

    res.json({
      success: true,
      data: {
        employee,
        viewsCount,
        commentsCount,
        reactionsCount: reactions.length,
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
    const [comments, reactions] = await Promise.all([
      Comment.findAll({ order: [['id', 'ASC']] }),
      CommentReaction.findAll({ attributes: ['commentId', 'type'] }),
    ]);

    const statsByComment = {};
    reactions.forEach((r) => {
      if (!statsByComment[r.commentId]) {
        statsByComment[r.commentId] = emptyReactionStats();
      }
      statsByComment[r.commentId][r.type] += 1;
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
