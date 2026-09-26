# Agent operating guide

Before changing code, read in this order: [README.md](README.md) → [requirements](docs/REQUIREMENTS.md) → [laws](docs/LAWS.md) → [architecture](docs/ARCHITECTURE.md) → [contracts](docs/CONTRACTS.md) → [test and UAT plan](docs/TEST-UAT.md) → [decisions](docs/DECISIONS.md). Read [deployment](docs/DEPLOY.md) for deployment work.

Use each document for its named concern. The supplied assessment is the product authority; the Phase 0 brief adds locked project decisions. Follow the architecture laws and the locked DataTable contract. If a request conflicts with the assessment or a locked contract, stop the conflicting implementation and report the conflict and proposed resolution. Report any necessary deviation from a law or contract explicitly; never apply it silently.

Keep changes scoped to the request. Do not add unrelated refactors or speculative abstractions. Add relevant tests for behavior changes, using [TEST-UAT.md](docs/TEST-UAT.md) as the acceptance map. Before declaring implementation complete, run lint, typecheck, tests, production build, and format check; report results and any unavailable gate.

Do not implement assessment features or deploy until the applicable later phase is requested.
