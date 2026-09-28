# test-performance-web

A TypeScript k6 performance-testing scaffold for web APIs and business journeys.

## Prerequisites

- Node.js 20+
- k6 0.49+

## Setup

```powershell
npm install
Copy-Item .env.example .env
```

Set `BASE_URL` and any authentication values in the environment. Build an entry script before running k6:

```powershell
npm run build -- tests/smoke/login.smoke.ts
k6 run dist/login.smoke.js
```

The `tests` directory contains thin k6 entry scripts. Reusable HTTP behavior belongs in `clients`, `scenarios`, and `helpers`.
