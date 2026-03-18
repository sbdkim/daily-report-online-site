# Read Daily Brief

Public GitHub Pages output for the Daily Report Online project.

## Live Demo
- Site: [sbdkim.github.io/read-daily-brief](https://sbdkim.github.io/read-daily-brief/)

## Key Features
- Publishes a static snapshot of curated world, US, Korea, and Reddit updates
- Covers a broader set of AI and coding communities in the Reddit section
- Loads entirely from generated HTML, CSS, JavaScript, and JSON
- Updates from the private source repo on push and every 6 hours

## Tech Stack
- GitHub Pages
- GitHub Actions
- Static HTML, CSS, and JavaScript
- Generated JSON briefing data

## Project Layout
- `index.html` application shell
- `app.js` browser-side rendering
- `styles.css` site styling
- `data/latest.json` generated briefing snapshot
- `favicon.png` shared branding asset

## Notes
- This repo is deployment output only.
- Source code and workflow logic live in the private `daily-report-online` repo.
- Reddit data is generated from a layered collection flow in the private source repo so the public site can surface more posts without exposing private credentials.
