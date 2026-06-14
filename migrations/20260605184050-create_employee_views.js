'use strict';

/**
 * Adds read-model style table(s) for `employeeView` if used.
 * The current codebase has `models/employeeView.js`, but no migration in repo.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    // employee_views (for view analytics / denormalized views)
    await queryInterface.createTable('employee_views', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      employee_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'employees', key: 'id' },
        onDelete: 'CASCADE',
      },
      visitor_ip: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      viewed_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('employee_views', ['employee_id']);
    await queryInterface.addIndex('employee_views', ['viewed_at']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('employee_views');
  },
};

