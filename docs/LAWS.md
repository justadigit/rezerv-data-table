> [!IMPORTANT]
>
> ### 🏛️ The Foundation Creed
>
> **"Clarity before cleverness. Precision before haste. Simplicity without weakness. Strength without spectacle."**

# Engineering laws

## LAW-01 — Architecture boundaries

### Law Description

Place code in the owning `app`, `features`, `components`, `design`, `core`, or `tests` area.

### Law Detail

Use the responsibilities and import map in [architecture](ARCHITECTURE.md). Do not create a `shared/` area or place domain logic in common areas. Add folders only when they have real content.

## LAW-02 — Feature ownership

### Law Description

A feature owns its domain pages, components, hooks, services, types, constants, helpers, and mock data.

### Law Detail

Domain calculations, mapping, copy, and service behavior stay in that feature. Common resources may be centralized only when domain independent. Cross-feature use must go through the owning feature's public API, or be deliberately moved to a genuinely generic area.

## LAW-03 — Public entry points

### Law Description

Each feature has exactly one root `index.ts`, and neither `features/` nor `core/` has a root barrel.

### Law Detail

Feature child folders (`pages`, `components`, `hooks`, `services`) have no barrel `index.ts`. External consumers import a feature through its root API; internal code may use direct relative imports. This prevents accidental coupling to feature internals.

## LAW-04 — Dependency direction

### Law Description

Dependencies follow the ownership direction defined in [architecture](ARCHITECTURE.md).

### Law Detail

Common `components`, `design`, and `core` never import from `features` or `app`. Features do not import another feature's internals. Pages compose behavior; transport, sorting algorithms, and complex business logic belong in hooks, services, or generic table internals as appropriate.

## LAW-05 — One source of truth

### Law Description

Keep each common policy or reusable value in one canonical owner.

### Law Detail

Centralize global labels, pagination copy, generic helpers, API transport, and app configuration only when truly common. Do not duplicate canonical values across features or move feature-specific knowledge to `core` for convenience.

## LAW-06 — Design ownership

### Law Description

The design area owns canonical tokens, icons, and visual system policy.

### Law Detail

Colors, spacing, radii, typography, shadows, and similar values have one source. Heroicons are accessed through the centralized icon layer. Reusable `components/ui` primitives remain domain agnostic. Do not maintain competing token definitions.

## LAW-07 — TypeScript contracts

### Law Description

Use strict TypeScript and exported `type` declarations by default, without `I` or `T` name prefixes.

### Law Detail

Choose `interface` only for deliberate interface semantics such as declaration merging or a documented extensibility contract. Generic parameter names like `TRow` and `TChild` are allowed because they identify type parameters, not exported model prefixes. Do not weaken strict checking to bypass errors.

## LAW-08 — Generic table independence

### Law Description

The reusable DataTable must not depend on a feature or domain model.

### Law Detail

Its generic API and behavior are owned by `components/`; feature-owned renderers and data adapters supply domain content. It must never import Class, Attendee, User, Instructor, PaymentType, or feature-specific models. See [contracts](CONTRACTS.md).

## LAW-09 — Stable identity

### Law Description

Every DataTable row must have a stable ID supplied by `getRowId`.

### Law Detail

Do not use array positions as IDs or expansion/cache keys. The caller must provide IDs unique within the active dataset, including across pages when server-style data is used.

## LAW-10 — Controlled state integrity

### Law Description

The table may request controlled state changes but must render the parent's current values until the parent updates them.

### Law Detail

Do not silently overwrite controlled sorting or pagination. Client/uncontrolled normalization may clamp invalid pages. Detailed transition rules belong to [contracts](CONTRACTS.md).

## LAW-11 — Behavioral verification

### Law Description

Behavior changes require relevant automated tests and manual checks where visual or interaction behavior cannot be automated reliably.

### Law Detail

Map new behavior to [test and UAT](TEST-UAT.md). Run lint, typecheck, tests, and build before declaring implementation complete, and report unavailable gates. Do not add mirror tests that merely restate implementation internals.

## LAW-12 — Scope discipline

### Law Description

Implement only assessed or explicitly requested behavior, with no speculative dependencies or abstractions.

### Law Detail

Do not add the excluded v1 features or global state libraries listed in [requirements](REQUIREMENTS.md). Profile before optimization. Record justified contract changes before implementation; stop and report direct conflicts with assessment requirements or locked contracts.
