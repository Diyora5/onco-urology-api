const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EmployeeProfile = sequelize.define(
  'EmployeeProfile',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      field: 'employee_id',
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    scientificInterests: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    academicDegree: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    academicTitle: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    academyMembership: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: 'employee_profiles',
    timestamps: true,
    underscored: true,
  }
);

module.exports = EmployeeProfile;
