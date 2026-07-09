# CanalClear Full Suite Demo

A Vercel-ready CanalClear demo for testing the product suite end to end.

## What is included

- Premium CanalClear command-center UI using navy, maritime cyan, and CanalClear orange
- Mock backend/serverless API layer for demo testing
- Seeded connectors for authority rules, AIS/vessel position, document parsing, toll rates, weather/delay risk, RBAC, notifications, and audit logging
- Full waterway pre-validator for Panama Canal, Suez Canal, Bosporus Strait, Malacca Strait, Cape of Good Hope, Kiel Canal, and Saint Lawrence Seaway
- Upload-based document review workspace inside the validator
- Fillable on-screen document form for document type, authority, document number, issue/expiry dates, vessel name, IMO, owner, cargo, and notes/extracted text
- Demo AI document review agent that compares uploaded/filled documents against the selected waterway, required document list, and vessel data
- Sample vessels, alerts, fleet records, document packets, route options, and toll/delay mock data
- Fully wired demo actions for navigation, connector tests, pre-validation, AI document review, fleet vessel dossiers, route comparison, handoffs, exports, and pipeline controls

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

### `POST /api/document-review`
Runs a demo document review agent on uploaded file metadata/text plus the fillable on-screen form.

Example payload:

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

The response includes detected document types, missing required documents, field accuracy checks, review issues, score, status, and recommendation.

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

This is demo infrastructure only. The rules, tolls, vessel records, alerts, connector responses, and document review agent are seeded mock data so prospects can test the full product experience without production credentials. Replace mock connectors with licensed authority data, customer fleet records, production authentication, OCR/PDF extraction, and a production AI review model before real launch.
