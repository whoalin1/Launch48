# Launch48

Static marketing preview for Launch48 — a productized landing-page service.

## Open locally

From this folder:

```bash
python3 -m http.server 8080
```

Then visit:

- Home: http://localhost:8080/
- Brief form: http://localhost:8080/brief.html
- Example shipped page: http://localhost:8080/example/
- Privacy: http://localhost:8080/privacy.html
- Terms: http://localhost:8080/terms.html

No build step. Pure HTML, CSS, and a little JavaScript.

## Deploy

Static files. Vercel or GitHub Pages from `main`.

Payments (Polar) are not wired yet; the brief form is front-end only.
