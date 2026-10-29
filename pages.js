// Inner pages: fills school details and sends forms to WhatsApp (no backend needed).
// SCHOOL and showStatus come from script.js.
document.querySelectorAll('[data-school]').forEach(el => {
  const k = el.dataset.school;
  if (k === 'phone')    { el.textContent = SCHOOL.phone; el.href = 'tel:' + SCHOOL.phone.replace(/\s/g, ''); }
  if (k === 'email')    { el.textContent = SCHOOL.email; el.href = 'mailto:' + SCHOOL.email; }
  if (k === 'whatsapp') { el.href = 'https://wa.me/' + SCHOOL.whatsapp; }
  if (k === 'address')  { el.textContent = SCHOOL.address; }
});

document.querySelectorAll('form[data-wa]').forEach(form => {
  const status = form.querySelector('.status');
  const btn = form.querySelector('[type=submit]');
  const idle = btn.textContent;
  const kind = form.dataset.kind || 'message';

  form.addEventListener('input', e => e.target.removeAttribute('aria-invalid'));

  form.addEventListener('submit', e => {
    e.preventDefault();
    const bad = [...form.elements].filter(f => f.willValidate && !f.checkValidity());
    if (bad.length) {
      bad.forEach(f => f.setAttribute('aria-invalid', 'true'));
      bad[0].focus();
      showStatus(status, 'error', 'Please complete: ' + bad.map(f => f.dataset.label || f.name).join(', ') + '.');
      return;
    }
    const lines = [form.dataset.wa];
    new FormData(form).forEach((v, k) => {
      const f = form.elements[k];
      if (String(v).trim()) lines.push(`${f.dataset.label || k}: ${v}`);
    });
    const url = 'https://wa.me/' + SCHOOL.whatsapp + '?text=' + encodeURIComponent(lines.join('\n'));

    btn.disabled = true; btn.textContent = 'Please wait...';
    showStatus(status, 'loading', `Please wait while we prepare your ${kind}.`);
    window.open(url, '_blank', 'noopener');
    setTimeout(() => {
      showStatus(status, 'success',
        `<strong>Your ${kind} is ready.</strong> WhatsApp should open in a moment. If it doesn’t, <a href="${url}" target="_blank" rel="noopener">tap here to open it</a>.`);
      btn.disabled = false; btn.textContent = idle;
    }, 800);
  });
});
