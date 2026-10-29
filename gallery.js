// Gallery: albums grid (layer 1), album panel (layer 2), photo viewer (layer 3).
// HOW TO ADD PHOTOS: put files in images/gallery/<album id>/ named 1.jpg, 2.jpg, 3.jpg ...
// Optional: cover.jpg for the tile, and small copies in a thumbs/ folder for faster loading.
// Then set "count" below to the number of photos in that album.
const ALBUMS = [
  { id: 'interhouse-sports', title: 'Interhouse Sports', count: 5 },
  { id: 'graduation',        title: 'Graduation',        count: 4 },
  { id: 'prom',              title: 'Prom',              count: 4 },
  { id: 'cultural-day',      title: 'Cultural Day',      count: 4 },
  { id: 'prize-giving-day',  title: 'Prize Giving Day',  count: 4 },
  { id: 'independence-day',  title: 'Independence Day',  count: 4 },
  { id: 'science-fair',      title: 'Science Fair',      count: 4 },
  { id: 'christmas-carol',   title: 'Christmas Carol',   count: 4 },
  { id: 'excursions',        title: 'Excursions',        count: 4 },
  { id: 'boarders-night',    title: 'Boarders’ Night',   count: 4 }
];
const PAIRS = [['#12294D','#1F5C3A'],['#E07B00','#F2A900'],['#1F5C3A','#12294D'],['#12294D','#E07B00'],['#F2A900','#1F5C3A']];

const $ = id => document.getElementById(id);
const grid = $('albums'), overlay = $('overlay'), panel = $('panel'), body = $('p-body');
const lb = $('lb'), lbImg = $('lb-img'), lbMissing = $('lb-missing'), lbCap = $('lb-cap');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const background = [$('site-header'), document.querySelector('main'), $('site-footer')].filter(Boolean);
const full  = (a, n) => `images/gallery/${a.id}/${n}.jpg`;
const thumb = (a, n) => `images/gallery/${a.id}/thumbs/${n}.jpg`;
let cur = null, idx = 0, lastTile = null, pushedA = false, pushedL = false, touchX = 0;

function lock(on) {
  document.body.style.overflow = on ? 'hidden' : '';
  background.forEach(el => { el.inert = on; });
}

/* Layer 1: tiles */
ALBUMS.forEach((a, i) => {
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'album'; b.dataset.id = a.id;
  b.style.setProperty('--c1', PAIRS[i % PAIRS.length][0]);
  b.style.setProperty('--c2', PAIRS[i % PAIRS.length][1]);
  b.innerHTML = `<img src="images/gallery/${a.id}/cover.jpg" alt="" loading="lazy" decoding="async"><span><b>${a.title}</b><small>${a.count} photos</small></span>`;
  b.querySelector('img').onerror = e => e.target.remove();
  b.onclick = () => openAlbum(a.id, { tile: b, push: true });
  grid.appendChild(b);
});

/* Layer 2: album */
function flip(tile) {
  const t = tile.getBoundingClientRect(), p = panel.getBoundingClientRect();
  const dx = t.left - p.left + (t.width - p.width) / 2, dy = t.top - p.top + (t.height - p.height) / 2;
  panel.animate(
    [{ transform: `translate(${dx}px,${dy}px) scale(${t.width / p.width},${t.height / p.height})`, opacity: .3 },
     { transform: 'none', opacity: 1 }],
    { duration: 380, easing: 'cubic-bezier(.2,.8,.2,1)' });
}
function openAlbum(id, { tile = null, push = false } = {}) {
  const a = ALBUMS.find(x => x.id === id);
  if (!a) return;
  cur = a; lastTile = tile || grid.querySelector(`[data-id="${id}"]`);
  $('p-title').textContent = a.title;
  $('p-meta').textContent = `${a.count} photos`;
  body.innerHTML = ''; body.scrollTop = 0;
  for (let n = 1; n <= a.count; n++) {
    const c = document.createElement('button');
    c.type = 'button'; c.className = 'ph-cell';
    c.setAttribute('aria-label', `Open photo ${n} of ${a.count}`);
    const im = new Image();
    im.loading = 'lazy'; im.decoding = 'async'; im.alt = ''; im.src = thumb(a, n);
    im.onerror = () => { if (im.dataset.f) im.remove(); else { im.dataset.f = 1; im.src = full(a, n); } };
    c.appendChild(im);
    c.onclick = () => openLightbox(n - 1, { push: true });
    body.appendChild(c);
  }
  overlay.hidden = false; lock(true);
  if (push) { history.pushState({ album: id, layer: 2 }, '', '#' + id); pushedA = true; }
  if (!reduce && lastTile) flip(lastTile);
  $('p-close').focus({ preventScroll: true });
}
function hideAlbum() {
  if (overlay.hidden) return;
  const done = () => { overlay.hidden = true; lock(false); cur = null; if (lastTile) lastTile.focus({ preventScroll: true }); };
  if (reduce) done();
  else panel.animate([{ transform: 'none', opacity: 1 }, { transform: 'scale(.97)', opacity: 0 }], { duration: 160 }).onfinish = done;
}
function closeAlbum() {
  if (pushedA) { history.back(); return; }
  hideAlbum();
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
}

/* Layer 3: photo viewer */
function showPhoto() {
  const n = idx + 1;
  lbMissing.hidden = true; lbImg.hidden = false;
  lbImg.alt = `${cur.title}, photo ${n}`;
  lbImg.onerror = () => { lbImg.hidden = true; lbMissing.hidden = false; };
  lbImg.src = full(cur, n);
  lbCap.textContent = `${cur.title}, ${n} of ${cur.count}`;
}
function openLightbox(i, { push = false } = {}) {
  if (!cur) return;
  idx = (i + cur.count) % cur.count;
  lb.hidden = false; showPhoto();
  if (push) { history.pushState({ album: cur.id, layer: 3, i: idx }, '', '#' + cur.id); pushedL = true; }
  $('lb-close').focus({ preventScroll: true });
}
function step(d) {
  idx = (idx + d + cur.count) % cur.count; showPhoto();
  if (pushedL) history.replaceState({ album: cur.id, layer: 3, i: idx }, '', '#' + cur.id);
}
function hideLightbox() { lb.hidden = true; pushedL = false; }
function closeLightbox() { if (pushedL) history.back(); else hideLightbox(); }

/* Controls */
$('p-close').onclick = closeAlbum;
$('lb-close').onclick = closeLightbox;
$('lb-prev').onclick = () => step(-1);
$('lb-next').onclick = () => step(1);
overlay.addEventListener('click', e => { if (e.target === overlay) closeAlbum(); });
lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });
lb.addEventListener('touchstart', e => { touchX = e.changedTouches[0].clientX; }, { passive: true });
lb.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
});
addEventListener('keydown', e => {
  if (!lb.hidden) {
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'ArrowLeft') step(-1);
  } else if (!overlay.hidden && e.key === 'Escape') closeAlbum();
});

/* Back button: closes the top layer first, then leaves the page */
addEventListener('popstate', e => {
  const s = e.state || {};
  if (s.layer === 3) {
    if (overlay.hidden) openAlbum(s.album);
    pushedA = true; pushedL = true; openLightbox(s.i || 0);
    return;
  }
  pushedL = false; hideLightbox();
  if (s.layer === 2) {
    pushedA = true;
    if (overlay.hidden || !cur || cur.id !== s.album) openAlbum(s.album);
    return;
  }
  pushedA = false; hideAlbum();
});

/* Shared link such as gallery.html#prom opens that album straight away */
const start = location.hash.slice(1);
if (ALBUMS.some(a => a.id === start)) {
  history.replaceState({ album: start, layer: 2 }, '', '#' + start);
  openAlbum(start);
}
