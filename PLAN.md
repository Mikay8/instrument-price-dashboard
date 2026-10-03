# Instrument Price Dashboard — Build Plan

## Goal
Full-stack app (C#/.NET backend + React frontend) that lets a user browse 200 instruments, chart 30-day prices, see computed stats, and overlay 2-3 tickers for comparison.

## Scope decisions
- [ ] Charting library: Recharts
- [ ] State management: useState/Context 
- [ ] HTTP client: fetch 
- [ ] Styling: Tailwind CSS 
- [ ] Out of scope for this exercise: auth, persistence/database, multi-user support, deployment

---

## Phase 0: Setup & Spec Confirmation 
- [x] Review provided CSV — confirm columns (date, ticker, price), spot-check a few rows
- [x] Scaffold backend: `dotnet new webapi`
- [x] Scaffold frontend: Vite + React + TypeScript
- [x] Confirm API contract matches spec exactly:
  - `GET /api/instruments` → list of 200 tickers
  - `GET /api/prices/{ticker}` → full 30-day series, 404 if unknown
  - `GET /api/prices/{ticker}/stats` → total return %, daily volatility, max drawdown
- [x] Set up CORS on backend so local frontend can call it

## Phase 1: Backend (C#)
- [x] Load CSV into memory on startup (simple in-memory store/dictionary keyed by ticker)
- [x] Implement `/api/instruments`
- [ ] Implement `/api/prices/{ticker}` with 404 handling for unknown ticker
- [ ] Implement stats calculations — **verify math by hand**
  - Total return % = (last price / first price − 1) × 100
  - Daily volatility = stdev of **daily returns** (day-over-day % change), not stdev of raw prices
  - Max drawdown = largest peak-to-trough decline (running max vs. current price), not just max − min
- [ ] Unit tests (xUnit) on the three stats calculations — this is the correctness-critical part
- [ ] Input validation on `{ticker}` route param (reject malformed/empty input cleanly)
- [x] **Perf:** compute stats once at CSV load (or memoize per-ticker on first request) — don't recalculate stdev/drawdown on every `/stats` call.
- [x] **Perf:** don't make `/prices/{ticker}` and `/prices/{ticker}/stats` each re-walk the full series independently if avoidable — share the loaded series.

## Phase 2: Frontend Core 
- [ ] Ticker list/search view — search-as-you-type, no fuzzy matching needed
  - [ ] Virtualize the list (react-window or similar) — 200 items, show perf awareness
  - [ ] Debounce the search input
  - [ ] Fetch the 200-ticker list once, filter client-side on search (don't re-query backend per keystroke)
- [ ] Ticker selection → fetch + render price line chart
  - [ ] `useMemo` on chart data transforms so ticker switches don't reprocess unchanged data
  - [ ] `AbortController` to cancel in-flight requests when the user picks a new ticker before the prior one resolves (prevents stale-response race conditions)
  - [ ] Lazy-load the charting library if it's heavy, so it doesn't block initial render
- [ ] Display computed stats alongside chart
- [ ] Multi-select 2-3 tickers → overlay on single chart
  - [ ] Distinguishable colors + legend
- [ ] Loading states (skeletons, not bare spinners)
- [ ] Error states (API unreachable, unknown ticker) with retry affordance

## Phase 3: Polish & Differentiators 
- [ ] Component tests (Vitest + RTL) on trickiest logic — multi-select overlay behavior, loading/error states (3-5 tests, not full coverage)
- [ ] Optional: one or two Playwright smoke tests (search → select → see chart) — only if time allows, not a blocker
- [ ] Visual pass: spacing, typography, empty states, responsive check
- [ ] Optional: quick wireframe/screenshot added to README showing design intent

## Phase 4: README & Submission 
- [ ] Setup/run instructions (backend + frontend, ports, any env steps)
- [ ] Design decisions section — written like a product decision log: what you chose and why, tradeoffs made
- [ ] AI usage note — specific, not generic (what AI helped scaffold, what you reviewed/corrected by hand, e.g. catching an incorrect drawdown formula)
- [ ] Security considerations (production) — brief: JWT for auth, RBAC if multi-user, rate limiting on stats endpoint — note this is out of scope for the local exercise but here's how you'd approach it
- [ ] Scaling note — how this would change at real scale ( cache layer, pagination/streaming instead of loading all 200 series client-side, WebSocket/polling for live updates if prices were real-time)
- [ ] Known limitations / what you'd do with more time
- [ ] Clean `.gitignore` — no secrets/config committed
- [ ] Final run-through on a clean clone to make sure it actually works end to end

---

-
