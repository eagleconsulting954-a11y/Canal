# CanalClear Product Command Demo

A functional, Vercel-ready static demo for CanalClear's three product expansions:

- Regulatory Alerts & Eligibility Checker
- Fleet Operations Dashboard
- Toll & Route Comparison

## What is included

- Maritime-themed command UI using CanalClear navy/orange branding
- Inline SVG CanalClear logo asset
- 3D ship/canal visual, radar animation, glassmorphism, animated grid/waves, tilt cards, button ripple effects, and toast notifications
- Functional demo interactions:
  - Simulate and acknowledge regulatory alerts
  - Run eligibility checks against demo vessel thresholds
  - Filter fleet queue by risk/filing/cleared status
  - Select vessels and update document/handoff status
  - Compare mock route/toll scenarios with adjustable fuel cost and delay sensitivity
  - Step through the 10-week build pipeline

## Deploying to Vercel

This is a static app. Import the repo into Vercel and deploy with default settings. No build command is required.

For local preview:

```bash
python3 -m http.server 3000
```

Then open `http://localhost:3000`.

## Notes

The route costs, eligibility thresholds, alerts, and vessel records are mock data for product demonstration only. Replace them with real authority data, customer fleet records, and licensed toll-rate sources before production use.
