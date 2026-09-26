# Rezerv Frontend Engineering Assessment — Part 2

## Project overview

Phase 3 adds a rendered, domain-independent DataTable on top of the Phase 2 core. The assessment features remain future work.

## Assessment scope

See [requirements](docs/REQUIREMENTS.md), traced to the original assessment and the Phase 0 brief.

## Technology stack

React, strict TypeScript, Vite, Tailwind CSS, React Router, and Heroicons through the design layer. Tests use Vitest, React Testing Library, and user-event.

## Implemented features

Foundation plus the generic DataTable core and rendered component: semantic table markup, sortable button headers, client and manual pagination controls, column-aligned loading skeletons, generic error/empty states, multiple left-pinned columns, horizontal scrolling, and keyboard/ARIA foundations. Expansion, the class timetable, attendee views, and the official second dataset are not implemented yet.

## Routes and demo pages

`/` is the future class timetable route and remains a foundation placeholder. `/demo` contains temporary neutral rows for Phase 3 visual checks; it is not the official second dataset demo.

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

Foundation, DataTable core, and rendered table behavior are tested with Vitest and React Testing Library. Browser observations are recorded in [test and UAT](docs/TEST-UAT.md).

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
