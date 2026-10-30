// Login pages: drop down status bar, shake, and lockout countdown.
// The real login needs a backend (phase 2). When the server exists, set API_URL below.
const API_URL = '';   // later, for example: 'https://your-server.com/api/login'
const DEMO = false;   // true = fake server on YOUR laptop to test the bar, shake and lockout. Keep false when live.

const role = document.querySelector('main.login').classList[1];   // student, parent or staff
const form = document.getElementById('login-form');
const card = document.querySelector('.login-card');
const pass = document.getElementById('pass');
const show = document.querySelector('.show');
const btn = form.querySelector('[type=submit]');
const idle = btn.textContent;
const siteHeader = document.getElementById('site-header');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const LOCK_KEY = 'mg-lock-' + role;
const wait = ms => new Promise(r => setTimeout(r, ms));
const fmt = s => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');

/* Show or hide password */
show.addEventListener('click', () => {
  const reveal = pass.type === 'password';
  pass.type = reveal ? 'text' : 'password';
  show.textContent = reveal ? 'Hide' : 'Show';
  show.setAttribute('aria-pressed', reveal);
});
form.addEventListener('input', e => e.target.removeAttribute('aria-invalid'));

/* Status bar: drops from under the header, lands over the tabs, lifts after 4.5 seconds */
const bar = document.createElement('div');
bar.className = 'drop-bar'; bar.hidden = true;
bar.setAttribute('role', 'status'); bar.setAttribute('aria-live', 'polite');
document.body.appendChild(bar);
const ICONS = { loading: '', success: '&#10003;', error: '!', warn: '!', info: 'i' };
let hideTimer = null, anim = null, visible = false;

function place() {                       // returns the bottom edge of the header
  const tabs = document.querySelector('.roles').getBoundingClientRect();
  const hb = siteHeader.getBoundingClientRect().bottom;
  bar.style.left = tabs.left + 'px';
  bar.style.width = tabs.width + 'px';
  bar.style.top = Math.max(tabs.top, hb + 8) + 'px';
  return hb;
}
function drop(type, html, ms = 4500) {   // ms = 0 keeps the bar until the next message
  clearTimeout(hideTimer);
  if (anim) { anim.cancel(); anim = null; }
  bar.className = 'drop-bar ' + type;
  bar.innerHTML = `<span class="ic" aria-hidden="true">${ICONS[type]}</span><span>${html}</span>`;
  const hb = place();
  if (!visible) {
    visible = true; bar.hidden = false;
    if (!reduce) {
      const from = hb - parseFloat(bar.style.top) - bar.offsetHeight;
      anim = bar.animate([{ transform: `translateY(${from}px)`, opacity: .4 }, { transform: 'none', opacity: 1 }],
                         { duration: 380, easing: 'cubic-bezier(.2,.8,.2,1)' });
    }
  }
  if (ms) hideTimer = setTimeout(lift, ms);
}
function lift() {
  const done = () => { bar.hidden = true; visible = false; anim = null; };
  if (reduce) return done();
  const to = siteHeader.getBoundingClientRect().bottom - parseFloat(bar.style.top) - bar.offsetHeight;
  anim = bar.animate([{ transform: 'none', opacity: 1 }, { transform: `translateY(${to}px)`, opacity: .4 }],
                     { duration: 300, easing: 'ease-in' });
  anim.onfinish = done;
}

/* Shake the card */
function shakeCard() {
  if (reduce) return;
  card.classList.remove('is-shaking'); void card.offsetWidth; card.classList.add('is-shaking');
  card.addEventListener('animationend', () => card.classList.remove('is-shaking'), { once: true });
}

/* Lockout after too many attempts. The SERVER counts the attempts; this only shows the countdown. */
let lockTimer = null;
function startLock(seconds, announce) {
  const until = Date.now() + seconds * 1000;
  try { localStorage.setItem(LOCK_KEY, until); } catch (e) {}
  tickLock(until, announce);
}
function tickLock(until, announce) {
  clearInterval(lockTimer);
  const update = () => {
    const left = Math.ceil((until - Date.now()) / 1000);
    if (left <= 0) {
      clearInterval(lockTimer); btn.disabled = false; btn.textContent = idle;
      try { localStorage.removeItem(LOCK_KEY); } catch (e) {}
      return;
    }
    btn.disabled = true; btn.textContent = 'Try again in ' + fmt(left);
    const c = document.getElementById('lock-count'); if (c) c.textContent = fmt(left);
  };
  update();
  lockTimer = setInterval(update, 1000);
  if (announce) drop('warn', `<strong>Too many attempts.</strong> For your security, please wait <span id="lock-count">${fmt(Math.ceil((until - Date.now()) / 1000))}</span> before trying again.`);
}
try { const u = Number(localStorage.getItem(LOCK_KEY)); if (u > Date.now()) tickLock(u, false); } catch (e) {}

/* Talking to the server. Returns {status: ok | invalid | locked | server | offline}. A network failure throws. */
let demoFails = 0;
async function requestLogin(id, password) {
  if (DEMO) {                                     // fake server: type "offline" as the ID to test a network failure
    await wait(700);
    if (id.toLowerCase() === 'offline') throw new Error('network');
    demoFails++;
    if (demoFails >= 6) { demoFails = 0; return { status: 'locked', retryAfter: 30 }; }
    return { status: 'invalid' };
  }
  if (!API_URL) return { status: 'offline' };     // no server yet
  const r = await fetch(API_URL, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
    body: JSON.stringify({ role, id, password })
  });
  if (r.ok) { const d = await r.json().catch(() => ({})); return { status: 'ok', redirect: d.redirect || '/' }; }
  if (r.status === 401) return { status: 'invalid' };
  if (r.status === 429) { const d = await r.json().catch(() => ({})); return { status: 'locked', retryAfter: d.retryAfter || 300 }; }
  return { status: 'server' };
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  if (btn.disabled) return;
  const user = form.elements.user;
  const missing = [user, pass].filter(f => !f.value.trim());
  if (missing.length) {
    missing.forEach(f => f.setAttribute('aria-invalid', 'true'));
    missing[0].focus();
    drop('error', 'Please enter your ID and password to continue.');
    return;
  }
  btn.disabled = true; btn.textContent = 'Please wait...';
  drop('loading', 'Checking your details. Kindly wait a moment.', 0);

  let res;
  try { res = await requestLogin(user.value.trim(), pass.value); }
  catch (err) { res = { status: 'network' }; }
  btn.disabled = false; btn.textContent = idle;

  switch (res.status) {
    case 'ok':
      drop('success', 'Welcome back. Taking you to your dashboard.', 0);
      setTimeout(() => { location.href = res.redirect; }, 900);
      break;
    case 'invalid':
      [user, pass].forEach(f => f.setAttribute('aria-invalid', 'true'));
      shakeCard();
      drop('error', '<strong>Incorrect ID or password.</strong> Please check and try again.');
      pass.focus(); pass.select();
      break;
    case 'locked':
      startLock(res.retryAfter, true);
      break;
    case 'network':
      drop('error', '<strong>We couldn’t reach the server.</strong> Check your internet connection and try again.');
      break;
    case 'server':
      drop('error', '<strong>Something went wrong on our side.</strong> Please try again shortly.');
      break;
    default:
      drop('info', '<strong>The portal is not live yet.</strong> Logins will work once the school’s system is connected.');
  }
});
