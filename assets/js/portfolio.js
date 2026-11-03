(() => {
  const header = document.querySelector('.folio-header');
  const menu = document.querySelector('[data-folio-menu]');
  const nav = document.querySelector('.folio-nav');
  const closeMenu = () => {
    header?.classList.remove('menu-open');
    menu?.setAttribute('aria-expanded', 'false');
    menu?.setAttribute('aria-label', 'Open navigation');
    if (menu) menu.textContent = '☰';
  };
  menu?.addEventListener('click', () => {
    const open = !header.classList.contains('menu-open');
    header.classList.toggle('menu-open', open);
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    menu.textContent = open ? '×' : '☰';
  });
  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && header?.classList.contains('menu-open')) {
      closeMenu();
      menu?.focus();
    }
  });
  window.addEventListener('resize', () => { if (window.innerWidth > 720) closeMenu(); });
  const descriptions = {
    capture: 'A website form validates the request and passes the agreed fields through a Cloudflare Worker to the private CRM API. The browser never receives the shared server token.',
    review: 'An inquiry appears in PostgreSQL-backed review and pipeline views. Incoming email is stored for review rather than answered automatically.',
    draft: 'AI prepares an editable proposal from customer context. Structured output is validated; a local template is available when AI is unavailable.',
    approve: 'Only explicitly approved queue items can trigger an outbound action. Drafting, approval, and execution remain separate steps.'
  };
  const buttons = [...document.querySelectorAll('[data-workflow-step]')];
  const description = document.querySelector('[data-workflow-description]');
  buttons.forEach(button => button.addEventListener('click', () => {
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    description.textContent = descriptions[button.dataset.workflowStep];
  }));
})();
