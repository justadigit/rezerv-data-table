# Architecture

This document owns project structure and dependency boundaries. [Contracts](CONTRACTS.md) owns DataTable behavior; [laws](LAWS.md) makes the boundaries enforceable.

## Structure

```text
src/
├── app/          # routing, application composition, layouts
├── features/     # domain capabilities, each with one root index.ts
├── components/   # generic DataTable and reusable UI primitives
├── design/       # icons, tokens, colors, type, styles, motion, theme if needed
├── core/         # application infrastructure, types, helpers, transport, config
└── tests/        # shared test support and cross-cutting tests
```

This is the implemented responsibility map. Both `class-timetable` and `users-demo` live in `features/`. There is no `shared/` folder.

## Ownership and dependency direction

| Owner | May consume | Must not consume |
| --- | --- | --- |
| `app` | Feature root APIs; generic components; design; core | Feature private files |
| `features/<name>` | Its own files; generic components; design; core | Another feature's private files; `app` |
| `components` | Generic components; design; core | `features`; `app`; domain models |
| `design` | Its own resources; narrowly needed platform types | `features`; `app`; domain components |
| `core` | Its own infrastructure and platform dependencies | `features`; `app`; rendered components |
| `tests` | Tested public surfaces and test utilities | Production code must not import from `tests` |

Avoid cycles even when an import is otherwise allowed. `components/ui` holds domain-agnostic Button, Input, Badge, Skeleton, EmptyState, ErrorState, Tooltip, or Modal only when a real use needs them. The generic DataTable belongs under `components/`, outside features. The design icon layer wraps Heroicons; components and features consume that layer. `core` owns common labels and transport infrastructure, while domain-specific copy and mapping remain in a feature.

## Feature public APIs

Each feature exposes exactly one `features/<name>/index.ts`. There is no root `features/index.ts` or `core/index.ts`, and no child barrels in `pages/`, `components/`, `hooks/`, or `services/`. External consumers use the feature root API. Inside a feature, use direct relative imports where appropriate. Export only stable capabilities required outside the feature.

An illustrative feature may contain `pages/`, `components/`, `hooks/`, `services/`, and directly owned `.type.ts`, `.constant.ts`, `.helper.ts`, or `.mock.ts` files. Only create a folder or file when the feature actually needs it.

## Responsibility flow

`Route → Page → Component → Hook → Service → Mock API` describes the preferred ownership path. A route selects a page; a page composes UI and behavior; components render; hooks coordinate UI state and derived feature behavior; services own feature-specific data access and mapping; mock APIs simulate boundary responses where needed. Pages do not contain transport logic, sorting algorithms, or complex business logic. The generic table owns its generic data processing and expansion mechanics, as specified in [contracts](CONTRACTS.md).
