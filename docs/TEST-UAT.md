# Test and user acceptance plan

The Phase 2 DataTable core has automated tests for value access, pure sorting and pagination, state ownership, processing order, and row identity. Phase 3 adds rendered-component tests and browser checks for the table UI. Phase 4 adds inline and on-demand expansion tests plus browser checks; feature, stress, and deployment checks remain pending. `A` means automated component/integration test; `M` means manual browser review. IDs trace to [requirements](REQUIREMENTS.md); expected behavior comes from [contracts](CONTRACTS.md). Add only meaningful tests for behavior that is implemented.

Core coverage lives in `src/tests/data-table/`. The tests cover sorting before pagination plus rendered header buttons and ARIA, value and cell rendering, table states, pagination, controlled proposals, keyboard activation, and static pin offsets. jsdom does not prove real browser sticky behavior; expansion is covered separately in `expansion.test.tsx`.

| Check | Mode | Requirement | Acceptance result |
| --- | --- | --- | --- |
| Source and API | A | R01, R03, R11 | Strict typecheck accepts two different parent/child shapes, direct `accessorKey`, and derived `accessor` columns whose `id` is not a row property; no table library or feature-model import exists. |
| Class timetable | M | R02, R06, R20, R27 | Class rows and attendee details form a coherent SaaS dashboard; attendee data exercises both expansion modes and suggested schema changes are documented. |
| Sort first click | A | R04 | None → ascending, with `aria-sort=ascending`. |
| Sort second click | A | R04 | Ascending → descending. |
| Sort third click | A | R04 | Descending → none and original stable ordering returns. |
| Different column | A | R04 | Clicking another sortable header starts ascending on that column. |
| Invalid column ID | A | R19 | Unknown current `columnId` does not throw; client rows remain safely ordered. |
| Non-sortable column | A | R03, R19 | Click or proposed sort on non-sortable column does not change sort. |
| Sort before page | A | R04, R05 | Dataset chosen so the first sorted page differs from sorting only the initial slice; result uses full-dataset sort. |
| Page navigation | A | R05 | Next/previous change zero-based `pageIndex` across the full client dataset and disable at boundaries. |
| Page size | A | R05 | New size changes visible count and resets `pageIndex` to `0`. |
| Sort reset | A | R04, R05 | Sort change resets `pageIndex` to `0`. |
| Out-of-range page | A | R19 | Client `pageIndex` normalizes to a valid index; controlled parent value is unchanged. |
| Controlled sort | A | R12 | Table emits a proposed `columnId` state using the column `id`; old visual direction stays until parent supplies new value; incoming data is not sorted again. |
| Controlled pagination | A | R13 | Page/size callbacks emit `pageIndex`/`pageSize` proposals and reset proposals use index `0`; supplied index and total govern controls without double slicing. A one-based mock API receives conversion at the service boundary only. |
| Inline expansion | A | R06, R07 | Toggle reveals then hides a full-width child area under the correct parent. |
| Inline empty | A | R14 | Empty child list shows expansion empty state without hiding the parent. |
| On-demand loading | A | R06, R16 | Only selected row shows child loading while delayed request is pending. |
| On-demand success | A | R06 | Resolved children render in the selected row's detail area. |
| On-demand empty | A | R14 | Successful empty result shows the expansion empty state. |
| On-demand error/retry | A | R15 | Failure shows row-local error and retry; retry can succeed. |
| Cache reuse | A | R06 | Collapse/re-expand after success or empty success does not refetch by default. |
| Collapse during request | A | R06 | A response after collapse never reopens the row; safe cache behavior follows contract. |
| Stale response | A | R06 | Older request or old dataset response cannot replace newer row state. |
| Initial loading | A + M | R09, R16 | Delayed initial data shows skeleton cells aligned to configured columns, including widths/pinning. |
| Initial error | A | R09, R15 | Failed initial fetch shows explicit table error, not empty state. |
| Empty parents | A | R09, R14 | Zero rows after completed load show table empty state. |
| State precedence | A | R09 | Loading, then error, then empty, then success precedence is respected. |
| Pinned desktop | M | R08 | Left column stays fixed during horizontal scroll; header/body alignment and z-index are correct. |
| Pinned tablet | M | R17, R22 | Same behavior at tablet width with no clipped controls. |
| Pinned mobile | M | R17, R22 | Narrow viewport can scroll horizontally; pinned content remains readable. |
| Pin cue | M | R08 | Shadow/divider is visible when content passes beneath the pinned boundary. |
| Hover/motion | M | R07, R21 | Row/header hover and subtle sort/expansion transitions work without layout breakage; reduced-motion setting is respected. |
| Keyboard sort | A + M | R25 | Tab reaches header button; Enter/Space cycles sort; focus indicator is visible. |
| Keyboard expansion | A + M | R25 | Tab reaches row toggle; Enter/Space opens/closes it; focus indicator is visible. |
| ARIA | A | R25 | `aria-sort`, `aria-expanded`, and stable expanded-content relationship reflect rendered state. |
| Semantic markup | A | R25 | Table, header, body, rows, and cells remain valid through all states. |
| Larger dataset | M | R18, R23, R24 | Use 5,000 parent rows; record browser/device, page size, sort/scroll observations, and profiler findings if needed. No obvious lag or unnecessary rendering regression. |
| Second dataset | A + M | R10, R27 | Different row and child shapes work without changing DataTable internals; mocked server-style sort/page and on-demand fetch visibly work. |
| Documentation | M | R26, R28, R29 | Before submission, verify public repository, complete README, live site URL, and deployed smoke test. |

## Manual UAT sequence

1. Open the timetable at desktop, tablet, and narrow widths. Trigger initial loading, empty, and initial-error fixtures; inspect skeleton alignment and state copy.
2. Sort each applicable column through all states, navigate pages, change page size, and verify pinning while horizontally scrolling.
3. Open inline and on-demand attendee rows. Exercise slow success, empty result, failure and retry, then collapse during a request.
4. Repeat key controls with keyboard only and a visible focus indicator. Inspect ARIA state in browser accessibility tools.
5. Open the second dataset demo, exercise parent-owned sort/`pageIndex`/`pageSize` updates and on-demand children, and confirm no generic-table code is dataset-specific.
6. Before release, run lint, strict typecheck, automated tests, and production build; then smoke-test the deployed URL.

The assessment does not set a numeric performance budget. The 5,000-row fixture is a representative project stress check, not a production capacity claim; record the test environment before judging it.

## Phase 3 verification (2026-09-26)

Automated: nine rendered DataTable tests in `src/tests/data-table/rendering.test.tsx` pass for semantics, cells, sorting, state precedence, pagination, controlled manual mode, keyboard activation, and pin offsets/diagnostics. The existing foundation route test now checks the temporary preview.

Browser: Chromium through agent-browser on the local Vite `/demo` route. Desktop (1280 px): table, sort, page navigation, loading skeleton, error, and empty views rendered; horizontal scroll moved while the two pinned headers stayed at fixed x positions. Tablet (768 px): scroll area was wider than its container, first pinned header remained at container edge, and pagination stayed inside the viewport. Mobile (390 px): document width remained 390 px, table area scrolled horizontally, two pinned headers stayed at fixed offsets, the boundary cue appeared after scrolling, and pagination wrapped within the card. The narrow preview leaves a limited strip for unpinned content, so users scroll that content horizontally.

Keyboard: Tab reached sortable buttons with a visible solid focus outline; Enter and Space activated sorting and updated `aria-sort`. Tab reached the native page-size select and pagination buttons. The native select was exercised by the automated interaction test; the browser CLI's ArrowDown sequence did not change its value, so manual keyboard selection remains unconfirmed. Reduced-motion emulation disabled skeleton animation. Browser console and page-error checks reported no errors.

These Phase 3 observations use neutral preview rows and do not complete the class timetable, real second dataset, expansion, 5,000-row stress, or deployed-site checks.

## Phase 4 verification (2026-09-26)

Automated: 14 expansion tests in `src/tests/data-table/expansion.test.tsx` pass. They cover inline detail and empty content, stable RowId behavior through sorting/pagination, semantic detail rows and ARIA, native keyboard activation, row-local loading, success and empty caching, retry, concurrent requests, collapse during load, stale older success/error, reset-key invalidation, abort, and unmount cleanup. Total suite: 54 passing tests.

Browser: Chromium on local `/demo` at 1280 px, 768 px, and 390 px. Inline mode expanded two rows at once, including an empty child result; the detail cell spanned six data columns and `aria-controls` resolved to its content ID. On-demand mode showed two concurrent loading rows, then both successes; cached re-expansion displayed immediately. Empty, failure, retry, and collapse during a slow load were exercised. Retry succeeded after the offscreen button was scrolled into view in the browser tool. Sorting and page navigation hid off-page detail rows and restored the cached detail with its parent; no orphan detail rows appeared.

Pinned and responsive: the expander remained in the first pinned cell. At tablet and mobile widths, horizontal scrolling kept pinned headers in place; the detail content remained within the visible scroll area, including at 390 px after a 350 px horizontal scroll. Document width did not exceed the mobile viewport. Keyboard Tab reached the expander with a visible focus outline; Enter and Space changed `aria-expanded`; `aria-controls` pointed to the rendered detail content. Reduced-motion emulation disabled the detail animation. Browser page-error and console checks showed no errors.

The neutral fixture does not count as the class timetable or official second dataset. The CSS provides a short entrance transition and rotating indicator; collapse removes the detail row immediately to preserve simple table semantics. The assessment's full smooth expand/collapse acceptance item remains pending.
