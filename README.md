# Rezerv Frontend Engineering Assessment — Part 2

## Project overview

Phase 1 provides a runnable foundation for the Part 2 class timetable and reusable DataTable. The assessment features have not been implemented.

## Assessment scope

See [requirements](docs/REQUIREMENTS.md), traced to the original assessment and the Phase 0 brief.

## Technology stack

React, strict TypeScript, Vite, Tailwind CSS, React Router, and Heroicons through the design layer. Foundation tests use Vitest, React Testing Library, and user-event.

## Implemented features

Foundation only: route placeholders, centralized visual tokens and icons, four reusable UI primitives, and deterministic mock transport. The DataTable, class timetable, attendee views, and second dataset do not exist yet.

## Routes and demo pages

`/` is the future class timetable route; `/demo` is the future second-dataset route. Both currently render clearly labeled Phase 1 placeholders.

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
| `npm run test:watch` | Watch foundation tests |
| `npm run build` | Typecheck and build `dist/` |
| `npm run format` | Format code and configuration |
| `npm run format:check` | Check formatting |
| `npm run validate` | Run lint, typecheck, tests, and build |

## Architecture summary

The current app lives in `src/app/`; reusable UI is in `src/components/ui/`; CSS tokens and Heroicon exports are in `src/design/`; mock transport is in `src/core/api/`; test support is in `src/tests/`. Feature modules will be added when their behavior is implemented. See [architecture](docs/ARCHITECTURE.md).

## Testing

Foundation behavior is tested with Vitest, React Testing Library, and user-event. DataTable acceptance remains planned in [test and UAT](docs/TEST-UAT.md).

## Tradeoffs

Foundation decisions: [decision record](docs/DECISIONS.md). DataTable implementation tradeoffs remain open.

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
