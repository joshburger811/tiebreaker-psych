# Working on this repo

Static marketing site for Tiebreaker Psych, Josh Burger's sport psychology coaching practice. The owner isn't technical: Claude makes all changes, and the owner approves them on a preview link.

## Working with the owner

These are the owner's standing rules. Follow them in every session.

- **Change request → staging link.** When the owner asks for a change, make it on its own staging branch (see "Staging links"), wait for the Cloudflare preview build to pass, then reply with the staging link. Don't stop at "here's the plan" or "the change is ready".
- **Link to the page that changed.** If the change is on a specific page, send the link to that page, not the homepage (for example `…workers.dev/services`). If several pages changed, list a link for each.
- **Only what was asked.** Don't add improvements, fixes or rewording the owner didn't request. If you notice something else worth changing, mention it in one line at the end of your reply and ask; don't do it.
- **Typos.** If the owner's request contains what looks like a typo (especially in text going on the site), ask whether to fix it before using it. Don't silently correct it or copy it as-is.
- **Plain language.** The owner isn't technical. Don't mention GitHub, Cloudflare, branches, pull requests, commits, builds or deploys unless the owner asks, or something needs them to take an action by hand. Then say exactly what to click.
- **Staging first, always.** Never push or merge anything to production (`main`) unless that exact change is already on staging and the owner has confirmed it looks good. No exceptions: this includes small fixes, text-only edits, undos and changes that don't affect how the site looks.
- **Going live.** Once the owner confirms the staging version looks good, ask "Ready to publish this to the live site?" (or treat their confirmation as the go-ahead if they've already said to publish), then merge. Confirm in one line once it's live.
- **Remind about unapproved changes.** At the start of every conversation, and at the end of any reply that finishes a change, check for open pull requests from `staging-*` branches, from any conversation. List each one in a line with its staging link, a few words on what it changes, and how long it's been waiting. If one has had no activity for 3 days or more, ask whether to publish it or delete it. To delete: close the pull request and delete its branch. Delete only after the owner says so.
- **Check on a phone too.** Before sharing a staging link, check the changed pages at phone width (about 390px) as well as desktop, and fix any layout problems your change caused.
- **"Undo" means roll back.** If the owner says "undo that" (or similar) about something already live, return the live site to how it was before their last approved change, by reverting that change. Like any other change, the undo goes to staging first, and the owner confirms it before it goes live.
- **Photos.** The owner may send photos straight from a phone. Resize and compress them for the web (long edge about 2000px or less, a reasonable JPEG/WebP quality) and strip location metadata. Don't crop, filter or edit them unless asked.
- **Protected details.** Never change the phone number, email address, prices or testimonials unless the owner specifically asks for that exact change.

### Staging links

Every change gets its own staging branch and link, so several conversations can run at the same time without stepping on each other.

- **Branch name:** `staging-<short-topic>`, lowercase with hyphens, at most 30 characters, e.g. `staging-about-photo` or `staging-fees-update`. Before creating it, check it doesn't already exist on GitHub. If it does, pick another name.
- **Staging link:** `https://<branch>-tiebreaker-psych.burger-josh.workers.dev`, plus the page path. For example `staging-about-photo` → `https://staging-about-photo-tiebreaker-psych.burger-josh.workers.dev/about`. The `cloudflare-workers-and-pages` bot also posts it on the pull request.
- Check that the `Workers Builds: tiebreaker-psych` check passed for your latest push before sharing a link.
- One staging branch per conversation or topic. Never push to another conversation's staging branch, and never reuse a branch whose pull request has been merged or closed.
- The old shared `staging` branch is retired. Don't use it.

Live site (until the domain is switched): `https://tiebreaker-psych.burger-josh.workers.dev`.

## Workflow

- `main` is production. Cloudflare deploys it automatically.
- **Never work on `main` directly.** Never commit to `main`, push to `main`, or check it out to make changes. The only way anything reaches `main` is merging a pull request after the owner confirms the staging version (see "Staging first, always").
- For each change request:
  1. `git fetch origin main` and create your staging branch from the latest `origin/main`.
  2. Make the change, check it locally (desktop and phone width), then push the branch.
  3. Open a pull request from your staging branch into `main`, and send the owner the staging link once the build passes.
  4. If the owner asks for adjustments, push more commits to the same branch. The link stays the same.
- **Before publishing**, bring in anything another conversation published in the meantime: merge the latest `origin/main` into your branch (no rebase or force-push), resolve conflicts keeping both changes, and push. If that changed what the owner will see on the pages they reviewed, send the staging link again and get a fresh confirmation before merging.
- Publish one pull request at a time. After merging, delete the staging branch if you can. If the delete is refused, leave the branch: it's harmless once merged.
- Write pull request descriptions in plain English: what changed, which pages, and what to look at on the preview.
- Branch protection is intentionally off. The owner's rules above are the safeguard, so follow them strictly.

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
