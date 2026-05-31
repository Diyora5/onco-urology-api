const { Comment, CommentReaction } = require('../models');
const { getVisitorInfo } = require('../utils/visitor');

// POST /api/comments/:commentId/reactions
exports.createReaction = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { type, visitorName } = req.body;

    if (!type || !CommentReaction.REACTION_TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `type is required and must be one of: ${CommentReaction.REACTION_TYPES.join(', ')}`,
      });
    }

    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return res
        .status(404)
        .json({ success: false, message: 'Comment not found' });
    }

    const { visitorIp, userAgent } = getVisitorInfo(req);

    const reaction = await CommentReaction.create({
      commentId: Number(commentId),
      type,
      visitorName: visitorName ? String(visitorName).trim() : null,
      visitorIp,
      userAgent,
      reactedAt: new Date(),
    });

    res.status(201).json({ success: true, data: reaction });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/comments/:commentId/reactions/:reactionId
exports.deleteReaction = async (req, res, next) => {
  try {
    const { commentId, reactionId } = req.params;

    const reaction = await CommentReaction.findOne({
      where: { id: reactionId, commentId },
    });

    if (!reaction) {
      return res
        .status(404)
        .json({ success: false, message: 'Reaction not found' });
    }

    await reaction.destroy();
    res.json({ success: true, data: { id: Number(reactionId) } });
  } catch (err) {
    next(err);
  }
};
