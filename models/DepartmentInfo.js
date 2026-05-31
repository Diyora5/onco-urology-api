const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DepartmentInfo = sequelize.define(
  'DepartmentInfo',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    advantages: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
  },
  {
    tableName: 'department_info',
    timestamps: true,
    underscored: true,
  }
);

module.exports = DepartmentInfo;
