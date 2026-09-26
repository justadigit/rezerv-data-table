# Rezerv Frontend Engineering Assessment — Part 2

## Project overview

Phase 5 implements the fitness studio Class Timetable with the existing generic DataTable. The official second dataset and deployment remain future work.

## Assessment scope

See [requirements](docs/REQUIREMENTS.md), traced to the original assessment and the Phase 0 brief.

## Technology stack

React, strict TypeScript, Vite, Tailwind CSS, React Router, and Heroicons through the design layer. Tests use Vitest, React Testing Library, and user-event.

## Implemented features

The generic DataTable provides semantic markup, sortable button headers, client and manual pagination controls, column-aligned loading skeletons, error/empty states, left-pinned columns, and horizontal scrolling. Inline expansion renders caller-supplied children; on-demand expansion has row-local loading, success, empty, error, retry, and default success caching. Expansion buttons are native keyboard controls with `aria-expanded` and stable detail IDs. The Class Timetable uses this public API without changing DataTable internals.

The timetable contains 28 deterministic classes: 20 with inline attendees and 8 with on-demand rosters. Its columns are Class (pinned), Instructor, Start time, Duration, Attendance, and Status. Relevant columns use client sorting, including a feature-owned status comparator; both sections use client pagination. Attendee details show names, email, membership, and text check-in state. Class, Attendee, and status types, fixtures, formatting, data access, and error normalization live in `src/features/class-timetable/`.

## Routes and demo pages

`/` is the Class Timetable. Its main **Class schedule** section demonstrates inline expansion and its smaller **Live rosters** section demonstrates on-demand expansion. The generic API accepts one expansion mode per table, so the two sections share the same class model and column definitions. `/demo` remains an internal neutral DataTable preview; it is not the official second dataset.

The initial class request has a 450 ms mock delay so the table skeleton is visible. Open `/?fixture=error` for a deterministic initial failure and use **Retry loading classes** to recover. Open `/?fixture=empty` for an empty parent table. The normal route shows success. In Live rosters, **Power Vinyasa** loads successfully, **Boxing Basics** has an empty roster, **Mobility Lab** fails once and succeeds on retry, and **HIIT Express** has a slower request. The generic DataTable owns empty-detail rendering, so empty rosters currently use its generic “No details available” message; the locked expansion API does not pass zero children to the feature renderer.

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

The app lives in `src/app/`; the timetable feature is in `src/features/class-timetable/`; reusable UI and the DataTable are in `src/components/`; CSS tokens and Heroicon exports are in `src/design/`; deterministic mock transport is in `src/core/api/`; tests are in `src/tests/`. The route imports only the feature root API. See [architecture](docs/ARCHITECTURE.md).

## Testing

Foundation, DataTable core, rendered table, expansion behavior, and timetable integration are tested with Vitest and React Testing Library. Browser observations are recorded in [test and UAT](docs/TEST-UAT.md).

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
