// Marygold International School: shared header, footer and menu behaviour.
// EDIT THE DETAILS BELOW. They update on every page.
const SCHOOL = {
  name: 'Marygold International School',
  address: '58 Station Road, Elelenwo, Port Harcourt',
  phone: '+234 901 921 9614',          // replace with the school number
  whatsapp: '2349019219614',           // digits only, with country code
  email: 'oniphilebex@gmail.com'            // replace with the school email
};

const PAGES = [
  ['About', 'about.html'], ['Academics', 'academics.html'], ['Departments', 'departments.html'],
  ['Boarding', 'boarding.html'], ['Admissions', 'admissions.html'], ['Gallery', 'gallery.html'],
  ['Contact', 'contact.html']
];
const current = location.pathname.split('/').pop() || 'index.html';

const links = PAGES.map(([label, href]) =>
  `<li><a href="${href}"${href === current ? ' aria-current="page"' : ''}>${label}</a></li>`).join('');

const header = document.getElementById('site-header');
if (header) {
  header.innerHTML = `
  <div class="wrap nav">
    <a class="brand" href="index.html" aria-label="${SCHOOL.name} home"><img src="images/marygold-logo.svg" alt="${SCHOOL.name}"></a>
    <ul class="menu" id="menu">${links}<li class="only-m"><a href="admissions.html">Apply now</a></li></ul>
    <div class="actions">
      <div class="dd" id="dd">
        <button class="btn btn-line" id="dd-btn" aria-expanded="false" aria-haspopup="true">Login</button>
        <div class="dd-panel glass" role="menu">
          <a href="student-login.html" role="menuitem">Student login</a>
          <a href="parent-login.html" role="menuitem">Parent login</a>
          <a href="staff-login.html" role="menuitem">Staff login</a>
        </div>
      </div>
      <a class="btn btn-gold" href="admissions.html">Apply now</a>
      <button class="burger" id="burger" aria-label="Open menu" aria-expanded="false">&#9776;</button>
    </div>
  </div>`;
}

const footer = document.getElementById('site-footer');
if (footer) {
  footer.innerHTML = `
  <div class="wrap">
    <div class="foot">
      <div>
        <div class="foot-brand"><img src="images/marygold-icon.svg" alt=""><span>${SCHOOL.name}</span></div>
        <p>Solid Foundation</p>
      </div>
      <div><h4>Explore</h4><ul>${links}</ul></div>
      <div><h4>Find us</h4><ul>
        <li>${SCHOOL.address}</li>
        <li><a href="tel:${SCHOOL.phone.replace(/\s/g, '')}">${SCHOOL.phone}</a></li>
        <li><a href="mailto:${SCHOOL.email}">${SCHOOL.email}</a></li>
      </ul></div>
    </div>
    <p class="copy">&copy; ${new Date().getFullYear()} ${SCHOOL.name}. All rights reserved.</p>
  </div>`;
}

document.body.insertAdjacentHTML('beforeend',
  `<a class="wa" href="https://wa.me/${SCHOOL.whatsapp}" target="_blank" rel="noopener">WhatsApp us</a>`);

// Menu and Login dropdown: tap or click to open, Esc or outside tap to close
const menu = document.getElementById('menu'), burger = document.getElementById('burger');
const dd = document.getElementById('dd'), ddBtn = document.getElementById('dd-btn');
function closeAll() {
  if (menu) menu.classList.remove('open');
  if (burger) burger.setAttribute('aria-expanded', 'false');
  if (dd) dd.classList.remove('open');
  if (ddBtn) ddBtn.setAttribute('aria-expanded', 'false');
}
if (burger) burger.addEventListener('click', e => {
  e.stopPropagation();
  const open = !menu.classList.contains('open');
  closeAll();
  menu.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', open);
});
if (ddBtn) ddBtn.addEventListener('click', e => {
  e.stopPropagation();
  const open = !dd.classList.contains('open');
  closeAll();
  dd.classList.toggle('open', open);
  ddBtn.setAttribute('aria-expanded', open);
});
document.addEventListener('click', e => { if (!e.target.closest('.dd-panel')) closeAll(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });

// Form feedback: type is 'loading', 'success', 'error' or 'info'.
function showStatus(el, type, html) {
  if (!el) return;
  const icons = { loading: '', success: '&#10003;', error: '!', info: 'i' };
  el.className = 'status show ' + type;
  el.innerHTML = `<span class="ic" aria-hidden="true">${icons[type]}</span><span>${html}</span>`;
}
