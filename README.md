# Instrument Price Dashboard

A full-stack app for browsing 200 financial instruments, charting their 30-day price history, viewing computed stats, and overlaying 2–3 tickers for comparison.

- **Backend:** C# / ASP.NET Core Web API. It loads `market_data.csv` into memory at startup and serves prices and stats.
- **Frontend:** React + TypeScript (Vite), Tailwind CSS, and Recharts for charts.

## API

| Endpoint | Returns |
| --- | --- |
| `GET /api/instruments` | All 200 instruments, sorted by ticker: `[{ ticker, lastPrice, totalReturnPercent }]` |
| `GET /api/prices/{ticker}` | Full 30-day price series (404 if the ticker is unknown) |
| `GET /api/prices/{ticker}/stats` | Total return %, daily volatility, max drawdown |

## Data

`market_data.csv` has the columns `date,ticker,price`: 200 tickers × 30 trading days (2026-06-23 to 2026-08-03), 6,000 rows. It lives at the repo root, and the backend build copies it next to the API binary.

## Project structure

```
.
├── market_data.csv
├── backend/
│   ├── InstrumentPrices.sln
│   ├── InstrumentPrices.Api/     # Web API
│   └── InstrumentPrices.Tests/   # xUnit tests
└── frontend/                     # Vite + React + TypeScript
    └── src/
        ├── api/
        ├── components/
        ├── hooks/
        └── types/
```

## Prerequisites

- [.NET SDK](https://dotnet.microsoft.com/download) 6.0 or later
- [Node.js](https://nodejs.org/) 20 or later (with npm)

## Running locally

Start the backend and the frontend in separate terminals.

### 1. Backend (http://localhost:5080)

```bash
cd backend
dotnet run --project InstrumentPrices.Api
```

Swagger UI is available at http://localhost:5080/swagger.

> The API uses port 5080, not 5000, because macOS AirPlay Receiver listens on port 5000.

### 2. Frontend (http://localhost:5173)

```bash
cd frontend
npm install
cp .env.example .env   # optional; the API URL defaults to http://localhost:5080
npm run dev
```

Open http://localhost:5173.

CORS on the backend allows requests from `http://localhost:5173`. If you run the frontend on a different origin, add it to `Cors:AllowedOrigins` in `backend/InstrumentPrices.Api/appsettings.json`.

## Running tests

```bash
# Backend
cd backend
dotnet test

# Frontend
cd frontend
npm test
```
