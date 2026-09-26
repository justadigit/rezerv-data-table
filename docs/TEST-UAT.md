# Test and user acceptance plan

The Phase 2 DataTable core has automated tests for value access, pure sorting and pagination, state ownership, processing order, and row identity. Phase 3 adds rendered-component tests and browser checks for the table UI. Phase 4 adds inline and on-demand expansion tests; Phase 5 adds class-timetable integration. Phase 6 adds second-dataset integration and local stress checks; public delivery is tracked separately below. `A` means automated component/integration test; `M` means manual browser review. IDs trace to [requirements](REQUIREMENTS.md); expected behavior comes from [contracts](CONTRACTS.md). Add only meaningful tests for behavior that is implemented.

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
| Inline empty | A | R14 | Empty child list shows the generic fallback by default or the optional feature-owned empty renderer, without hiding the parent. |
| On-demand loading | A | R06, R16 | Only selected row shows child loading while delayed request is pending. |
| On-demand success | A | R06 | Resolved children render in the selected row's detail area. |
| On-demand empty | A | R14 | Successful empty result shows the generic fallback by default or the optional feature-owned empty renderer; cached re-expansion does not refetch. |
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

The neutral fixture does not count as the class timetable or official second dataset. At the end of Phase 4, collapse still removed the detail row immediately; Phase 4.1 resolved this as recorded below.

## Phase 4.1 collapse transition verification (2026-09-26)

Automated: six focused regression tests cover immediate logical collapse and ARIA, a temporary closing row, removal on transition end, reduced-motion removal, rapid re-expansion and a second collapse, retained on-demand cache, collapse during loading, and focus returning to the toggle. All 60 tests pass, including the Phase 4 async suite.

Browser: Chromium on `/demo` at 1280 px, 768 px, and 390 px. With normal motion, the detail wrapper height decreased during collapse (60 px to about 21 px at 80–90 ms) and the semantic detail row was then removed. `aria-expanded` became false while the row was closing. Rapid expand/collapse/expand and collapse/expand/collapse sequences left one correctly owned detail row or none, with no stale cleanup or flicker observed. On-demand success retained its cached result; empty and error states closed, and retry still succeeded. A slow loading row closed without reopening when its request completed; later re-expansion used the cached result. The first pinned column and horizontal scroll remained usable at tablet and mobile widths; the detail content stayed within the visible scroll area. The 390 px document width remained 390 px.

Reduced-motion emulation disabled the detail animation and removed the row promptly on collapse. Browser console and page-error checks reported no warnings or errors. The wrapper animates inside a valid `<tr><td colSpan="...">` structure; parent pagination remains unchanged. R07 is complete.

## Phase 5 class timetable verification (2026-09-26)

Automated (A): four feature integration tests in `src/tests/class-timetable/classTimetable.test.tsx` cover initial loading and success, domain columns and status, attendance and status sorting, pagination and size change, inline attendee success/empty, initial error and retry, empty parents, and on-demand loading/success/empty/error/retry/cache reuse. The app route test now checks the real timetable and the retained internal preview. Total project suite: 63 passing tests.

Manual browser (M): Chromium on `/` at 1280 px, 768 px, and 390 px. At desktop, Class sorting changed the first visible classes; Next changed the page. Inline expansion showed five named attendees; an empty inline class showed the DataTable empty detail state. Live rosters showed row-local loading, fetched attendee cards, an empty result, a forced error, successful retry, and instant cached re-expansion. The initial skeleton was visible before the mock response. `/?fixture=error` showed the normalized initial error and Retry loaded classes; `/?fixture=empty` showed the empty table.

Responsive (M): the 1280 px table fit the content width. At 768 px and 390 px, the table width exceeded its scroll area while the document itself remained exactly the viewport width. The pinned Class header remained at the scroll container's left edge; at 390 px with horizontal scroll, the pinned class cells and expansion toggle stayed visible, and expanded attendee cards were readable. Pagination stayed within the viewport. Statuses and check-in states carried text. Keyboard Enter activated Class sorting and updated `aria-sort`; Space expanded a class; Enter advanced pagination and activated initial Retry; Home then ArrowDown changed the native page size to 10 and reset to page 1. Focused controls showed a 3 px outline. Browser warning/error logs were empty during these checks.

At the end of Phase 5, the DataTable expansion API handled zero-child results internally, before calling `renderChildren`, so both empty roster modes displayed generic “No details available” copy. Phase 5.1 resolves that limitation below. Reduced-motion behavior on the actual timetable remains for final UAT; the generic reduced-motion behavior was verified in Phases 3–4. The official second dataset, 5,000-row stress check, public repository, and deployment remain pending.

## Phase 5.1 expansion empty presentation verification (2026-09-26)

Automated (A): the existing generic inline and on-demand empty tests preserve the “No details available” fallback. Two focused DataTable tests cover custom inline and on-demand `renderEmpty`, typed row context, semantic detail structure and ARIA, successful empty caching, and the absence of Retry. The Class Timetable integration assertions now require attendee-specific copy for both inline and on-demand empty rosters and immediate cached re-expansion. Total suite: 65 passing tests.

Manual browser (M): desktop and mobile checks of the real Class Timetable confirmed attendee-specific copy in both sections. Boxing Basics retained that copy after collapse and re-expansion without showing another loading state. The detail remained in the existing full-width table row with the expander's `aria-controls` relationship intact. Console checks reported no errors. Phase 5's generic-copy limitation is resolved; the historical observation above records the prior state.

## Phase 6 final local verification (2026-09-26)

Automated (A): the User Directory tests cover server comparator mapping and invalid keys, controlled sort/page/size/reset behavior, table error/retry and empty state, activity success/empty/error/retry/cache, and stale-query protection. A class integration test covers the 5,000-row fixture, full-dataset sort, and parent pagination. The existing generic tests still cover two typed row/child pairs without source snapshots. The full clean-install run passed: 72 tests across eight files, lint, strict typecheck, build, format check, and `npm run validate`.

Manual (M): Chromium in the Codex in-app browser on a local Vite server, macOS, at 1280 px, 768 px, and 390 px. The User Directory displayed 72 parent records, controlled sort and page navigation, native page-size change by keyboard (10 to 20), initial error/retry, empty state, activity loading/success/empty/error/retry, and cached re-expansion. At tablet and mobile widths, the table scrolled horizontally while the pinned Name header stayed at the container's left edge. At 390 px, the document stayed 390 px wide, the table scrolled through its 1,090 px content, and pagination remained inside the viewport. Status labels were text as well as color. Header Enter activation updated `aria-sort`; the focused control showed a 3 px outline. The activity toggle used `aria-expanded` and a stable detail ID. No browser console or page errors were observed.

The Class Timetable final pass showed the initial skeleton, loaded rows, keyboard Class sorting and inline expansion, a valid `aria-controls` target, 3 px focus outline, error/retry, and empty parent state. The full class success/empty/error matrix and both expansion modes had already been exercised manually in Phase 5 and 5.1 as recorded above. At 1280/768/390 px, the document fit the viewport; at 768/390 px the 1,010 px table overflowed inside its scroll container and pagination stayed visible. Prior mobile checks confirmed the pinned Class column during horizontal scroll. Text labels conveyed status and check-in state.

Stress (M): `/?fixture=stress` generated 5,000 deterministic classes; five parents rendered on each of 1,000 pages. In Chromium on this macOS machine at 1280 px and 390 px, Class ascending/descending sort and Next page completed without obvious lag; descending page one began at Studio Session 5000 and page two at 4995. Mobile horizontal scroll reached the far edge while the pinned Class column stayed at the container edge, with no document overflow or console warnings. No profiler run was necessary because no visible bottleneck appeared. No numeric budget was claimed.

Reduced motion: the generic DataTable expansion and skeleton behavior was confirmed under reduced-motion emulation in Phases 3, 4, and 4.1. The final browser controller did not expose media-preference emulation, so a fresh reduced-motion run on each finished feature page remains unconfirmed. The same generic expansion and CSS paths are used on both pages; this is an inference from source and earlier browser checks, not a claimed final manual pass.

Public repository and production smoke checks remain open until publication and deployment actually succeed.
