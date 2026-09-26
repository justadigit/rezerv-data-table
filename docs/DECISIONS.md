# Engineering decisions

Decisions are project choices, not claims that the assessment mandates them. Behavioral detail belongs to [contracts](CONTRACTS.md).

| ID | Decision | Rationale |
| --- | --- | --- |
| D01 | React + strict TypeScript + Vite | Meets assessment React/TypeScript requirement with a small SPA toolchain. |
| D02 | Tailwind CSS and Heroicons through `design/` | Fits locked stack while keeping visual tokens and icons centralized. |
| D03 | Separate repositories for Part 1 and Part 2 | Preserves the assessment's two independent submissions. |
| D04 | Feature-based modules with root `components`, `design`, and `core`; no `shared/` | Keeps domain ownership clear and common resources discoverable. |
| D05 | One feature-root `index.ts`; no root feature/core or feature-child barrels | Gives each feature a narrow external API without broad implicit exports. |
| D06 | Exported `type` by default; no `I`/`T` model prefixes | Supports consistent strict typing; interfaces remain available for intentional semantics. |
| D07 | Generic DataTable in `components/`, outside features | Makes the two dataset demos use the same domain-independent API. |
| D08 | No global state library | Local and parent-owned state cover v1 interactions. |
| D09 | No virtualization engine in v1 | Pagination bounds rendered rows; profile before adding complexity. |
| D10 | Controlled/manual sort and pagination at the API level | Locked brief requires it, despite the assessment labeling server support bonus. |
| D11 | Mocked service for server-style demo | Assessment requires no backend; this proves controlled flow without infrastructure. |
| D12 | Vercel as planned deployment target | Practical choice under assessment allowance for Vercel, Netlify, or equivalent; deployment is later-phase work. |
| D13 | Normalize invalid client `pageIndex`; preserve controlled `pageIndex` | Uncontrolled state can recover locally, while a controlled value belongs to the parent. |
| D14 | npm with `package-lock.json` | Lockfile installs minimize reviewer setup. |
| D15 | React Router in `app/` | Reserves `/` and `/demo` without coupling routes to future feature internals. |
| D16 | Vitest + React Testing Library + user-event; defer Playwright | Covers foundation behavior with lightweight component tests; browser automation can be reconsidered later. |
| D17 | CSS custom properties are canonical design tokens | Tailwind maps to one runtime source for semantic visual values. |
| D18 | Heroicons exported only through `design/icons/` | Keeps approved icon names and imports centralized. |
| D19 | Deterministic, abortable mock transport in `core/api/` | Supports later feature services without domain data or random test outcomes. |
| D20 | Manual performance fixture of 5,000 parent rows | Provides a repeatable stress baseline without implying production capacity. |
| D21 | Numeric, `Intl.Collator`, and timestamp defaults; nullish last | Defines predictable v1 sorting while allowing column comparators for complex values. |
| D22 | Manual pagination requires manual sorting | A supplied server page cannot be correctly sorted as though it were the full dataset. |
| D23 | Explicit `expansionResetKey` for dataset changes | Row IDs alone cannot reveal whether a new source reuses semantic IDs; a caller-owned key gives cache invalidation a clear, small boundary. |
| D24 | Two labeled timetable sections over one class model | The locked expansion contract selects one mode per table. An inline schedule and smaller on-demand roster section demonstrate both modes without domain branching in DataTable. Query fixtures `?fixture=error` and `?fixture=empty` expose initial states without a developer control panel. |

Revisit a decision only when a concrete assessment or technical conflict is documented. Do not silently change the locked stack or boundaries.
