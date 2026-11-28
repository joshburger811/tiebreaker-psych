// Google Analytics (GA4) and Google Ads lead tracking.
// GA4 measurement ID: the same property the Wix site reported to (via its Tag Manager container).
const GA4_ID = 'G-YCRZMP46P6';
// Conversion ID and label of the "Introductory Sign-Up Lead Form"
// conversion in Google Ads. Tracking (Ads and Analytics) only runs on tiebreakerpsych.com, so test
// visits and submissions on preview links, the workers.dev address and localhost are never counted.
const ADS_CONVERSION = { id: 'AW-606276868', label: '4t1wCNKalNsBEISajKEC' };
const ADS_LIVE_HOSTS = ['tiebreakerpsych.com', 'www.tiebreakerpsych.com'];
const adsOn = Boolean(ADS_CONVERSION.id && ADS_CONVERSION.label && ADS_LIVE_HOSTS.includes(location.hostname));
window.dataLayer = window.dataLayer || [];
function gtag() { window.dataLayer.push(arguments); }
if (adsOn) {
  const tag = document.createElement('script');
  tag.async = true;
  tag.src = `https://www.googletagmanager.com/gtag/js?id=${ADS_CONVERSION.id}`;
  document.head.appendChild(tag);
  gtag('js', new Date());
  gtag('config', ADS_CONVERSION.id);
  gtag('config', GA4_ID);
}
// ChatGPT ads (OpenAI Ads Manager) measurement pixel, for the "tiebreakerpsych.com" data source.
// Same rule as Google: only runs on the live site. The pixel reads the ad-click ID (oppref) from
// the landing page address itself; the only event sent is lead_created, after an intro request.
const OPENAI_PIXEL_ID = '3DpW9MFf1bi1inCq2GebWX';
if (adsOn) {
  !function(w,d,s,u){if(w.oaiq)return;var q=function(){q.q.push(arguments)};q.q=[];w.oaiq=q;var j=d.createElement(s);j.async=1;j.src=u;var f=d.getElementsByTagName(s)[0];f.parentNode.insertBefore(j,f);}(window,document,"script","https://bzrcdn.openai.com/sdk/oaiq.min.js");
  window.oaiq('init', { pixelId: OPENAI_PIXEL_ID });
}
const chatgptLead = () => {
  try {
    if (!adsOn || !window.oaiq) return;
    const id = window.crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.oaiq('measure', 'lead_created', { type: 'customer_action' }, { event_id: id });
  } catch { /* tracking must never get in the way of the form */ }
};
// Named GA4 events, matching the ones the Wix site sent: generate_lead, phone_call,
// email_contact and outbound_social.
const gaEvent = (name, params = {}) => {
  if (adsOn) gtag('event', name, { ...params, send_to: GA4_ID });
};
// Counts a lead, then runs `done` (if given) once Google Ads has the event, or after
// 1.5 seconds at most, so leaving the page right after doesn't lose the conversion.
// With ads = false (forms marked data-ads-conversion="off", such as Speak), only the GA4
// event is sent, not the intro-session Ads conversion. `event` is the GA4 event name
// (forms can set their own with data-ga-event, e.g. Speak's speaking_request).
// Enhanced conversions: gives Google the visitor's email and phone with the lead, which the
// Google tag hashes in the browser before sending, so Ads can match more leads to ad clicks.
// Phone numbers are sent in +1XXXXXXXXXX form; anything else is left out.
const leadUserData = (email, phone) => {
  const data = {};
  if (email && /^\S+@\S+\.\S+$/.test(email.trim())) data.email = email.trim().toLowerCase();
  const digits = (phone || '').replace(/\D/g, '');
  if (digits.length === 10) data.phone_number = `+1${digits}`;
  else if (digits.length === 11 && digits[0] === '1') data.phone_number = `+${digits}`;
  return data;
};
const trackLead = (done, ads = true, event = 'generate_lead', userData = {}) => {
  let called = false;
  const finish = () => { if (!called && done) { called = true; done(); } };
  gaEvent(event);
  if (ads) chatgptLead();
  if (adsOn && ads) {
    if (Object.keys(userData).length) gtag('set', 'user_data', userData);
    gtag('event', 'conversion', { send_to: `${ADS_CONVERSION.id}/${ADS_CONVERSION.label}`, event_callback: finish });
    setTimeout(finish, 1500);
  } else finish();
};
// Labels of the "Contact | Phone Call" and "Contact | Text Message" conversions in Google Ads,
// counted when a visitor taps Call or Text in the phone-number menu.
const ADS_CALL_LABEL = 'IcESCPuR-7IcEISajKEC';
const ADS_TEXT_LABEL = 'gGafCJC3tLodEISajKEC';
const trackContact = (label) => {
  if (adsOn) gtag('event', 'conversion', { send_to: `${ADS_CONVERSION.id}/${label}` });
  gaEvent('phone_call', { method: label === ADS_TEXT_LABEL ? 'text' : 'call' });
};
// Google Ads conversions carried over from the Wix site: email link clicks, and the
// Services page buttons for a free individual session and for group sessions.
const ADS_EMAIL_LABEL = 'mHGMCPiR-7IcEISajKEC';
const ADS_CTA_LABELS = { individual: 'UDC0CP6R-7IcEISajKEC', group: 'PoafCIGS-7IcEISajKEC' };
const adsConversion = (label) => { if (adsOn) gtag('event', 'conversion', { send_to: `${ADS_CONVERSION.id}/${label}` }); };
// Email, social-profile and free-session button clicks.
document.addEventListener('click', (e) => {
  const link = e.target.closest?.('a[href]');
  const href = link?.getAttribute('href') || '';
  const cta = link?.dataset.cta;
  if (cta && ADS_CTA_LABELS[cta]) {
    adsConversion(ADS_CTA_LABELS[cta]);
    gaEvent(`cta_free_${cta}_session`);
  }
  if (href.startsWith('mailto:')) { adsConversion(ADS_EMAIL_LABEL); gaEvent('email_contact'); }
  else if (/^https:\/\/(www\.)?(facebook|instagram|linkedin)\.com\//.test(href)) gaEvent('outbound_social', { link_url: href });
});

(() => {
  const header = document.querySelector('[data-header]');
  const toggle = document.querySelector('[data-menu-toggle]');

  // Header shadow once the page scrolls.
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu.
  const setMenu = (open) => {
    document.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  toggle.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
  document.querySelectorAll('[data-nav] a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => e.key === 'Escape' && setMenu(false));

  // Phone links: tapping opens a small Call / Text menu instead of dialling straight away.
  const telLinks = document.querySelectorAll('a[href^="tel:"]');
  if (telLinks.length) {
    const phoneIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 3.5h2.8l1.4 4.2-2 1.4a11 11 0 0 0 6.1 6.1l1.4-2 4.2 1.4v2.8a2 2 0 0 1-2.1 2A16.5 16.5 0 0 1 4.6 5.6a2 2 0 0 1 2-2.1Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>';
    const textIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>';
    const menu = document.createElement('div');
    menu.className = 'phone-menu';
    menu.setAttribute('role', 'menu');
    menu.hidden = true;
    document.body.append(menu);
    let opener = null;

    const closeMenu = (refocus) => {
      if (!opener) return;
      menu.hidden = true;
      opener.setAttribute('aria-expanded', 'false');
      if (refocus) opener.focus();
      opener = null;
    };
    const openMenu = (link, viaKeyboard) => {
      const num = link.getAttribute('href').slice(4);
      menu.innerHTML = `<a role="menuitem" href="tel:${num}">${phoneIcon}Call</a><a role="menuitem" href="sms:${num}">${textIcon}Text</a>`;
      menu.hidden = false;
      const r = link.getBoundingClientRect();
      const left = Math.max(12, Math.min(r.left + r.width / 2 - menu.offsetWidth / 2, window.innerWidth - menu.offsetWidth - 12));
      let top = r.bottom + 8;
      if (top + menu.offsetHeight > window.innerHeight - 12) top = r.top - menu.offsetHeight - 8;
      menu.style.left = `${left}px`;
      menu.style.top = `${top}px`;
      opener = link;
      link.setAttribute('aria-expanded', 'true');
      if (viaKeyboard) menu.querySelector('a').focus();
    };

    telLinks.forEach((link) => {
      link.setAttribute('aria-haspopup', 'menu');
      link.setAttribute('aria-expanded', 'false');
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const wasOpen = opener === link;
        closeMenu();
        if (!wasOpen) openMenu(link, e.detail === 0);
      });
    });
    menu.addEventListener('click', (e) => {
      const href = e.target.closest('a')?.getAttribute('href') || '';
      if (href.startsWith('tel:')) trackContact(ADS_CALL_LABEL);
      else if (href.startsWith('sms:')) trackContact(ADS_TEXT_LABEL);
      closeMenu();
    });
    document.addEventListener('click', (e) => { if (opener && !menu.contains(e.target) && !opener.contains(e.target)) closeMenu(); });
    document.addEventListener('keydown', (e) => e.key === 'Escape' && closeMenu(true));
    window.addEventListener('scroll', () => closeMenu(), { passive: true });
    window.addEventListener('resize', () => closeMenu());
  }

  // Smooth-scroll in-page links, but not the jump when arriving on a #link.
  const smooth = () => document.documentElement.classList.add('smooth-scroll');
  ['pointerdown', 'keydown'].forEach((t) => window.addEventListener(t, smooth, { once: true, capture: true }));

  // Gentle reveal-on-scroll for major blocks.
  if ('IntersectionObserver' in window) {
    // Arriving on a #link: show that section (and everything above it) without the fade-in.
    let arrivedAt = null;
    try { arrivedAt = location.hash && document.querySelector(decodeURIComponent(location.hash)); } catch {}
    const skip = (el) => arrivedAt && (arrivedAt.contains(el) || (el.compareDocumentPosition(arrivedAt) & Node.DOCUMENT_POSITION_FOLLOWING));
    const targets = [...document.querySelectorAll('.split, .benefit, .steps li, .t-card, .service-card, .media-item, .cta-band, .form-card')].filter((t) => !skip(t));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -60px 0px' });
    targets.forEach((t) => { t.classList.add('reveal'); io.observe(t); });
  }

  // Click-to-load YouTube embeds (keeps the media page fast).
  document.querySelectorAll('[data-yt]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const f = document.createElement('iframe');
      f.src = `https://www.youtube-nocookie.com/embed/${btn.dataset.yt}?autoplay=1&rel=0`;
      f.title = btn.getAttribute('aria-label').replace('Play video: ', '');
      f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      f.allowFullscreen = true;
      btn.replaceWith(f);
    });
  });

  // Podcast page: list recent episodes from the show's public feed (the Spotify player only shows the latest).
  const episodes = document.querySelector('[data-episodes]');
  if (episodes) {
    const arrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const duration = (d) => {
      const secs = d.split(':').reduce((t, n) => t * 60 + Number(n), 0);
      const h = Math.floor(secs / 3600);
      const m = Math.round((secs % 3600) / 60);
      return h ? `${h} hr ${m} min` : `${m} min`;
    };
    fetch('https://anchor.fm/s/2c0d9298/podcast/rss')
      .then((r) => (r.ok ? r.text() : Promise.reject()))
      .then((xml) => {
        const items = [...new DOMParser().parseFromString(xml, 'text/xml').querySelectorAll('item')].slice(1, 9);
        const list = episodes.querySelector('[data-episode-list]');
        items.forEach((item) => {
          const get = (tag) => item.getElementsByTagName(tag)[0]?.textContent.trim() || '';
          const link = get('link');
          if (!link.startsWith('https://')) return;
          const date = new Date(get('pubDate')).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          const len = get('itunes:duration');
          const li = document.createElement('li');
          li.innerHTML = `<div><strong></strong><span></span></div><a class="text-link" target="_blank" rel="noopener">Listen ${arrow}</a>`;
          li.querySelector('strong').textContent = get('title');
          li.querySelector('span').textContent = /^[\d:]+$/.test(len) ? `${date} · ${duration(len)}` : date;
          li.querySelector('a').href = link;
          list.append(li);
        });
        if (list.children.length) episodes.hidden = false;
      })
      .catch(() => {});
  }

  // Media filters.
  const grid = document.querySelector('[data-media-grid]');
  if (grid) {
    const buttons = document.querySelectorAll('[data-filter]');
    buttons.forEach((b) => b.addEventListener('click', () => {
      buttons.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      const f = b.dataset.filter;
      grid.querySelectorAll('.media-item').forEach((item) => {
        const tag = item.querySelector('.tag').textContent;
        const match = f === 'All' || tag === f || (f === 'Talk' && tag === 'Panel') || (f === 'Radio' && tag === 'Interview');
        item.hidden = !match;
      });
    }));
  }

  // Intro-session form.
  const form = document.querySelector('[data-intro-form]');
  if (form) {
    const status = form.querySelector('[data-form-status]');
    const submitBtn = form.querySelector('[type="submit"]');
    let sending = false;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      // Ignore repeat clicks/taps while a request is already being sent.
      if (sending) return;
      let ok = true;
      form.querySelectorAll('[required]').forEach((el) => {
        const bad = !el.value.trim() || (el.type === 'email' && !/^\S+@\S+\.\S+$/.test(el.value));
        el.closest('.field').classList.toggle('invalid', bad);
        if (bad) ok = false;
      });
      status.className = 'form-status';
      if (!ok) { status.textContent = 'Please fill in the highlighted fields.'; status.classList.add('err'); return; }
      if (form.botcheck && form.botcheck.checked) return;

      const data = new FormData(form);
      if (form.action && form.getAttribute('action')) {
        sending = true;
        submitBtn.disabled = true;
        submitBtn.setAttribute('aria-busy', 'true');
        status.textContent = 'Sending…';
        try {
          const r = await fetch(form.action, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
          const res = await r.json().catch(() => ({}));
          if (!r.ok || res.success === false) throw new Error();
          const userData = leadUserData(data.get('email'), data.get('phone'));
          form.reset();
          // Forms with data-thanks go to that thank-you page once the request is sent.
          const thanks = form.dataset.thanks;
          trackLead(thanks ? () => { location.href = thanks; } : undefined, form.dataset.adsConversion !== 'off', form.dataset.gaEvent || 'generate_lead', userData);
          status.textContent = form.dataset.success || 'Thanks! Josh will be in touch soon to schedule your free session.';
          status.classList.add('ok');
        } catch {
          status.textContent = 'Something went wrong. Please email Josh@TiebreakerPsych.com or call/text (203) 814-0342.';
          status.classList.add('err');
        } finally {
          sending = false;
          submitBtn.disabled = false;
          submitBtn.removeAttribute('aria-busy');
        }
        return;
      }
      // No form backend configured: hand off to the visitor's email client.
      const body = [
        `Name: ${data.get('full-name')}`,
        `Email: ${data.get('email')}`,
        `Phone: ${data.get('phone') || '-'}`,
        `Sport: ${data.get('sport')}`,
        '',
        data.get('message'),
      ].join('\n');
      location.href = `mailto:Josh@TiebreakerPsych.com?subject=${encodeURIComponent('Free intro session request')}&body=${encodeURIComponent(body)}`;
      status.textContent = 'Opening your email app to send your request…';
      status.classList.add('ok');
    });
  }
})();
