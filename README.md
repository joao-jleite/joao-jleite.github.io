# joao-jleite.github.io

Portfolio of **João Vitor Sousa Leite**, freelance developer (Python automation and AI integration) in Embu das Artes, SP, Brazil.

Live: https://joao-jleite.github.io/

## Stack

Plain HTML, CSS and JavaScript. No framework, no build step. Served by GitHub Pages from `main` (root).

## Layout

| Path | What it is |
|---|---|
| `index.html` | The page. English copy lives here (what crawlers and no-JS visitors see). |
| `js/i18n.js` | Spanish copy plus page metadata per language. |
| `js/demos.js` | Demo registry. Each demo has an `enabled` flag; the section adapts to one or two cards and hides itself when none is enabled. |
| `js/main.js` | Language switch (EN/ES, remembered in `localStorage`), demo rendering, video autoplay while visible, lightbox, mobile menu. |
| `css/styles.css` | All styles. |
| `assets/img`, `assets/media` | Optimized WebP screenshots, MP4 demos, posters and GIF fallbacks. |
| `tools/build_media.py` | Rebuilds `assets/` from the raw captures kept outside this repo. |
| `tools/qa_screens.py` | Playwright screenshots (desktop/mobile, EN/ES) with basic checks. |

## Editing

- Change English text in `index.html` and the matching key in `js/i18n.js` (`ES`).
- Turn a demo on or off: set `enabled` in `js/demos.js`.

Screenshots of client and in-house work use anonymized sample data. Demos use fictitious data.
