# Instrument Price Dashboard

A full-stack app for browsing 200 financial instruments, charting their 30-day price history, viewing computed stats, and overlaying 2–3 tickers for comparison.

- **Backend:** C# / ASP.NET Core Web API. It loads `market_data.csv` into memory at startup and serves prices and stats.
- **Frontend:** React + TypeScript (Vite), Tailwind CSS, and Recharts for charts.

## Features

- **Instrument list:** all 200 tickers, each showing its last price and 30-day change. It's virtualized, and search filters the list as you type.
- **Price chart:** pick a ticker to see its 30-day price chart, with a hover tooltip and a tag showing the last price.
- **Stats:** total return %, daily volatility (σ) and max drawdown for the selected ticker.
- **Compare:** tick or shift-click up to 3 tickers to overlay them on one chart.
  - The chart switches to **% change since the first day**, so tickers with different prices share one axis.
  - The stats become a comparison table.
- **Loading and errors:** placeholder blocks while data loads, and an error message with a retry button for each failed request.

## Running locally

### Prerequisites

- [.NET SDK](https://dotnet.microsoft.com/download) 6.0 or later. The projects target `net6.0` and are set to run on a newer runtime (8, 9, …) if .NET 6 isn't installed.
- [Node.js](https://nodejs.org/) 20 or later (with npm).

Start the backend and the frontend in separate terminals.

### 1. Backend (http://localhost:5080)

```bash
cd backend
dotnet run --project InstrumentPrices.Api
```

When the startup log says `Loaded 200 instruments from market data`, the API is ready. Swagger UI is at http://localhost:5080/swagger.

> The API uses port **5080**, not 5000, because macOS AirPlay Receiver listens on port 5000 and answers with 403.

### 2. Frontend (http://localhost:5173)

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173.

**Configuration:** no environment setup is needed. Two optional settings:
- **API URL:** the frontend calls `http://localhost:5080` by default. To change it, `cp .env.example .env` and edit `VITE_API_BASE_URL`.
- **CORS:** the backend only accepts requests from `http://localhost:5173`. If you serve the frontend from another origin, add it to `Cors:AllowedOrigins` in `backend/InstrumentPrices.Api/appsettings.json`.

### Running tests

```bash
# Backend: 34 xUnit tests (stats math, CSV parsing, API endpoints)
cd backend
dotnet test

# Frontend: 27 Vitest tests (helpers + App component tests)
cd frontend
npm test -- --run      # plain `npm test` starts watch mode
npm run lint
npm run build          # type-checks and builds for production
```

## API

| Endpoint | Returns |
| --- | --- |
| `GET /api/instruments` | All 200 instruments, sorted by ticker: `[{ ticker, lastPrice, totalReturnPercent }]` |
| `GET /api/prices/{ticker}` | `{ ticker, prices: [{ date, price }] }`, the full 30-day series, oldest first |
| `GET /api/prices/{ticker}/stats` | `{ ticker, startDate, endDate, totalReturnPercent, dailyVolatilityPercent, maxDrawdownPercent }` |

- **Ticker lookup ignores case.** Responses always use the ticker as written in the CSV.
- **A malformed ticker returns `400`.** A valid ticker is 1–16 letters, digits, `.` or `-`.
- **An unknown ticker returns `404`.**
- **Error format:** both errors use the standard JSON `ProblemDetails` body (`application/problem+json`).
- **Stat definitions:**
  - **Total return:** `(last ÷ first − 1) × 100`.
  - **Daily volatility:** the sample standard deviation (n − 1) of day-over-day returns, × 100.
  - **Max drawdown:** the largest fall from a running peak to a later low, × 100. It's reported as zero or negative, so `−13.38` means a 13.38% drop.

## Data

`market_data.csv` has the columns `date,ticker,price`: 200 tickers × 30 trading days (2026-06-23 to 2026-08-03), 6,000 rows. It lives at the repo root, and the backend build copies it next to the API binary. The parser checks every row and stops the app from starting if any row is malformed.

## Project structure

```
.
├── market_data.csv
├── backend/
│   ├── InstrumentPrices.sln
│   ├── InstrumentPrices.Api/
│   │   ├── Controllers/       # /api/instruments, /api/prices/{ticker}[/stats]
│   │   ├── Models/            # domain records + response shapes
│   │   ├── Services/          # CSV parser, in-memory store, StatsCalculator
│   │   └── Json/              # DateOnly JSON converter (.NET 6)
│   └── InstrumentPrices.Tests/
└── frontend/
    └── src/
        ├── api/               # fetch client, ApiError
        ├── components/        # chart/, instruments/, stats/, layout/, ui/
        ├── hooks/             # useInstruments, useTickersData, useDebouncedValue
        ├── lib/               # pure logic: selection, chart rows, filtering, formatting
        ├── styles/            # theme.css (design tokens) + theme.ts (same tokens for JS)
        ├── test/              # test setup + fake API
        └── types/             # API response types
```

## Design decisions

Each decision gives what was chosen, why, and what it costs.

### Backend

**All data in memory, with stats calculated once at startup.**
- **Why:** the data is a fixed 6,000-row CSV, so a database would add nothing. The store builds each ticker's series, its stats and the sorted list summary when it loads, so every request is just a lookup. The prices and stats endpoints share the same loaded series.
- **Cost:** the data can only change by restarting the app. See [Scaling](#scaling) for how this would change.

**The app refuses to start on bad data.**
- **Why:** a missing or malformed CSV stops startup with the line number that failed (for example `Line 4213: invalid price 'abc'`). Silently skipping a row would quietly produce wrong stats.
- **Cost:** none in practice.

**`/api/instruments` returns summaries, not just ticker strings.**
- **Why:**
  - The spec says "list of 200 tickers". I returned `{ ticker, lastPrice, totalReturnPercent }` so the sidebar can show LAST and 30D for every row from the first request.
  - The alternatives were one request per visible row (about 40 requests on first load, plus extra logic for scrolling) or a separate summary endpoint.
  - The extra values are already calculated, so this costs the server nothing.
- **Cost:**
  - It's a deliberate change to the spec's contract.
  - The response grows from about 2 KB to about 16 KB.

**Keep `/prices` and `/stats` as separate endpoints.**
- **Why:** this matches the spec. The frontend requests both at once, so there's no extra wait.
- **Cost:** two requests per ticker instead of one.

**Separate errors for a malformed ticker (400) and an unknown one (404).**
- **Why:** the client gets a precise message, and junk input never reaches the lookup.
- **Cost:** a regex to keep in sync if ticker formats change.

**Volatility uses the sample standard deviation (n − 1).**
- **Why:** 30 days is a sample of returns, and n − 1 is the standard convention for that.
- **Cost:** the result differs slightly from the population formula (n).

**Prices are stored as `decimal`, stats calculated as `double`.**
- **Why:** prices come back exactly as written in the CSV (`190.34`, not `190.33999…`). `double` is only used where the square root needs it.
- **Cost:** none in practice.

**Stats math is checked against an independent implementation.**
- **Why:** the expected values were worked out by hand and cross-checked with a separate Python script, not taken from the C# code itself. Dedicated tests catch the two classic mistakes:
  - Drawdown calculated as max − min, which gives −55% instead of −25% on the test series.
  - Volatility calculated on prices instead of returns.
- **Cost:** none.

### Frontend

**Virtualized list (react-window), even for 200 rows.**
- **Why:** only about 26 rows exist in the page at a time. 200 rows would render fine without it, but this keeps working at 2,000 and shows awareness of rendering cost.
- **Cost:** rows need a fixed height, and tests have to stand in for the list (jsdom has no layout).

**Load the list once and filter it in the browser, after a 150ms pause in typing.**
- **Why:** typing makes no API calls. A case-insensitive substring match is enough, so there's no fuzzy search.
- **Cost:** at a much larger scale the full list wouldn't be sent to the browser. See [Scaling](#scaling).

**Each ticker has its own request cancellation (`AbortController`) and a cache.**
- **Why:**
  - Deselecting a ticker, or clicking a different one, cancels any request still running for the old one, so a slow response can never replace what the user picked last. A test covers this.
  - Data for tickers already viewed stays cached, so going back makes no requests.
- **Cost:** the cache grows during a session (at most 200 entries).

**Recharts is loaded only when needed.**
- **Why:** it's the largest dependency, about 107 KB gzipped in its own file. It downloads the first time a ticker is chosen, while the main file is about 79 KB.
- **Cost:** a short placeholder before the first chart appears.

**Comparing switches the chart to "% change since the first day".**
- **Why:** prices range from 9 to 585. On a shared price axis, a cheap ticker's line would look flat. Two y-axes would be misleading. Indexing every ticker to its first day lets them share one honest axis. The tooltip still shows actual prices, and a single ticker still shows its price chart.
- **Cost:** in compare mode, the y-axis shows % change, not price.

**Each ticker keeps its color while it's on the chart; at most 3 tickers.**
- **Why:**
  - Removing a ticker never recolors the others, and a new ticker takes the freed color.
  - The three colors (amber, blue, pink) were checked as a set on the dark background, for colorblind distinguishability and at least 3:1 contrast.
  - Three is also roughly how many lines stay readable on one chart.
- **Cost:** it's a hard limit of 3.

**The ticker chips double as the legend, and each line has a tag at its end.**
- **Why:** the ticker name sits next to its color in the chips, and the end tags label the lines directly, so color is never the only cue. Tags that would overlap are nudged apart.
- **Cost:** an end tag can cover the nearby y-axis label.

**Dark terminal-style design, with all styling in one file.**
- **Why:**
  - Every color, font and shared style is a named token in `styles/theme.css`.
  - `styles/theme.ts` refers to the same CSS variables, so the chart can't drift from the CSS.
  - The font is JetBrains Mono, installed locally rather than loaded from a CDN.
- **Cost:** no light theme yet.

**No state library and no HTTP library.**
- **Why:** `useState` plus a few custom hooks cover what's needed, and `fetch` with `AbortController` covers the requests. Redux, React Query or axios would add dependencies without solving a real problem at this size.
- **Cost:** caching and retries are hand-written (about 80 lines in `useTickersData`).

**Responsive layout.**
- **Why:**
  - From 1024px the sidebar sits beside the chart. Below that it stacks above.
  - Stat values size themselves to the space they actually have, so they never overlap.
  - On phones, the comparison table uses short column names.
  - Checked at 1440, 1024, 768 and 390px wide.
- **Cost:** none.

## Testing

- **Backend (xUnit, 34 tests):**
  - stats formulas and their edge cases,
  - CSV parser rejection rules,
  - endpoint tests against the real CSV (`WebApplicationFactory`): 200/400/404 responses, the JSON shape, and stats matching the Python reference values.
- **Frontend (Vitest + React Testing Library, 27 tests):**
  - **Helper tests:** selection and color slots, building chart rows, filtering, formatting.
  - **`App.test.tsx`:** renders the whole app against a fake API. It covers loading, comparing (including that colors stay put), cancelling a slow stale response, a per-ticker error and retry, and a failed list load with retry.
  - **Stand-ins:** the virtualized list and the Recharts chart are replaced with simple versions there, because jsdom can't lay them out. The chart's data processing is tested separately.

## AI usage

I built this with **Claude Code** (an AI coding assistant), working phase by phase from `PLAN.md` and reviewing each phase before committing.

**What the AI did**
- Scaffolded both projects.
- Wrote most of the backend and frontend code and the tests.
- Validated the chart color palette with a colorblind and contrast checker.
- Checked its own work in a real browser with screenshots and scripted clicks against the running API, at several screen sizes.

**What I decided and directed**
- **Scope and plan:** the phase plan, scope choices (Recharts, fetch, Tailwind, no state library) and performance requirements came from my `PLAN.md`.
- **Design:** I supplied the reference images for the look. I changed direction from a light design to the dark terminal style and had the top bar and its chart-scale toggle removed. I asked for standard checkboxes instead of `[x]` markers, and for a smaller header and stats table so the page fits without scrolling.
- **API shape:** I proposed returning `lastPrice` and `totalReturnPercent` from `/api/instruments`, instead of loading each row on demand or adding a summary endpoint. I asked for numeric values rather than preformatted strings.
- **Review:** I reviewed every phase before committing, decided how the commits were split, and asked for a check of the plan's checklist against the actual code.

**Problems found during verification and fixed**
- Port 5000 is taken by macOS AirPlay, which made CORS look broken. Moved to 5080.
- Tailwind wasn't emitting unused theme colors, so the chart's colors were blank. Fixed with `@theme static`.
- The uppercase label style was turning "σ" into "Σ".
- The stat values overlapped at tablet width, and the comparison table was wider than a phone screen.


## Security considerations (production)

Out of scope for this local exercise; here's how I'd approach it:

- **Authentication:** JWT bearer tokens from an identity provider (Entra ID, Auth0, Cognito), validated with `AddAuthentication().AddJwtBearer()`. Every endpoint gets `[Authorize]`.
- **Authorization:** if there were multiple users or tenants, role- or policy-based access (RBAC), for example which instrument sets a role can see.
- **Rate limiting:** per user or IP, tighter on `/stats` and any future expensive endpoint. Use ASP.NET Core's rate-limiting middleware on .NET 7+, or a gateway such as API Management or Cloudflare.
- **Already in place:**
  - **Input validation:** the ticker format check.
  - **CORS:** only allows a list of named origins, and only GET.
  - **Error bodies:** `ProblemDetails`, with no internal details.
- **Still needed:**
  - HTTPS with HSTS (usually handled by the load balancer or proxy in front of the app).
  - A production exception handler (`UseExceptionHandler`) so unhandled errors return a JSON body without a stack trace.
  - Security headers, including a content security policy, on the frontend host.
- **Secrets and dependencies:** this app has no secrets. In production they'd come from environment variables or a secret store (Key Vault or Secrets Manager), never committed files. Dependency scanning (Dependabot, `npm audit`, `dotnet list package --vulnerable`) in CI.

## Scaling

What would change at real scale (thousands of instruments, years of history, live prices):

- **Storage:**
  - Move from a CSV in memory to a time-series database (TimescaleDB, or partitioned Postgres) or a market-data service.
  - Calculate stats when new prices are written, not when the app starts.
- **Caching:** historical data never changes, so prices and stats can be cached aggressively: HTTP `Cache-Control` and ETags, output caching, and Redis shared across API instances. The API holds no state between requests, so it can run as several copies behind a load balancer.
- **Instrument list:** stop sending the whole list to the browser. Move to server-side search plus paged or cursor-based results, while the frontend keeps virtualizing what it has loaded.
- **Prices:** add date-range parameters (`?from=&to=`), downsample long histories for display, and offer one batch request for all compared tickers instead of one per ticker.
- **Live prices:** push updates over WebSockets (SignalR) or server-sent events, or poll for small numbers of tickers, with the client appending new points instead of reloading the series.
- **Frontend:** served as static files from a CDN, with the API on its own domain or behind a gateway.

## Known limitations

These are what I'd do with more time.

- **.NET 6 is out of support** (since Nov 2024). Moving the projects to `net8.0` (long-term support) is a small change, and it would remove the custom `DateOnly` JSON converter.
- **Some errors have no body.**
  - Wrong URLs (404) and wrong methods (405) come back with an empty response, and there's no production exception handler.
  - The fix is `UseStatusCodePages()` plus `UseExceptionHandler()`, plus `AddProblemDetails()` on .NET 7+.
- **Stats always cover the full 30 days.** There's no date-range picker.
- **No keyboard navigation inside the list.** Tab and Enter work, but arrow keys don't move between rows.
- **On touch devices,** compare by ticking boxes. The shift-click hint doesn't apply, and the tooltip needs a tap rather than a hover.
- **No light theme.** The tokens make one straightforward to add.
- **An end tag can cover the nearest y-axis label.**
- **No browser end-to-end tests in the repo.** Flows were checked with throwaway browser scripts during development. One or two Playwright smoke tests would be the next step.
- **Full-precision decimals:** `/api/instruments` sends returns at full precision (`-9.167804980561101`). Rounding on the server would trim about 30% of the response.
