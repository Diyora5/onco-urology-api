'use strict';

/**
 * The repo already contains an empty stub migration files.
 * We keep them as-is (for audit/history), and introduce real schema migrations instead.
 *
 * This migration is intentionally a no-op to preserve chronological history.
 */
module.exports = {
  async up() {},
  async down() {},
};

