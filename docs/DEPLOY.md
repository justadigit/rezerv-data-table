# Local and deployment plan

**Phase 1 status:** The foundation application and npm scripts exist. Assessment features and deployment remain pending.

## Prerequisites

Use Node.js 22.12 or newer and npm. A later phase will create a public GitHub repository for Part 2, separate from Part 1. Vercel is the planned host; the assessment also allows Netlify or equivalent.

## Local and quality commands

Run `npm ci`, then `npm run dev` for local development. Quality commands are `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, and `npm run format:check`. `npm run validate` runs lint, typecheck, tests, and build together. `npm run test:watch` and `npm run format` are available during development. The Vite static build emits `dist/`.

## Environment variables

None are currently required; the mock transport needs no secrets. If later implementation adds variables, document names, scope, safe defaults, and host configuration here before deployment. Never commit credentials.

## Pre-deploy and smoke check

Before deploying: complete the README, run all four quality gates, inspect both demos at desktop/tablet/mobile widths, test slow/error/empty fixtures, and confirm controlled and on-demand flows. Publish a public repository and verify it opens anonymously.

On Vercel, connect the Part 2 repository, use the selected package manager, run its `build` script, and serve `dist/`. Configure SPA rewrites only if routing actually needs them. After deployment, open the live URL and verify both demos, sorting, pagination, expansion, pinned scrolling, loading/error/empty states, and keyboard access. Record the URL in README and the submission.

If a later deployment fails, inspect build logs and redeploy the last known good commit or use the host's rollback facility. No rollback action is needed in Phase 1.
