const express = require('express');
const router = express.Router();
const reactionController = require('../controllers/reactionController');

// Reactions nested under comments
router.post('/:commentId/reactions', reactionController.createReaction);
router.delete(
  '/:commentId/reactions/:reactionId',
  reactionController.deleteReaction
);

module.exports = router;
