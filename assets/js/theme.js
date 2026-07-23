(() => {
  const root = document.documentElement;
  const saved = localStorage.getItem('phylia-theme');
  if (saved) root.dataset.theme = saved;
  const button = document.querySelector('[data-theme-toggle]');
  const sync = () => {
    if (!button) return;
    const dark = root.dataset.theme === 'dark';
    button.textContent = dark ? 'Light mode' : 'Dark mode';
    button.setAttribute('aria-pressed', String(dark));
  };
  sync();
  button?.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('phylia-theme', root.dataset.theme);
    sync();
  });

  const backToTop = document.querySelector('[data-back-to-top]');
  const syncBackToTop = () => {
    if (!backToTop) return;
    const visible = window.scrollY > Math.max(500, window.innerHeight * 0.75);
    backToTop.classList.toggle('is-visible', visible);
    backToTop.setAttribute('aria-hidden', String(!visible));
    backToTop.tabIndex = visible ? 0 : -1;
  };
  syncBackToTop();
  window.addEventListener('scroll', syncBackToTop, { passive: true });

  const revealItems = document.querySelectorAll('[data-reveal]');
  if (!revealItems.length) return;

  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.16, rootMargin: '0px 0px -40px 0px' });

  revealItems.forEach((item) => revealObserver.observe(item));
})();
