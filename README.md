# Madhuri Dama — Portfolio

Personal portfolio site. Static HTML, CSS and vanilla JavaScript — no framework,
no dependencies, no build tooling beyond a file copy.

**Live site:** https://madhuridama.github.io/portfolio

## Local development

```bash
npm start        # serve at http://localhost:5173
npm run dev      # same, and opens your browser
```

No `npm install` needed — the dev server uses only Node built-ins (Node 18+).

## Build

```bash
npm run build    # copies the public site into dist/
npm run preview  # serve the built dist/ folder
```

`dist/` contains only what gets published: `index.html`, `assets/`, a `404.html`
fallback and `.nojekyll`. Everything else — the design notes, dev scripts and
local editor settings — stays out of the deployed site.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the site
and publishes `dist/` to GitHub Pages.

One-time setup in the repository: **Settings → Pages → Source: GitHub Actions**.

## Structure

```
index.html              markup for every section
assets/css/styles.css   theme tokens, layout, animations
assets/js/main.js       nav, scroll progress, scroll reveal
assets/*.pdf            downloadable resume
scripts/serve.js        zero-dependency dev server
scripts/build.js        copies the public site into dist/
```
