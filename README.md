# Database Migration Rollback Briefs

Static browser-local MVP for turning public-safe database migration notes or scrubbed migration excerpts into a rollback-ready review brief, missing-context checklist, validation path, owner handoff, and private database-data privacy flags.

## Public pages

- Landing: `https://ert93333-ops.github.io/database-migration-rollback-briefs/`
- Checklist: `https://ert93333-ops.github.io/database-migration-rollback-briefs/database-migration-rollback-checklist.html`
- Public marketing checklist: `https://gist.github.com/ert93333-ops/d5f20e7a80e3617dcafeb36e576c9902`

## Scope

- No database connection, migration execution, SQL execution, backup/restore automation, production data, dumps, credentials, connection strings, raw logs, customer rows, backend, or external database.
- Shared marketing and notification credentials stay in the private root `.env` of the Hermes playbook, not in this public site directory.

## Verification

From the Hermes playbook root:

```powershell
npm run workflow:database-migration-rollback
```
