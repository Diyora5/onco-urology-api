const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DAYS_OF_WEEK = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
];

const DepartmentWorkSchedule = sequelize.define(
  'DepartmentWorkSchedule',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    departmentInfoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'department_info_id',
    },
    dayOfWeek: {
      type: DataTypes.ENUM(...DAYS_OF_WEEK),
      allowNull: false,
    },
    startTime: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    endTime: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isWorkingDay: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: 'department_work_schedules',
    timestamps: true,
    underscored: true,
  }
);

DepartmentWorkSchedule.DAYS_OF_WEEK = DAYS_OF_WEEK;

module.exports = DepartmentWorkSchedule;
