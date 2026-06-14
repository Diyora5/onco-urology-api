# Rollback (Vercel) - migrate:undo

## Trigger
Manual GitHub Actions trigger via workflow button.

## Workflow steps (rollback.yml)
1. Install backend deps (`npm ci`)
2. Execute `npm run migrate:undo` (rollback last migration)
3. Run `npm run migrate:status` to verify migration state
4. Log completion

## Partial rollback prevention
- Rollback is performed as a single `sequelize-cli db:migrate:undo` step.
- The workflow verifies migration status immediately after undo.
- If undo fails, workflow fails (no additional steps executed).

