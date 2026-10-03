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
    menu.addEventListener('click', () => closeMenu());
    document.addEventListener('click', (e) => { if (opener && !menu.contains(e.target) && !opener.contains(e.target)) closeMenu(); });
    document.addEventListener('keydown', (e) => e.key === 'Escape' && closeMenu(true));
    window.addEventListener('scroll', () => closeMenu(), { passive: true });
    window.addEventListener('resize', () => closeMenu());
  }

  // Gentle reveal-on-scroll for major blocks.
  if ('IntersectionObserver' in window) {
    const targets = document.querySelectorAll('.split, .benefit, .steps li, .t-card, .service-card, .media-item, .cta-band, .form-card');
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
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
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
        try {
          const r = await fetch(form.action, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
          const res = await r.json().catch(() => ({}));
          if (!r.ok || res.success === false) throw new Error();
          form.reset();
          status.textContent = 'Thanks! Josh will be in touch soon to schedule your free session.';
          status.classList.add('ok');
        } catch {
          status.textContent = 'Something went wrong. Please email Josh@TiebreakerPsych.com or call/text (203) 814-0342.';
          status.classList.add('err');
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
