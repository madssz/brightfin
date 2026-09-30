# Brightfin ServiceNow Playwright Tests

End-to-end tests for device ordering and telecom fulfillment workflows.

## Setup

Requires Node.js 20.12+ and access to a ServiceNow test instance.

```powershell
npm ci
npx playwright install chromium
Copy-Item .env.example .env
```

Set `PLAYWRIGHT_BASE_URL`, `PLAYWRIGHT_USERNAME`, and `PLAYWRIGHT_PASSWORD` in `.env`. Do not commit real credentials.

## Run

```sh
npm run typecheck
npm test
```

Tests create and update records. Run them against a non-production instance with a dedicated test account.
