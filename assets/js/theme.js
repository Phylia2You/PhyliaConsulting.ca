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
})();
