# Part 2 requirements traceability

**Authority:** Rezerv *Engineering Assessment (Frontend React_Next.js).pdf*, Part 2, pages 4–7. The Phase 0 brief adds locked project decisions. `R` IDs map to [acceptance checks](TEST-UAT.md). Checkboxes reflect implementation status; the assessment permits reasonable assumptions when documented in the README.

## Required by the assessment

- [x] **R01** Build a reusable, fully typed React/TypeScript DataTable from scratch, driven by column definitions, with no table/grid library. Mock JSON or mocked API calls suffice; no backend is required.
- [ ] **R02** Render a fitness studio class timetable as a self-contained SaaS dashboard view. Parent rows are classes; child rows are attendees. The component itself remains generic.
- [x] **R03** Provide columns with at least key/accessor, header label, custom cell render, sortable flag, width, and pinned flag. The project contract distinguishes column `id` from direct `accessorKey` and derived `accessor` (see [contracts](CONTRACTS.md)). The suggested class, instructor, time, attendance, and status columns may be adjusted.
- [x] **R04** Implement client-side sorting from header interaction with ascending, descending, and unsorted states.
- [x] **R05** Implement client-side pagination with page-size selection and page navigation over the full dataset.
- [ ] **R06** Support both expansion modes using attendee data in the class scenario: children supplied with a parent and children fetched on demand when expanded. Give the on-demand row its own loading and sensible fetch-error state.
- [ ] **R07** Render expanded content below its parent across the table width, with a smooth expand/collapse transition.
- [x] **R08** Keep at least one left column pinned during horizontal scrolling, with a shadow or divider when content scrolls beneath it.
- [ ] **R09** Show column-aligned skeleton rows while table data loads, plus loading, empty, and error states consistent with the dashboard.
- [ ] **R10** Demonstrate the same table on a second differently shaped dataset without hard-coding either data shape. The assessment asks that demo to showcase server-side/on-demand modes, despite labeling server-side sort and pagination as bonus features; see the priority note below.
- [x] **R11** Use React.js or Next.js and TypeScript. The locked project choice is React + strict TypeScript + Vite + Tailwind CSS + Heroicons through the design layer.

## Optional / Bonus in the assessment

- [ ] **R12** Server-side sorting: controlled sort changes emitted by the table; parent supplies sorted data.
- [ ] **R13** Server-side pagination: controlled page/size changes emitted by the table; parent supplies the page and total count.

**Priority note:** The Phase 0 brief requires controlled/manual support at the generic API level and a second server-style demo. Thus R12 and R13 remain *bonus in the assessment* but are *locked project deliverables* for this implementation. The demo may use a mocked API; a real backend is not required. See [contracts](CONTRACTS.md).

## Edge Cases

- [x] **R14** Handle empty parent data and empty child lists.
- [x] **R15** Handle failed initial data fetch and failed on-demand child fetch.
- [x] **R16** Show loading feedback for slow initial and child fetches.
- [x] **R17** Keep the left-pinned column usable on narrow/mobile viewports.
- [ ] **R18** Keep interactions smooth with a larger dataset, including sorting and scrolling.
- [x] **R19** Handle an invalid sort key (unknown `columnId` in the project contract) and an out-of-range page safely.

## UI / UX

- [ ] **R20** Use clean SaaS-style spacing and visual hierarchy.
- [ ] **R21** Provide hover states for rows and interactive headers, plus subtle sort and expand/collapse transitions.
- [ ] **R22** Adapt gracefully across desktop, tablet, and mobile; horizontal scrolling with a pinned column is an allowed approach.

## Performance

- [ ] **R23** Avoid laggy rendering, sorting, and scrolling on larger datasets. Use the page limit and measure before adding complexity.
- [ ] **R24** The locked v1 plan excludes a virtualization engine and speculative memoization; document any measured need for optimization.

## Accessibility

- [x] **R25** Use semantic table markup, keyboard focus and operation for interactive controls, and useful ARIA. The locked contract specifies `aria-sort`, `aria-expanded`, visible focus, and stable expanded-content IDs where needed.

## Deliverables

- [ ] **R26** Publish a publicly accessible GitHub repository for Part 2, separate from Part 1 under the locked project decision.
- [ ] **R27** Provide the class timetable view and a small second-dataset demo showcasing server-style and on-demand behavior.
- [ ] **R28** Complete the README with setup, component API and column definitions, client/server sorting and pagination strategy, both expansion modes, sticky-column approach, state management rationale, tradeoffs, and assumptions.
- [ ] **R29** Deploy the site to Vercel, Netlify, or equivalent and submit the live URL. The locked plan favors Vercel; Phase 0 performs no deployment.

## Locked project details that refine the assessment

The Phase 0 brief further fixes stable row IDs, the exact sort cycle and processing order, controlled-state integrity, page-reset behavior, row-local async states and caching, stale-request protection, and left-pinning only. Their behavioral source of truth is [contracts](CONTRACTS.md). Architecture and excluded technologies are governed by [laws](LAWS.md) and [architecture](ARCHITECTURE.md).

## Ambiguities and documented assumptions

1. **Suggested schema:** Class and attendee field examples are suggestions, not a fixed data contract. Later implementation may choose realistic fields and record them in the README.
2. **Server-style priority:** The assessment calls sorting/pagination server support bonus, yet its second-demo deliverable mentions server-side modes. The locked brief resolves this project by requiring controlled/manual API support and a mocked server-style demo, while preserving the assessment's bonus label above.
3. **Expansion transition:** The assessment asks for a smooth transition but gives no duration, easing, or reduced-motion policy. Choose subtle motion and honor reduced-motion preferences as a usability assumption.
4. **Failure/retry and cache:** The assessment requires sensible on-demand error handling but does not specify retries, cache lifetime, cancellation, or collapse-during-load semantics. The locked brief requires retry, default success caching, and stale-response protection; [contracts](CONTRACTS.md) records testable v1 semantics.
5. **Dataset/performance threshold:** The assessment says “large datasets” and “smooth” without a row count or numeric budget. The project uses a 5,000-parent-row manual stress fixture; record browser/device and page size when measuring it.
