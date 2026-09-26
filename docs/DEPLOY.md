# Local and deployment record

## Local build

Use Node.js 22.12 or newer and npm. Run `npm ci`, then `npm run dev` for local review. `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, and `npm run format:check` are release checks; `npm run validate` repeats lint, typecheck, tests, and build. Vite emits `dist/`. The mock transport requires no environment variables or secrets.

The project is a Vite single-page app with routes `/` and `/demo`. `vercel.json` rewrites direct route requests to `/index.html`, following [Vercel's Vite SPA guidance](https://vercel.com/docs/frameworks/frontend/vite). Static assets are served from `dist/`.

## Release sequence

1. Finish both feature views and README; verify desktop, tablet, mobile, keyboard, loading/error/empty, expansion, and stress fixture.
2. Run the clean-install quality gates and inspect build output.
3. Commit the milestone, create/push a public Part 2 GitHub repository, and confirm anonymous access.
4. Deploy the production build to Vercel and verify direct navigation to both routes, main interactions, mobile layout, and browser console.
5. Add verified repository and live links to README, and record final delivery status here.

The repository and production URLs are recorded only after they have been verified. If deployment fails, inspect Vercel build logs and redeploy the last known good commit; account configuration failures do not require application architecture changes.
