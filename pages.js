// Inner pages: fills school details and sends forms to WhatsApp (no backend needed).
// SCHOOL comes from script.js.
document.querySelectorAll('[data-school]').forEach(el => {
  const k = el.dataset.school;
  if (k === 'phone')    { el.textContent = SCHOOL.phone; el.href = 'tel:' + SCHOOL.phone.replace(/\s/g, ''); }
  if (k === 'email')    { el.textContent = SCHOOL.email; el.href = 'mailto:' + SCHOOL.email; }
  if (k === 'whatsapp') { el.href = 'https://wa.me/' + SCHOOL.whatsapp; }
  if (k === 'address')  { el.textContent = SCHOOL.address; }
});

document.querySelectorAll('form[data-wa]').forEach(form => {
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const lines = [form.dataset.wa];
    new FormData(form).forEach((v, k) => {
      const field = form.elements[k];
      if (String(v).trim()) lines.push(`${field.dataset.label || k}: ${v}`);
    });
    window.open('https://wa.me/' + SCHOOL.whatsapp + '?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
  });
});
