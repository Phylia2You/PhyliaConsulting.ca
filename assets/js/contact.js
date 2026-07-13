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

  const collectValues = (formData, key) =>
    formData
      .getAll(key)
      .map((value) => String(value || '').trim())
      .filter(Boolean);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const helpNeeded = collectValues(formData, 'helpNeeded');
    const featuresNeeded = collectValues(formData, 'featuresNeeded');
    const existingAssets = collectValues(formData, 'existingAssets');

    const budgetRange = String(formData.get('budgetRange') || '').trim();
    const timeline = String(formData.get('timeline') || '').trim();
    const maintenanceInterest = String(formData.get('maintenanceInterest') || '').trim();

    const data = {
      businessName: String(formData.get('businessName') || '').trim(),
      contactName: String(formData.get('contactName') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      phone: String(formData.get('phone') || '').trim(),
      businessType: helpNeeded.length ? helpNeeded.join(', ') : 'Not specified',
      website: String(formData.get('website') || '').trim(),
      location: String(formData.get('location') || '').trim(),
      mainProblem: String(formData.get('mainProblem') || '').trim(),
      contactChannels: helpNeeded.length ? `Help requested: ${helpNeeded.join(', ')}` : '',
      commonQuestions: featuresNeeded.length ? `Possible features or outcomes: ${featuresNeeded.join(', ')}` : '',
      repeatedReplies: [
        featuresNeeded.length ? `Features considered: ${featuresNeeded.join(', ')}` : '',
        budgetRange ? `Approximate budget: ${budgetRange}` : '',
        timeline ? `Preferred timeline: ${timeline}` : ''
      ].filter(Boolean).join('\n'),
      followUpProcess: [
        timeline ? `Preferred timeline: ${timeline}` : '',
        maintenanceInterest ? `Ongoing website care: ${maintenanceInterest}` : ''
      ].filter(Boolean).join('\n'),
      toolsUsed: existingAssets.length ? `Existing assets or systems: ${existingAssets.join(', ')}` : '',
      preferredTone: String(formData.get('preferredTone') || '').trim(),
      caseStudyPermission: maintenanceInterest || 'Not sure yet',
      sensitiveTopics: String(formData.get('sensitiveTopics') || '').trim()
    };

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