# CanalClear Backend Architecture

This repo now includes a production-shaped Vercel serverless backend for the CanalClear full-suite demo. It is still safe mock/demo infrastructure, but the structure mirrors how the real product backend can be expanded.

## Backend modules

- `api/_lib/http.js` — CORS, body parsing, response envelope, method guards
- `api/_lib/store.js` — seeded demo store, waterway/vessel lookup, demo users, RBAC roles
- `api/_lib/validator.js` — waterway dimension, document, cargo, and filing readiness engine
- `api/_lib/documentAgent.js` — upload/fillable-document review service and field matching
- `api/_lib/routeEngine.js` — toll, fuel, delay, confidence, and recommendation engine
- `api/_lib/connectors.js` — mock connector sync and health checks

## V1 API endpoints

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/api/v1/health` | GET | Backend status, version, and seeded data counts |
| `/api/v1/connectors` | GET | List connector health records |
| `/api/v1/connectors` | POST | Test one connector or all connectors |
| `/api/v1/waterways` | GET | List waterways or fetch one with `?id=panama` |
| `/api/v1/vessels` | GET | List sample vessels or fetch one with `?id=atlantic-meridian` |
| `/api/v1/vessels` | POST | Create a demo vessel response and immediately validate it |
| `/api/v1/prevalidate` | GET | Validator discovery and supported waterways |
| `/api/v1/prevalidate` | POST | Run full transit pre-validation |
| `/api/v1/document-review` | GET | Document agent discovery |
| `/api/v1/document-review` | POST | Run AI-style document packet review |
| `/api/v1/routes-compare` | GET/POST | Compare route options with toll, fuel, and delay assumptions |
| `/api/v1/alerts` | GET | List seeded demo alerts |
| `/api/v1/alerts` | POST | Create a mock alert |
| `/api/v1/alerts` | PATCH | Acknowledge/update a mock alert |

## Core POST examples

### Pre-validation

```json
{
  "waterway": "panama",
  "vessel": {
    "name": "Atlantic Meridian",
    "imo": "IMO 9483921",
    "owner": "Blue Harbor Line",
    "cargo": "Containerized",
    "loa": 295,
    "beam": 43,
    "draft": 13.2,
    "airDraft": 49
  },
  "docs": ["Certificate of Registry", "Crew Manifest", "Cargo Declaration"]
}
```

### Document review

```json
{
  "waterway": "panama",
  "vessel": {
    "name": "Atlantic Meridian",
    "imo": "IMO 9483921",
    "owner": "Blue Harbor Line",
    "cargo": "Containerized",
    "loa": 295,
    "beam": 43,
    "draft": 13.2,
    "airDraft": 49
  },
  "form": {
    "vesselName": "Atlantic Meridian",
    "imo": "IMO 9483921",
    "owner": "Blue Harbor Line",
    "cargo": "Containerized"
  },
  "files": [
    {
      "name": "crew-manifest.txt",
      "type": "text/plain",
      "size": 1200,
      "text": "Crew Manifest Atlantic Meridian IMO 9483921"
    }
  ]
}
```

### Route comparison

```json
{
  "profile": "container",
  "fuelPerDay": 52000,
  "delaySensitivity": 1
}
```

## Production upgrades still needed

- Replace seeded mock data with a persistent database such as Postgres.
- Add real authentication and tenant isolation.
- Connect licensed authority, toll, weather, AIS, and document providers.
- Add real OCR/PDF extraction for uploaded documents.
- Add an AI review model behind `documentAgent.js` with guardrails, audit trails, and human approval.
- Add server-side file storage for uploaded documents.
- Add automated tests and request schema validation.
