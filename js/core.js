/* ===== core: data, helpers, saved notes ===== */
const SITE = window.SITE || { chapters: [], subs: [], stories: [] };
const STORIES = SITE.stories.slice().sort((a, b) => a.n - b.n);
const BY = {}; STORIES.forEach(d => BY[d.n] = d);
const NYC_DB = STORIES.filter(d => d.nyc);
const $ = s => document.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = n => String(n).padStart(3, '0');
const pp = d => d.pages[0] == d.pages[1] ? `PDF p. ${d.pages[0]}` : `PDF pp. ${d.pages[0]}–${d.pages[1]}`;
const chap = s => s.charAt(0) + s.slice(1).toLowerCase();
const PST = { cross: 'CROSS-CHECKED, 2 SOURCES', wikipedia: 'WIKIPEDIA COORDINATES', estimated: 'ESTIMATED', area: 'AREA CENTRE' };
const hay = d => d._h || (d._h = [d.title, d.kicker, d.orig, d.sub, d.chapter, d.summary, d.fn, d.take, d.look, d.clues.join(' '),
  d.places.map(p => [p.spec, p.hood, p.city, p.country].join(' ')).join(' '), d.kw.join(' '), d.layerB.map(b => b.claim).join(' ')].join(' ').toLowerCase());

/* ----- saved notes (localStorage, always wrapped: it can be blocked or empty) ----- */
const NKEY = 'inyc-notes-v2';
let store = { saved: [], sightings: [] };
(function load() {
  try {
    const raw = localStorage.getItem(NKEY);
    if (raw) { const j = JSON.parse(raw); store.saved = j.saved || []; store.sightings = j.sightings || []; return; }
    const old = JSON.parse(localStorage.getItem('inyc-book') || '[]');      // notebook from the previous prototype
    old.forEach(o => { if (BY[o.n]) store.saved.push({ n: o.n, text: '', at: new Date().toISOString() }); });
  } catch (e) { }
})();
function persist() { try { localStorage.setItem(NKEY, JSON.stringify(store)) } catch (e) { } badge(); document.dispatchEvent(new Event('notes-changed')) }
const isSaved = n => store.saved.some(x => x.n == n);
function toggleSave(n) { const i = store.saved.findIndex(x => x.n == n); if (i > -1) store.saved.splice(i, 1); else store.saved.push({ n, text: '', at: new Date().toISOString() }); persist() }
function setNoteText(n, text) { const x = store.saved.find(x => x.n == n); if (x) { x.text = text; try { localStorage.setItem(NKEY, JSON.stringify(store)) } catch (e) { } } }
function addSighting(s) { store.sightings.unshift(Object.assign({ id: Date.now().toString(36), at: new Date().toISOString() }, s)); persist() }
function removeSighting(id) { store.sightings = store.sightings.filter(x => x.id != id); persist() }
function badge() { const el = $('#nc'); if (el) el.textContent = store.saved.length + store.sightings.length }
const saveBtn = (n, cls = '') => `<button class="btn sm ${isSaved(n) ? 'y' : ''} ${cls}" data-save="${n}" aria-pressed="${isSaved(n)}">${isSaved(n) ? '★ Saved' : '☆ Save to notes'}</button>`;
document.addEventListener('click', e => {
  const b = e.target.closest('[data-save]'); if (!b) return;
  const n = +b.dataset.save; toggleSave(n);
  document.querySelectorAll(`[data-save="${n}"]`).forEach(x => { const s = isSaved(n); x.classList.toggle('y', s); x.setAttribute('aria-pressed', s); x.textContent = s ? '★ Saved' : '☆ Save to notes' });
});

/* ----- shared HTML pieces ----- */
const placesHTML = d => d.places.map(p => `<li><b>${esc(p.spec || p.city)}</b>${p.hood ? ' · ' + esc(p.hood) : ''}${p.spec ? ' · ' + esc(p.city) : ''}<span class="mono"> [${esc(p.prec)}]</span></li>`).join('');
const flagsHTML = d => d.flags.length ? `<div class="vb"><div class="mono"><b>REQUIRES VERIFICATION</b></div><ul>${d.flags.map(f => `<li>${esc(f)}</li>`).join('')}</ul></div>` : '';
const layerBHTML = d => d.layerB.length ? `<div class="lb"><div class="mono"><b>OUTSIDE RESEARCH · ADDED BY THIS PROJECT</b></div>${d.layerB.map(a =>
  `<p>${esc(a.claim)}</p>${(a.addresses || []).length ? `<p class="mono">RESPONDS TO FLAG: ${a.addresses.map(esc).join(' · ')}</p>` : ''}<p class="mono">${esc(a.verification)}<br>ACCESSED ${esc(a.accessed)} · ${(a.sources || []).map(s => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a>`).join(' · ')}</p>`).join('')}</div>` : '';
const pinLine = d => d.pin ? `PIN · ${PST[d.pin.st]} (±${d.pin.rad} m) · ${esc(d.pin.basis)}${d.pin.offset ? ' · nudged so nearby pins do not overlap' : ''} · ${esc(d.pin.src)}` : (d.nyc ? 'NO MAP PIN · this story has no single place to pin' : '');
const relHTML = d => d.rel.filter(r => BY[r]).map(r => `<a class="btn y sm" style="text-decoration:none" href="#/guide/${r}">${r} · ${esc(BY[r].title)}</a>`).join('');
const pills = d => `<span class="pill">${esc(chap(d.chapter))}</span><span class="pill">${esc(d.sub)}</span>${d.nyc ? '<span class="pill y">NEW YORK</span>' : ''}${d.layerB.length ? '<span class="pill">+ OUTSIDE RESEARCH</span>' : ''}${d.flags.length ? '<span class="pill">TO VERIFY</span>' : ''}`;
function entryHTML(d) {
  return `<article class="entry"><div class="crumb"><a class="btn sm" style="text-decoration:none" href="#/guide">← Field Guide</a>${saveBtn(d.n)}${d.pin ? `<a class="btn sm y" style="text-decoration:none" href="#/explore/${d.n}">Show on map</a>` : ''}<a class="btn sm" style="text-decoration:none" href="#/agent?q=${encodeURIComponent(d.title)}">Ask the Field Agent</a></div>
  <div class="hd"><div class="mono" style="color:var(--y)">#${pad(d.n)} · ${esc(d.chapter)} · ${esc(d.sub).toUpperCase()}</div><h2 class="disp">${esc(d.title)}</h2></div>
  <div class="cols"><div><p class="mono"><b>THE STORY</b></p><p>${esc(d.summary)}</p><div class="clue"><b>LOOK FOR.</b> ${esc(d.look)}</div>${d.clues.length ? `<ul class="cl">${d.clues.map(c => `<li>${esc(c)}</li>`).join('')}</ul>` : ''}
  <p class="mono"><b>PLACES NAMED</b></p><ul class="cl">${placesHTML(d)}</ul>${d.nyc ? `<p class="mono apx">${pinLine(d)}</p>` : ''}</div>
  <div><div class="blk"><b>WHAT IT DOES</b><br>${esc(d.fn)}<br><b>HISTORICAL CONTEXT</b><br>${esc(d.hist)}<br><b>TAKEAWAY</b><br>${esc(d.take)}</div>${flagsHTML(d)}${layerBHTML(d)}
  ${d.cited.length ? `<p class="mono"><b>SOURCES BEHIND THE STORY</b></p><ul class="cl">${d.cited.map(c => `<li>${esc(c)}</li>`).join('')}</ul>` : ''}</div></div>
  ${d.rel.length ? `<p class="mono" style="margin-top:18px"><b>KEEP EXPLORING</b></p><div class="relg">${relHTML(d)}</div>` : ''}</article>`;
}

/* ---- book illustrations (supplied by the team; see tools/build_book_images.py) ---- */
const bimg = (k, t) => `img/book/${t ? 't/' : ''}b${String(k).padStart(3, '0')}.jpg`;
const isGen = d => !(window.BOOKIMG && BOOKIMG.stories[d.n]);
const imgsOf = d => (window.BOOKIMG && (BOOKIMG.stories[d.n] || (BOOKIMG.generic[d.n] ? [BOOKIMG.generic[d.n]] : []))) || [];
const bpage = k => BOOKIMG.meta[k][2];
const bcap = (k, d) => isGen(d) ? 'ILLUSTRATIVE IMAGE' : '';
const balt = (k, d) => isGen(d) ? `Illustration (not specific to ${d.title})` : `Illustration for ${d.title}`;
const bfig = (k, d, cls = '') => `<figure class="bf ${cls}"><img src="${bimg(k)}" alt="${esc(balt(k, d))}" loading="lazy" decoding="async">${bcap(k, d) ? `<figcaption class="mono">${bcap(k, d)}</figcaption>` : ''}</figure>`;
const CREDIT = 'Illustrations are from <i>The 99% Invisible City</i> by Roman Mars and Kurt Kohlstedt, with illustrations by the book\u2019s artists, used here in a private student prototype. Not for public release without permission.';
