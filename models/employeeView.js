const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EmployeeView = sequelize.define(
  'EmployeeView',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'employee_id',
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
    viewedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'employee_views',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['employee_id'] },
      // Used by analytics recent-views ordering.
      { fields: ['viewed_at'] },
    ],

  }
);



module.exports = EmployeeView;
