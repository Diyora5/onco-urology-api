# Sequelize Migrations - Enterprise Setup

## CLI commands
From `doctor-info-site/backend`:
- `npm run migrate:create -- <name>` -> generates a new migration
- `npm run migrate:up` -> applies all pending migrations
- `npm run migrate:undo` -> reverts the most recent migration
- `npm run migrate:undo:all` -> reverts all applied migrations
- `npm run migrate:status` -> shows migration status

## Production rules
- Never call `sequelize.sync()` in production.
- Apply schema changes only through migrations.
- Migrations must be reversible: implement a working `down()`.

