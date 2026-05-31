const { Employee, Comment, CommentReaction } = require('../models');
const { getVisitorInfo } = require('../utils/visitor');

// POST /api/employees/:employeeId/comments
exports.createComment = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const { authorName, text } = req.body;

    if (!authorName || !text) {
      return res.status(400).json({
        success: false,
        message: 'authorName and text are required',
      });
    }

    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      return res
        .status(404)
        .json({ success: false, message: 'Employee not found' });
    }

    const { visitorIp, userAgent } = getVisitorInfo(req);

    const comment = await Comment.create({
      employeeId: Number(employeeId),
      authorName: authorName.trim(),
      text: text.trim(),
      visitorIp,
      userAgent,
      commentedAt: new Date(),
    });

    const created = await Comment.findByPk(comment.id, {
      include: [{ model: CommentReaction, as: 'reactions' }],
    });

    res.status(201).json({ success: true, data: created });
  } catch (err) {
    next(err);
  }
};

// GET /api/employees/:employeeId/comments
exports.getCommentsByEmployee = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const comments = await Comment.findAll({
      where: { employeeId },
      include: [{ model: CommentReaction, as: 'reactions' }],
      order: [['created_at', 'DESC']],
    });
    res.json({ success: true, data: comments });
  } catch (err) {
    next(err);
  }
};
