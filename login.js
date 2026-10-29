// Login pages: show/hide password and a placeholder submit.
// The real login needs a backend (phase 2). Replace the submit handler then.
const form = document.getElementById('login-form');
const pass = document.getElementById('pass');
const show = document.querySelector('.show');
const msg = document.getElementById('msg');

show.addEventListener('click', () => {
  const reveal = pass.type === 'password';
  pass.type = reveal ? 'text' : 'password';
  show.textContent = reveal ? 'Hide' : 'Show';
  show.setAttribute('aria-pressed', reveal);
});

form.addEventListener('submit', e => {
  e.preventDefault();
  if (!form.elements.user.value.trim() || !pass.value) {
    msg.textContent = 'Please fill in both fields.';
    return;
  }
  msg.textContent = 'The portal is not live yet. Logins will work once the school’s system is connected.';
});
