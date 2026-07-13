(() => {
  const form = document.querySelector('[data-contact-form]');
  const status = document.querySelector('[data-form-status]');
  const endpoint = window.PHYLIA_FORM_ENDPOINT || '';

  if (!form) return;

  const show = (message, ok = false) => {
    if (!status) return;
    status.textContent = message;
    status.className = ok ? 'form-status success' : 'form-status';
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const data = Object.fromEntries(new FormData(form).entries());

    if (!endpoint) {
      const body = Object.entries(data)
        .filter(([, value]) => String(value || '').trim())
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n\n');

      const mailto = `mailto:phyliaconsulting@gmail.com?subject=${encodeURIComponent('Phylia project inquiry')}&body=${encodeURIComponent(body)}`;
      show('The online form is temporarily unavailable. Opening your email app instead.', true);
      window.location.href = mailto;
      return;
    }

    try {
      show('Sending...');

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      form.reset();
      show('Thank you. Your project request was sent.', true);
    } catch (error) {
      show('Something went wrong. Please email Joanna directly or try again later.');
    }
  });
})();