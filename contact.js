'use strict';

(() => {
  document.querySelector('#year').textContent = new Date().getFullYear();
  const form = document.querySelector('#enquiry-form');
  const panel = document.querySelector('#email-draft-panel');
  const subject = document.querySelector('#draft-subject');
  const body = document.querySelector('#draft-body');
  const openEmail = document.querySelector('#open-email');
  const status = document.querySelector('#draft-status');

  function updateEmailLink() {
    openEmail.href = `mailto:info@cineharbor.space?subject=${encodeURIComponent(subject.value)}&body=${encodeURIComponent(body.value)}`;
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(form);
    const read = key => String(data.get(key) || '').trim();
    if (!read('idea') || !read('name')) {
      const field = document.querySelector(!read('idea') ? '#project-idea' : '#client-name');
      field.setCustomValidity('Please add a few words here.');
      field.reportValidity();
      field.addEventListener('input', () => field.setCustomValidity(''), { once: true });
      return;
    }
    const type = read('projectType');
    subject.value = type === 'Let’s discuss' ? 'Project enquiry — Cine Harbor' : `${type} enquiry — Cine Harbor`;
    const lines = ['Hello Cine Harbor,', '', `I’m ${read('name')}, and I’d like to discuss ${type === 'Let’s discuss' ? 'a project with you' : type === 'Commercials' ? 'a commercial project' : type === 'Films & Shorts' ? 'a film project' : 'a photography project'}.`, '', read('idea')];
    const details = [['dates', 'Dates'], ['location', 'Location'], ['budget', 'Approximate budget']].filter(([key]) => read(key));
    if (details.length) {
      lines.push('');
      details.forEach(([key, label]) => lines.push(`${label}: ${key === 'budget' ? '£' + read(key).replace(/^£\s*/, '') : read(key)}`));
    }
    lines.push('', 'Could we discuss how you might be able to help?', '', 'Best,', read('name'), read('email'));
    body.value = lines.join('\n');
    status.textContent = '';
    updateEmailLink();
    panel.hidden = false;
    document.querySelector('#draft-heading').focus({ preventScroll: true });
    panel.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  });

  subject.addEventListener('input', updateEmailLink);
  body.addEventListener('input', updateEmailLink);
  document.querySelector('#copy-draft').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(`To: info@cineharbor.space\nSubject: ${subject.value}\n\n${body.value}`);
      status.textContent = 'Draft copied. Paste it into your email app when you’re ready.';
    } catch {
      body.focus();
      body.select();
      status.textContent = 'Select and copy the message above, then email it to info@cineharbor.space.';
    }
  });
  document.querySelectorAll('[data-copy-value]').forEach(button => {
    button.addEventListener('click', async () => {
      const copyStatus = document.querySelector('#contact-copy-status');
      try {
        await navigator.clipboard.writeText(button.dataset.copyValue);
        copyStatus.textContent = `WeChat ID copied: ${button.dataset.copyValue}`;
      } catch {
        copyStatus.textContent = `WeChat ID: ${button.dataset.copyValue}. You can copy it manually.`;
      }
    });
  });
})();
