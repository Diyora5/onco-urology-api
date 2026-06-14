const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const REACTION_TYPES = ['LIKE', 'DISLIKE', 'HEART', 'SMILE', 'FIRE'];

const CommentReaction = sequelize.define(
  'CommentReaction',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    commentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'comment_id',
    },
    type: {
      type: DataTypes.ENUM(...REACTION_TYPES),
      allowNull: false,
    },
    visitorName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    visitorIp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    reactedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'comment_reactions',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['comment_id'] },
      // Speeds up grouping by type and deletes scoped by (commentId).
      { fields: ['comment_id', 'type'] },
      // Used by analytics recent-reactions ordering.
      { fields: ['reacted_at'] },
    ],
  }
);




CommentReaction.REACTION_TYPES = REACTION_TYPES;

module.exports = CommentReaction;
