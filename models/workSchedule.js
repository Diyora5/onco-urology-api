const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WorkSchedule = sequelize.define(
  'WorkSchedule',
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
    dayOfWeek: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'e.g. Monday, Tuesday ...',
    },
    startTime: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'e.g. 09:00',
    },
    endTime: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'e.g. 18:00',
    },
    isDayOff: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: 'work_schedules',
    timestamps: true,
    underscored: true,
  }
);

module.exports = WorkSchedule;
