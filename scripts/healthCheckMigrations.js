'use strict';

/**
 * Health check helper for CI/CD and runtime verification.
 * - Verifies DB connectivity
 * - Verifies there are no pending migrations
 * - Does NOT apply schema changes
 */

require('dotenv').config();

const { execSync } = require('child_process');
const path = require('path');
const { sequelize } = require('../models');

async function main() {
  // 1) DB connectivity
  await sequelize.authenticate();

  // 2) Pending migrations check
  const backendDir = __dirname;
  const cliDir = path.resolve(backendDir, '..');

  const statusOut = execSync('npx sequelize-cli db:migrate:status', {
    cwd: cliDir,
    stdio: 'pipe',
    env: process.env,
  }).toString('utf8');

  // Heuristic checks (sequelize-cli output varies by version).
  const hasPending = /pending/i.test(statusOut);
  if (hasPending) {

    console.error('Pending migrations detected.');
    console.error(statusOut);
    process.exit(1);
  }

  // Basic additional log
  console.log('healthcheck_migrations_ok');
  console.log(statusOut);
}

main().catch((e) => {
  console.error('healthcheck_failed', e);
  process.exit(1);
});

