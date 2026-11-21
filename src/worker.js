// Sends visitors on old or duplicate addresses to the real site, and serves
// everything else from ./site (including _headers and _redirects).
const CANONICAL_HOST = 'www.tiebreakerpsych.com';
const REDIRECT_HOSTS = ['tiebreakerpsych.com', 'tiebreaker-psych.burger-josh.workers.dev'];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (REDIRECT_HOSTS.includes(url.hostname)) {
      url.protocol = 'https:';
      url.hostname = CANONICAL_HOST;
      url.port = '';
      return Response.redirect(url.toString(), 301);
    }
    return env.ASSETS.fetch(request);
  },
};
