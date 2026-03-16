# Read Daily Brief

A public GitHub Pages reader for generated daily briefing snapshots covering major news and community updates.

## Live Demo
[https://sbdkim.github.io/read-daily-brief/](https://sbdkim.github.io/read-daily-brief/)

## Key Features
- Publishes a static snapshot of curated world, US, Korea, and Reddit updates
- Loads entirely from generated HTML, CSS, JavaScript, and JSON
- Surfaces a broader set of AI and coding communities in the Reddit section
- Updates from the private source repo on push and every 6 hours

## Tech Stack
- GitHub Pages
- GitHub Actions
- Static HTML, CSS, and JavaScript
- Generated JSON briefing data

## Setup / Run Locally
```powershell
python -m http.server
```

Open `http://127.0.0.1:8000` to view the generated site locally.

## Tests
No automated test suite is set up in this public output repo.

## Deployment Notes
- This repository is deployment output only.
- Source code, data collection, and workflow logic live in the private `daily-report-online` repo.
- The published site updates when the private source pipeline pushes refreshed static files into this repo.

## Project Layout
- `index.html` application shell
- `app.js` browser-side rendering
- `styles.css` site styling
- `data/latest.json` generated briefing snapshot
- `shared/` shared styling assets used by the public site

## Notes
- This repo should stay focused on static output and deployment-safe assets.
- The public product name is `Read Daily Brief`, and the repo slug target is `read-daily-brief`.
