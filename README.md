# CanalClear Full Suite Demo

A Vercel-ready CanalClear demo for testing the product suite end to end.

## What is included

- Premium CanalClear command-center UI using navy, maritime cyan, and CanalClear orange
- Mock backend/serverless API layer for demo testing
- Seeded connectors for authority rules, AIS/vessel position, document parsing, toll rates, weather/delay risk, RBAC, notifications, and audit logging
- Full waterway pre-validator for:
  - Panama Canal
  - Suez Canal
  - Bosporus Strait
  - Malacca Strait
  - Cape of Good Hope
  - Kiel Canal
  - Saint Lawrence Seaway
- Sample vessels, alerts, fleet records, document packets, route options, and toll/delay mock data
- Fully wired demo actions for navigation, connector tests, pre-validation, fleet vessel dossiers, route comparison, handoffs, exports, and pipeline controls

## Demo backend endpoints

### `GET /api/demo?resource=suite`
Returns all seeded demo data: connectors, waterways, vessels, alerts, and route options.

Other supported resources:

- `connectors`
- `waterways`
- `waterwayRules`
- `vessels`
- `alerts`
- `routeOptions`

### `POST /api/prevalidate`
Runs a demo waterway pre-validation.

Example payload:

```json
{
  "waterway": "panama",
  "vessel": {
    "loa": 295,
    "beam": 43,
    "draft": 13.2,
    "airDraft": 49,
    "cargo": "Containerized"
  },
  "docs": ["Certificate of Registry", "Crew Manifest", "Cargo Declaration"]
}
```

The response includes status, score, issues, warnings, required documents, filing steps, authority, and booking window.

## Deploying to Vercel

Import the repo into Vercel and deploy. The static app runs from `index.html`, and Vercel will also expose the serverless API files under `/api`.

No build command is required.

For local static preview:

```bash
python3 -m http.server 3000
```

For testing the API locally, use Vercel CLI:

```bash
vercel dev
```

## Notes

This is demo infrastructure only. The rules, tolls, vessel records, alerts, and connector responses are seeded mock data so prospects can test the full product experience without production credentials. Replace mock connectors with licensed authority data, customer fleet records, and production authentication before real launch.
