const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EDUCATION_TYPES = [
  'UNIVERSITY',
  'RESIDENCY',
  'MASTER',
  'PHD',
  'TRAINING',
  'CERTIFICATE',
  'QUALIFICATION',
  'COURSE',
];

const EmployeeEducation = sequelize.define(
  'EmployeeEducation',
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
    institutionName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    educationType: {
      type: DataTypes.ENUM(...EDUCATION_TYPES),
      allowNull: true,
    },
    direction: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    specialization: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'employee_educations',
    timestamps: true,
    underscored: true,
  }
);

EmployeeEducation.EDUCATION_TYPES = EDUCATION_TYPES;

module.exports = EmployeeEducation;
