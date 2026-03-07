# Supabase + Codex Ops Template

This document is a practical operations template for running Supabase with Codex safely.

## 1. Environment separation

Use separate Supabase projects and secrets for each environment.

| Env | Purpose | Codex MCP access | Deploy trigger |
| --- | --- | --- | --- |
| `dev` | Daily development and testing | Allowed (`read_only=true` by default) | Push / PR |
| `stg` | Pre-production validation | Read-only preferred | Automatic after CI passes |
| `prod` | Production traffic | No direct MCP write access | Manual approval only |

Rules:
- Never share keys across environments.
- Never point local `.env` at `prod` accidentally.
- Use GitHub environments: `staging`, `production`.

## 2. Credential and key policy

Use keys by role:
- Browser/client: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Server/CI only: `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ACCESS_TOKEN`

Rules:
- Do not commit secrets into git.
- Rotate `service_role` and tokens on a fixed schedule.
- Keep `service_role` out of browser bundles and logs.

## 3. DB change policy (DDL)

All schema changes must be migration-file based.

Flow:
1. Create migration SQL in `supabase/migrations`.
2. Open PR and require at least one reviewer.
3. CI validates app quality checks and migration naming rules.
4. Deploy to `stg`.
5. Deploy to `prod` only with manual approval.

Recommended naming:
- `YYYYMMDDHHMMSS_short_description.sql`

## 4. Data change policy (DML)

For production data updates:
- Prefer Edge Functions or reviewed scripts.
- Require impact statement before execution:
  - target table
  - predicate/where clause
  - expected row count
- Keep rollback/recovery query prepared in advance.

Emergency path:
1. Incident ticket and owner assignment.
2. Peer approval.
3. Execute minimal scoped query.
4. Post-incident report.

## 5. RLS and privilege baseline

- Enable RLS on all user-facing tables.
- Policy names follow `role_action_scope`.
- High-privilege flows run only on trusted server paths (Edge Functions or backend).

## 6. Codex MCP operation rules

- Default mode is read-only MCP.
- Any write action requires explicit human approval.
- Never allow Codex direct write path to `prod`.
- Log SQL/operation intent before execution.

Example dev-only MCP registration:

```bash
codex mcp add supabase \
  --url "https://mcp.supabase.com/mcp?project_ref=YOUR_DEV_PROJECT_REF&read_only=true&features=database,docs"
```

## 7. CI/CD checklist

CI (`.github/workflows/ci.yml`):
- install dependencies
- lint
- typecheck
- build
- migration filename guard

CD staging (`.github/workflows/deploy-stg.yml`):
- automatic on push to `main` after CI
- uses `staging` environment secrets

CD production (`.github/workflows/deploy-prod.yml`):
- manual (`workflow_dispatch`)
- uses `production` environment protection and approval

## 8. Required GitHub secrets

Repository or environment secrets:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_ACCESS_TOKEN` (if CLI deployment is enabled)
- `SUPABASE_PROJECT_REF` (optional, for CLI deploy commands)

Environment-specific (recommended):
- `staging`: staging project values
- `production`: production project values

## 9. Runbook (short)

Daily:
- Use `dev` only for Codex-assisted DB exploration.
- Merge only CI-green PRs.

Release to production:
1. Confirm `stg` passed smoke tests.
2. Trigger `deploy-prod` manually.
3. Approver validates changelog and migration impact.
4. Monitor errors and rollback if needed.
