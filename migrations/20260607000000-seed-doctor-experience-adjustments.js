'use strict';

/**
 * Migration to safely adjust seeded doctor work-experience rows.
 * - Append missing experience entries for 3 doctors.
 * - Remove a specific experience description from 1 doctor.
 *
 * Idempotent: running multiple times will not duplicate entries.
 */

const { Op } = require('sequelize');

const CENTER_FULL_NAME =
  'Республиканский специализированный научно‑практический медицинский центр онкологии и радиологии';

const ADD_EXPERIENCE_OYBEK =
  `${CENTER_FULL_NAME}. С 2026 года — заместитель директора по научной и образовательной деятельности, руководитель отделения онкоурологии`;

const REMOVE_EXPERIENCE_GULM =
  'Заведующий отделением анестезиологии и реанимации';

const ADD_EXPERIENCE_MAVLUDJON =
  `${CENTER_FULL_NAME}. С 2026 года — заведующий отделением онкоурологии`;

const ADD_EXPERIENCE_DU =
  'С 2026 года — онкоуролог, ' + CENTER_FULL_NAME;

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const employeeWorkExperienceTable = 'employee_work_experiences';
    const employeesTable = 'employees';

    // Resolve employee ids by fullName.
    const employees = await queryInterface.sequelize.query(
      `SELECT id, fullName FROM ${employeesTable} WHERE fullName IN (:names)`,
      {
        type: Sequelize.QueryTypes.SELECT,
        replacements: {
          names: [
            'Авесханович Ойбек Халмурзаев',
            'Гулматов Сухроб Шавкатович',
            'Абдикаримов Мавлуджон Ганджиевич',
            'Дю Александр Владимирович',
          ],
        },
      }
    );

    const byName = new Map(employees.map((e) => [e.fullName, e.id]));

    const toAppend = [
      {
        name: 'Авесханович Ойбек Халмурзаев',
        description: ADD_EXPERIENCE_OYBEK,
      },
      {
        name: 'Абдикаримов Мавлуджон Ганджиевич',
        description: ADD_EXPERIENCE_MAVLUDJON,
      },
      {
        name: 'Дю Александр Владимирович',
        description: ADD_EXPERIENCE_DU,
      },
    ];

    const toRemove = [
      {
        name: 'Гулматов Сухроб Шавкатович',
        // seed data currently stores the whole description; we remove rows that contain this exact substring.
        contains: REMOVE_EXPERIENCE_GULM,
      },
    ];

    // Append missing experience rows (idempotent check by exact description).
    for (const item of toAppend) {
      const employeeId = byName.get(item.name);
      if (!employeeId) continue;

      const existing = await queryInterface.sequelize.query(
        `SELECT id FROM ${employeeWorkExperienceTable} WHERE employee_id = :employeeId AND description = :description LIMIT 1`,
        {
          type: Sequelize.QueryTypes.SELECT,
          replacements: {
            employeeId,
            description: item.description,
          },
        }
      );

      if (!existing || existing.length === 0) {
        // Parse date part similarly to seed.js parsePeriod.
        // For our inserted entries, we only know year 2026; treat as non-current unless 'н.в.' exists.
        const startYearMatch = item.description.match(/(\d{4})/);
        const startYear = startYearMatch ? Number(startYearMatch[1]) : 2026;

        const startDate = `${startYear}-01-01`;
        const endDate = `${startYear}-12-31`;
        const isCurrent = false;

        await queryInterface.bulkInsert(
          employeeWorkExperienceTable,
          [
            {
              employee_id: employeeId,
              organizationName: null,
              position: null,
              department: null,
              startDate,
              endDate,
              isCurrent,
              description: item.description,
              created_at: new Date(),
              updated_at: new Date(),
            },
          ],
          {}
        );
      }
    }

    // Remove specific experience rows.
    for (const item of toRemove) {
      const employeeId = byName.get(item.name);
      if (!employeeId) continue;

      await queryInterface.sequelize.query(
        `DELETE FROM ${employeeWorkExperienceTable}
         WHERE employee_id = :employeeId AND description LIKE :pattern`,
        {
          type: Sequelize.QueryTypes.BULKDELETE,
          replacements: {
            employeeId,
            pattern: `%${item.contains}%`,
          },
        }
      );
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Best-effort rollback:
    // - Remove the exact appended descriptions we inserted.
    // - Restore deletion isn't possible without a snapshot; keep rollback minimal.

    const employeeWorkExperienceTable = 'employee_work_experiences';
    const employeesTable = 'employees';

    const employees = await queryInterface.sequelize.query(
      `SELECT id, fullName FROM ${employeesTable} WHERE fullName IN (:names)`,
      {
        type: Sequelize.QueryTypes.SELECT,
        replacements: {
          names: [
            'Авесханович Ойбек Халмурзаев',
            'Абдикаримов Мавлуджон Ганджиевич',
            'Дю Александр Владимирович',
          ],
        },
      }
    );

    const byName = new Map(employees.map((e) => [e.fullName, e.id]));

    const toRemoveExact = [
      { name: 'Авесханович Ойбек Халмурзаев', description: ADD_EXPERIENCE_OYBEK },
      { name: 'Абдикаримов Мавлуджон Ганджиевич', description: ADD_EXPERIENCE_MAVLUDJON },
      { name: 'Дю Александр Владимирович', description: ADD_EXPERIENCE_DU },
    ];

    for (const item of toRemoveExact) {
      const employeeId = byName.get(item.name);
      if (!employeeId) continue;

      await queryInterface.sequelize.query(
        `DELETE FROM ${employeeWorkExperienceTable}
         WHERE employee_id = :employeeId AND description = :description`,
        {
          type: Sequelize.QueryTypes.BULKDELETE,
          replacements: {
            employeeId,
            description: item.description,
          },
        }
      );
    }
  },
};

