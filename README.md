# Rezerv Frontend Engineering Assessment — Part 2

## Project overview

Phase 4 adds a generic row-expansion engine to the rendered DataTable. The assessment's domain features remain future work.

## Assessment scope

See [requirements](docs/REQUIREMENTS.md), traced to the original assessment and the Phase 0 brief.

## Technology stack

React, strict TypeScript, Vite, Tailwind CSS, React Router, and Heroicons through the design layer. Tests use Vitest, React Testing Library, and user-event.

## Implemented features

Foundation plus the generic DataTable core and rendered component: semantic table markup, sortable button headers, client and manual pagination controls, column-aligned loading skeletons, generic error/empty states, multiple left-pinned columns, and horizontal scrolling. Inline expansion renders caller-supplied children; on-demand expansion uses row-local loading, success, empty, error, and retry states. Successful and empty results are cached by default, request generations reject stale completions, and active requests abort on reset or unmount. Expansion buttons are native keyboard controls with `aria-expanded` and stable detail IDs. The class timetable, attendee views, and official second dataset are not implemented yet.

## Routes and demo pages

`/` is the future class timetable route and remains a foundation placeholder. `/demo` contains temporary neutral rows and explicit expansion scenarios for visual checks; it is not the official second dataset demo.

## Expansion API

Pass `expansion` to `DataTable<TRow, TChild>`. Inline mode supplies `getChildren(row)`; on-demand mode supplies `loadChildren(row, signal)`. Both modes supply `renderChildren(children, row, context)`, where the typed context includes `row`, `rowId`, and `children`. Existing two-argument renderers remain valid. The first data cell contains the toggle, and the detail row spans the data columns without affecting parent pagination.

On-demand success and empty success are cached by stable `getRowId` by default; set `cache: false` to refetch on re-expansion. Errors remain row-local and offer Retry. A collapsed request may finish and populate cache without reopening its row. The table aborts superseded and unmounted requests and ignores completions from older request generations. Set `expansionResetKey` to a new string or number whenever a different dataset may reuse row IDs; this clears expansion state and cache without resetting sorting or pagination. See [contracts](docs/CONTRACTS.md) for the full ownership rules.

## Setup

Use Node.js 22.12 or newer and npm. From the repository root:

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`). No environment variables are needed.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Vite locally |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run strict TypeScript checks |
| `npm test` | Run Vitest once |
| `npm run test:watch` | Watch tests |
| `npm run build` | Typecheck and build `dist/` |
| `npm run format` | Format code and configuration |
| `npm run format:check` | Check formatting |
| `npm run validate` | Run lint, typecheck, tests, and build |

## Architecture summary

The app lives in `src/app/`; reusable UI and the DataTable are in `src/components/`; CSS tokens and Heroicon exports are in `src/design/`; mock transport is in `src/core/api/`; test support is in `src/tests/`. Feature modules will be added when their behavior is implemented. See [architecture](docs/ARCHITECTURE.md).

## Testing

Foundation, DataTable core, rendered table, and expansion behavior are tested with Vitest and React Testing Library. Browser observations are recorded in [test and UAT](docs/TEST-UAT.md).

## Tradeoffs

Project decisions: [decision record](docs/DECISIONS.md). The core public contracts are in [DataTable contracts](docs/CONTRACTS.md).

## Live URL

None. Deployment is a later phase.

## Documentation

- [Requirements](docs/REQUIREMENTS.md)
- [Engineering laws](docs/LAWS.md)
- [Architecture](docs/ARCHITECTURE.md)
- [DataTable contracts](docs/CONTRACTS.md)
- [Test and UAT plan](docs/TEST-UAT.md)
- [Decisions](docs/DECISIONS.md)
- [Deployment plan](docs/DEPLOY.md)
