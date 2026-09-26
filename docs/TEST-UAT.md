# Test and user acceptance plan

The Phase 2 DataTable core has automated tests for value access, pure sorting and pagination, state ownership, processing order, and row identity. UI interaction and manual browser checks below remain pending. `A` means automated component/integration test; `M` means manual browser review. IDs trace to [requirements](REQUIREMENTS.md); expected behavior comes from [contracts](CONTRACTS.md). Add only meaningful tests for behavior that is implemented.

Core coverage lives in `src/tests/data-table/`. The tests prove the underlying state transitions and processing, including sorting before pagination; they do not claim that header clicks, controls, ARIA, expansion, or visual states are implemented.

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
