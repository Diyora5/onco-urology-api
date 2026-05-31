const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EmployeeCertificate = sequelize.define(
  'EmployeeCertificate',
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
    title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: 'employee_certificates',
    timestamps: true,
    underscored: true,
  }
);

module.exports = EmployeeCertificate;
