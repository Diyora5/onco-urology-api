'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // employee_profile (1:1)
    await queryInterface.createTable('employee_profiles', {
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
      bio: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      scientific_interests: {
        type: Sequelize.ARRAY ? Sequelize.ARRAY(Sequelize.TEXT) : Sequelize.JSON,
        allowNull: true,
      },
      academic_degree: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      academic_title: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      academy_membership: {
        type: Sequelize.STRING,
        allowNull: true,
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

    await queryInterface.addIndex('employee_profiles', ['employee_id'], {
      unique: true,
      name: 'employee_profiles_employee_id_unique',
    });

    // work_schedules (employee)
    await queryInterface.createTable('work_schedules', {
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
      day_of_week: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      start_time: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      end_time: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      is_day_off: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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

    await queryInterface.addIndex('work_schedules', ['employee_id']);
    await queryInterface.addIndex('work_schedules', ['day_of_week']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('work_schedules');
    await queryInterface.dropTable('employee_profiles');
  },
};

