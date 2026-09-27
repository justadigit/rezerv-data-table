# Rezerv Frontend Engineering Assessment — Part 2

A typed, reusable DataTable presented in two dashboard views. [Live application](https://rezerv-data-table.pyllord.com) · [Public source repository](https://github.com/justadigit/rezerv-data-table). Review the Class Timetable at `/` for client sorting, pagination, pinned columns, and both expansion modes; open `/demo` for the User Directory, which uses the same table with parent-owned sorting and pagination against a mocked server. No backend or environment variables are required.

## Routes and fixtures

| Route | View | What it demonstrates |
| --- | --- | --- |
| `/` | Class Timetable | Class and attendee data, client processing, inline attendee details, on-demand rosters |
| `/demo` | User Directory | Different parent and child types, controlled/manual server-style sort and pagination, on-demand activity |

For UAT, `/?fixture=error`, `/?fixture=empty`, and `/demo?fixture=error|empty|slow` expose deterministic request states. `/?fixture=stress` selects 5,000 deterministic class rows without changing table state or the normal reviewer view. Retry recovers the error fixtures. In Live rosters, Power Vinyasa succeeds, Boxing Basics is empty, and Mobility Lab fails once before retry succeeds. In the User Directory, the first three users exercise the same activity outcomes.

## Stack and setup

React 19, strict TypeScript, Vite, Tailwind CSS, React Router, and Heroicons via the design layer. Tests use Vitest, React Testing Library, and user-event. Use Node.js 22.12 or newer and npm:

```bash
npm ci
npm run dev
```

Open the URL printed by Vite, usually `http://localhost:5173`.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local Vite server |
| `npm run lint` | ESLint |
| `npm run typecheck` | Strict TypeScript check |
| `npm test` | Automated suite |
| `npm run build` | Typecheck and production build |
| `npm run format:check` | Prettier check |
| `npm run validate` | Lint, typecheck, test, build |

## DataTable API and behavior

`DataTable<TRow, TChild>` accepts typed `ColumnDef<TRow>[]`, `data`, and a stable `getRowId`. Every column has an `id` and header. `accessorKey` reads a row property; `accessor` derives a value; `cell` renders custom content. A column may define sorting, width, and left pinning. The class and user features provide their own formatting and child renderers; the table contains no domain models.

Client mode sorts the full dataset stably, then slices the requested page. Header clicks cycle unsorted → ascending → descending → unsorted. The Class Timetable uses this mode. In controlled/manual mode the table emits sort and pagination proposals and renders the supplied server page without sorting or slicing it again. The User Directory hook owns `SortingState` and zero-based `PaginationState`; its service maps allowed column IDs to comparators, sorts the full 72-user fixture, and returns `{ items, totalCount }`. It converts `pageIndex + 1` at the request boundary, resets to page 1 on sort or size changes, and aborts stale requests.

Expansion supports inline `getChildren` and on-demand `loadChildren(row, signal)`. Both use typed `renderChildren` and may supply `renderEmpty` for successful zero-child results. On-demand rows have local loading, error, and retry states; successful results are cached by stable row ID. Aborted or superseded responses cannot replace current state. The Class Timetable uses both modes; the User Directory uses on-demand activity. The first data cell contains the expansion toggle, and detail rows span the table width.

Left-pinned cells use cumulative width offsets, opaque backgrounds, and a boundary shadow. Tables scroll horizontally at narrow widths. Sorting, pagination, and expansion state are local to each table or its owning feature hook; a global state library would add no useful coordination here.

## Accessibility, testing, and performance

The table uses semantic markup, native buttons and page-size selects, keyboard operation, visible focus, `aria-sort`, `aria-expanded`, stable `aria-controls`, text status labels, and reduced-motion styling. The automated suite covers generic behavior and both feature integrations. [Test and UAT](docs/TEST-UAT.md) records browser observations and any verification limits.

The optional `/?fixture=stress` dataset exercises 5,000 parent rows with the regular page size of five. In local Chromium at desktop and narrow widths, full-dataset sorting, pagination, and horizontal scrolling remained responsive with only five parent rows rendered per page. No virtualization or speculative memoization was needed. This is a manual stress observation, not a numeric performance guarantee.

## Architecture and tradeoffs

`src/app/` owns routing; `src/features/class-timetable/` and `src/features/users-demo/` own domain UI, hooks, services, and fixtures; `src/components/data-table/` owns generic mechanics; `src/design/` owns tokens and icons; `src/core/api/` owns mock transport. Each feature exposes one root entry point. See [architecture](docs/ARCHITECTURE.md), [contracts](docs/CONTRACTS.md), [requirements](docs/REQUIREMENTS.md), and [decisions](docs/DECISIONS.md).

The mocked service demonstrates server-style ownership without a backend. The class view has separate inline and on-demand tables because the public expansion configuration selects one mode per table. Pagination bounds rendering rather than introducing virtualization. Dates and fixtures are deterministic to keep review and tests repeatable.
