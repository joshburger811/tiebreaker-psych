# Tiebreaker Psych website

The website for [tiebreakerpsych.com](https://www.tiebreakerpsych.com).

**Status:** pre-launch. The site is hidden from search engines until the launch steps in [LAUNCH.md](LAUNCH.md) are done.

## How changes get made

1. **Ask Claude for a change.** Use the Claude app, or open a GitHub issue and describe what you want.
2. **Claude makes the change on its own branch** and opens a pull request. The live site doesn't change.
3. **Cloudflare builds a preview link** for that pull request in about a minute. This is the staging site.
4. **Review the preview** on your phone or computer. Tell Claude what to adjust, and the same link updates.
5. **Approve it.** Tell Claude "approved", or click the green **Merge** button on the pull request. The live site updates within a minute or two.

Anything on the `main` branch is live, so nothing reaches `main` without approval. Every past version is saved. To undo a release, open Cloudflare → Workers & Pages → tiebreaker-psych → Deployments and roll back to an earlier one.

## What's where

| Path | What it is |
|---|---|
| `site/` | The website itself: one folder per page (`site/about/index.html` is `/about`) |
| `site/assets/` | Shared styles (`css/`), scripts (`js/`), images (`img/`) and audio (`media/`) |
| `site/_redirects` | Old Wix addresses forwarded to the new pages |
| `site/_headers` | Extra settings sent with every page (currently hides the site from Google until launch) |
| `wrangler.jsonc` | Cloudflare hosting settings |

There's no build step: the files in `site/` are served exactly as they are.

## Hosting

- **Code:** GitHub (this repo)
- **Hosting and preview links:** Cloudflare Workers (free plan)
- **Domain:** registered at Namecheap; DNS managed by Cloudflare after launch
- **Email:** unchanged by this project

## Running it locally (optional)

```sh
npm install
npm run dev    # http://localhost:8787
```

## Launch checklist

See [LAUNCH.md](LAUNCH.md).
