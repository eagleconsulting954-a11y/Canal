# CanalClear Full Suite Demo

A Vercel-ready CanalClear demo for testing the product suite end to end.

## What is included

- Premium CanalClear command-center UI using navy, maritime cyan, and CanalClear orange
- Production-shaped mock backend/serverless API layer for demo testing
- Seeded connectors for authority rules, AIS/vessel position, document parsing, toll rates, weather/delay risk, RBAC, notifications, and audit logging
- Full waterway pre-validator for Panama Canal, Suez Canal, Bosporus Strait, Malacca Strait, Cape of Good Hope, Kiel Canal, and Saint Lawrence Seaway
- Upload-based document review workspace inside the validator
- Fillable on-screen document form for document type, authority, document number, issue/expiry dates, vessel name, IMO, owner, cargo, and notes/extracted text
- Demo AI document review agent that compares uploaded/filled documents against the selected waterway, required document list, and vessel data
- Sample vessels, alerts, fleet records, document packets, route options, and toll/delay mock data
- Fully wired demo actions for navigation, connector tests, pre-validation, AI document review, fleet vessel dossiers, route comparison, handoffs, exports, and pipeline controls

## Backend V1 services

The backend is organized under reusable service modules in `api/_lib` and Vercel functions under `api/v1`.

Core endpoints:

- `GET /api/v1/health`
- `GET|POST /api/v1/connectors`
- `GET /api/v1/waterways`
- `GET|POST /api/v1/vessels`
- `GET|POST /api/v1/prevalidate`
- `GET|POST /api/v1/document-review`
- `GET|POST /api/v1/routes-compare`
- `GET|POST|PATCH /api/v1/alerts`

See `docs/BACKEND.md` for architecture, payload examples, and the production upgrade path.

## Legacy/demo compatibility endpoints

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

### `POST /api/document-review`
Runs a demo document review agent on uploaded file metadata/text plus the fillable on-screen form.

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

This is demo infrastructure only. The rules, tolls, vessel records, alerts, connector responses, and document review agent are seeded mock data so prospects can test the full product experience without production credentials. Replace mock connectors with licensed authority data, customer fleet records, production authentication, OCR/PDF extraction, persistent storage, and a production AI review model before real launch.
