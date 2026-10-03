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
      if (form._gotcha && form._gotcha.value) return;

      const data = new FormData(form);
      if (form.action && form.getAttribute('action')) {
        try {
          const r = await fetch(form.action, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
          if (!r.ok) throw new Error();
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
