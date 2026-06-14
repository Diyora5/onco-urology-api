# Deployment (Vercel) - Migration-first Strategy

## Prerequisites
- Vercel project configured.
- GitHub secrets configured in repository settings:
  - `VERCEL_TOKEN`
  - `VERCEL_PROJECT_ID`
  - `VERCEL_ORG_ID`
- Database secrets:
  - `DB_URL` (recommended) OR `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`
- Optional health:
  - `HEALTH_URL` (base url without `/health`)

## Workflow (deploy.yml)
1. Checkout
2. Install backend dependencies (npm ci)
3. Verify DB connectivity (`sequelize.authenticate()`)
4. Run `npm run migrate:up`
5. Verify no pending migrations via `npm run migrate:status`
6. Deploy application to Vercel
7. Post-deploy health check: `GET $HEALTH_URL/health` (if `HEALTH_URL` is set)

## Failure behavior
- If migrations fail, the workflow fails and Vercel deployment does not occur.
- If pending migrations are detected after migration execution, the workflow fails.

