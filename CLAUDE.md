# Working on this repo

Static marketing site for Tiebreaker Psych, Josh Burger's sport psychology coaching practice. The owner isn't technical: Claude makes all changes, and the owner approves them on a preview link.

## Workflow

- `main` is production. Cloudflare deploys it automatically.
- Make every change on a branch and open a pull request. Cloudflare builds a preview URL for each branch push; that's what the owner reviews.
- Write pull request descriptions in plain English: what changed, which pages, and what to look at on the preview.
- Branch protection is intentionally off. Before anything reaches `main` (merging or pushing), ask the owner in chat and wait for an explicit yes.

## Layout

- `site/` is served as-is (no build step). Each page is `site/<path>/index.html`; the homepage is `site/index.html`.
- `wrangler.jsonc` configures Cloudflare Workers static assets: `html_handling: drop-trailing-slash`, so `/about/` redirects to `/about`, and `not_found_handling: 404-page`.
- `site/_redirects` maps old Wix URLs to new pages. Keep the redirect stub pages too (`site/home/`, `site/webinar/`, and others); they also carry `noindex`.
- The header, nav and footer are repeated in every HTML file. When you change one, change all of them (`grep -l` across `site/`).
- Shared CSS/JS: `site/assets/css/site.css` and `site/assets/js/site.js`.
- Keep files under Cloudflare's 25 MiB per-file limit. The two podcast MP3s in `site/assets/media/` are about 13 MB and 16 MB.

## Pre-launch state

The site is hidden from search engines (`X-Robots-Tag` in `site/_headers`, `Disallow: /` in `robots.txt`, `noindex` meta tags). The launch steps in `LAUNCH.md` undo this. Don't remove it before launch.

## Intro-session form

The homepage form (`[data-intro-form]`) posts to its `action` URL if one is set (Formspree-style: JSON accept header, `_gotcha` honeypot). Otherwise it opens a `mailto:` to Josh@TiebreakerPsych.com. No backend is configured yet.

## Checking a change locally

```sh
npm install && npm run dev   # http://localhost:8787
```

To screenshot: `/opt/pw-browsers/chromium-*/chrome-linux/chrome --headless --no-sandbox --screenshot=out.png --window-size=1280,2400 http://localhost:8787/`
