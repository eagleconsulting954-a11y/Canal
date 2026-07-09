# CanalClear Premium Product Build Demo

A functional, Vercel-ready static demo for CanalClear's three product expansions:

- Regulatory Alerts & Eligibility Checker
- Fleet Operations Dashboard
- Toll & Route Comparison

## Premium V2 update

This version upgrades the interface into a more modern executive maritime SaaS command center while keeping the CanalClear logo coloration: deep navy, maritime cyan, and CanalClear orange.

Included in the upgraded UI:

- Premium matte/glass command-center styling
- Inline 3D maritime ship visual, radar effect, route chips, and animated premium background
- Functional sidebar navigation and responsive mobile menu
- Executive overview for the three-build expansion roadmap
- Full build dossiers for each product expansion
- Required team, dependency gates, data/schema needs, backend needs, frontend needs, QA/pilot needs, risks, owners, launch metrics, and stage-by-stage delivery information
- Interactive risk scan and copy-build-spec buttons
- Week-by-week 10-week pipeline command brief

## Functional demo interactions

- Simulate and acknowledge regulatory alerts
- Run vessel eligibility checks against demo thresholds
- Filter fleet queue by risk, filing, and cleared status
- Select vessels and update document/handoff status
- Compare mock toll/route scenarios with adjustable fuel cost and delay sensitivity
- Step through the 10-week build pipeline

## Deploying to Vercel

This is now a self-contained static `index.html` app. Import the repo into Vercel and deploy with default settings. No build command is required.

For local preview:

```bash
python3 -m http.server 3000
```

Then open `http://localhost:3000`.

## Notes

The route costs, eligibility thresholds, alerts, and vessel records are mock data for product demonstration only. Replace them with real authority data, customer fleet records, and licensed toll-rate sources before production use.
