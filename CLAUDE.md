# Working on this repo

Static marketing site for Tiebreaker Psych, Josh Burger's sport psychology coaching practice. The owner isn't technical: Claude makes all changes, and the owner approves them on a preview link.

## Working with the owner

These are the owner's standing rules. Follow them in every session.

- **Change request → staging link.** When the owner asks for a change, make it, push it to a branch, wait for the Cloudflare preview build to pass, then reply with the staging link. Don't stop at "here's the plan" or "the change is ready".
- **Link to the page that changed.** If the change is on a specific page, send the link to that page, not the homepage (for example `…workers.dev/services`). If several pages changed, list a link for each.
- **Only what was asked.** Don't add improvements, fixes or rewording the owner didn't request. If you notice something else worth changing, mention it in one line at the end of your reply and ask; don't do it.
- **Typos.** If the owner's request contains what looks like a typo (especially in text going on the site), ask whether to fix it before using it. Don't silently correct it or copy it as-is.
- **Plain language.** The owner isn't technical. Don't mention GitHub, Cloudflare, branches, pull requests, commits, builds or deploys unless the owner asks, or something needs them to take an action by hand. Then say exactly what to click.
- **Going live.** Ask "Ready to publish this to the live site?" and wait for an explicit yes before merging to `main`. Then confirm in one line once it's live.

### Staging links

Staging is always the `staging` branch, at a fixed address the owner can bookmark:
`https://staging-tiebreaker-psych.burger-josh.workers.dev` (add the page path, e.g. `/about`).

- For each change request, start from the latest `main`, make the change on your working branch, then push it to `staging` as well (`git push origin HEAD:staging --force-with-lease`). Open the pull request from `staging` into `main`.
- `staging` holds one proposed change set at a time. If the owner asks for something new while an earlier change is still waiting to be published, ask whether to add it to the current batch or wait until the earlier one is live.
- After a publish, staging can be reset to `main` at the next change request.
- Check that the `Workers Builds: tiebreaker-psych` check passed for the `staging` push before sharing a link.

Live site (until the domain is switched): `https://tiebreaker-psych.burger-josh.workers.dev`.

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
