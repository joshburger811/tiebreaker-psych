# Launch checklist

Move tiebreakerpsych.com from Wix to this site without breaking email.

## One-time setup (before launch)

- [ ] Create a Cloudflare account with a practice email address.
- [ ] In Cloudflare, go to **Workers & Pages → Create → Import a repository**. Connect GitHub, pick `tiebreaker-psych`, and accept the defaults (deploy command `npx wrangler deploy`).
- [ ] In the project's **Settings → Build**, set the production branch to `main` and turn on **preview URLs for non-production branches**. Pull requests then get a preview link.
- [ ] Open a test pull request and confirm a preview link appears.

## Before switching DNS

- [ ] Write down every current DNS record in Namecheap (Domain List → Manage → Advanced DNS), especially the email ones: **MX**, **TXT** (SPF, and Google or Microsoft verification), **CNAME** (DKIM, autodiscover) and any `_dmarc` record. If the records live at Wix instead, export them from Wix → Domains.
- [ ] Confirm who provides and bills for email. If it's billed through Wix, move that billing **before** cancelling Wix.
- [ ] Final content review on the preview link.

## Launch day

- [ ] In Cloudflare: **Add a domain → tiebreakerpsych.com** (Free plan). Compare the records Cloudflare imported against the list above, and add anything it missed. Email records (MX, and TXT used for email) must stay **DNS only** (grey cloud).
- [ ] In Namecheap: **Domain → Nameservers → Custom DNS** and enter the two nameservers Cloudflare gives you.
- [ ] When Cloudflare shows the domain as **Active**, open the Worker → **Settings → Domains & Routes** and add `www.tiebreakerpsych.com` and `tiebreakerpsych.com`.
- [ ] Redirect the bare domain to `www` (or the reverse), whichever matches `sitemap.xml` (it currently uses `www`).
- [ ] Unhide the site from search engines, in one pull request:
  - remove the `X-Robots-Tag` lines from `site/_headers`
  - change `site/robots.txt` to allow crawling and point to the sitemap
  - remove `<meta name="robots" content="noindex, nofollow">` from real pages (keep it on redirect stubs)
- [ ] Send a test email to and from the practice address.
- [ ] Check the old Wix links redirect: `/home`, `/webinar`, `/event-details/...`.
- [ ] Submit the sitemap in Google Search Console.

## After launch

- [ ] Wait about a week, confirm email and the site are fine, then cancel the Wix site plan (keep the domain at Namecheap).
- [ ] Set up a real backend for the intro-session form so submissions don't depend on the visitor's email app (see `CLAUDE.md`).
