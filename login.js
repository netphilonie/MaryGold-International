// Login pages: show/hide password and placeholder feedback.
// The real login needs a backend (phase 2). Replace the setTimeout with the real request then.
const form = document.getElementById('login-form');
const pass = document.getElementById('pass');
const show = document.querySelector('.show');
const msg = document.getElementById('msg');
const btn = form.querySelector('[type=submit]');

show.addEventListener('click', () => {
  const reveal = pass.type === 'password';
  pass.type = reveal ? 'text' : 'password';
  show.textContent = reveal ? 'Hide' : 'Show';
  show.setAttribute('aria-pressed', reveal);
});
form.addEventListener('input', e => e.target.removeAttribute('aria-invalid'));

form.addEventListener('submit', e => {
  e.preventDefault();
  const user = form.elements.user;
  const missing = [user, pass].filter(f => !f.value.trim());
  if (missing.length) {
    missing.forEach(f => f.setAttribute('aria-invalid', 'true'));
    missing[0].focus();
    showStatus(msg, 'error', 'Please enter your ID and password to continue.');
    return;
  }
  btn.disabled = true; btn.textContent = 'Please wait...';
  showStatus(msg, 'loading', 'Checking your details. Kindly wait a moment.');
  setTimeout(() => {
    showStatus(msg, 'info', '<strong>The portal is not live yet.</strong> Logins will work once the school’s system is connected.');
    btn.disabled = false; btn.textContent = 'Log in';
  }, 900);
});
