# Vercel Limitations & Health/DB Considerations (Healthcare Backend)

## Database connectivity
- Vercel serverless functions typically execute on-demand; DB connections must be short-lived.
- Use pooled connections only if your runtime supports it; otherwise keep connection initialization minimal.

## Long-running processes / background jobs
- Vercel is not designed for long-running background workers.
- For recurring or long jobs (e.g., analytics aggregation, scheduled seeding), use an external job runner (e.g., AWS SQS + worker, Cloud Tasks, or GitHub Actions scheduled workflows).

## Zero-downtime / schema changes
- Migration-first strategy used here prevents runtime schema changes.
- Still consider compatibility windows for code vs schema (expand/contract pattern) when introducing breaking column changes.

## Audit logging
- Application logging should include request ids and error context (already present in middleware).
- Persist security/audit logs to external log storage (e.g., GCP Logging / ELK) for compliance.

## Recommendations
- Use `DB_URL` secret in Vercel for consistent environments.
- Add health checks that validate DB connectivity and that migrations are consistent (the workflow runs `migrate:status` pre-deploy).

