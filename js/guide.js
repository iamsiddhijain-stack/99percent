/* ===== Field Guide: browse, search and read all 125 stories ===== */
const GF = { q: '', ch: null, sub: '', nyc: false, b: false, az: false };
const SUBS = SITE.subs.slice().sort((a, b) => a.cn - b.cn || a.ids[0] - b.ids[0]);
function gMatch(d) {
  if (GF.ch && d.chapter != GF.ch) return false;
  if (GF.sub && d.sub != GF.sub) return false;
  if (GF.nyc && !d.nyc) return false;
  if (GF.b && !d.layerB.length) return false;
  const q = GF.q.trim().toLowerCase();
  return !q || q.split(/\s+/).every(w => hay(d).includes(w));
}
const brief1 = (t, n = 105) => { t = (t || '').replace(/\s+/g, ' ').trim(); if (t.length <= n) return t; t = t.slice(0, n); return t.slice(0, t.lastIndexOf(' ')) + '…' };
function cardPic(d) {
  const im = imgsOf(d);
  if (im.length) return `<img src="${bimg(im[0], 1)}" alt="${esc(balt(im[0], d))}" loading="lazy" decoding="async">`;
  if (window.SCENES && SCENES[d.n]) return sceneSVG(d.n, false).replace('xMidYMid meet', 'xMidYMid slice');
  return `<span class="gc-ph" aria-hidden="true">${pad(d.n)}</span>`;
}
function card(d) {
  return `<a class="gc" href="#/guide/${d.n}"><div class="gc-pic">${cardPic(d)}</div><h4>${esc(d.title)}</h4><p>${esc(brief1(d.fn, 70))}</p></a>`;
}
function rowH(s, items) {
  return `<section class="rh" aria-label="${esc(s.name)}"><div class="rh-head"><div><b class="mono">${esc(s.name.toUpperCase())}</b><span class="mono"> · ${items.length}</span></div><div class="rh-ctl"><span class="mono rh-pos" aria-live="polite"></span><button class="ar" data-d="-1" aria-label="Scroll ${esc(s.name)} left">←</button><button class="ar" data-d="1" aria-label="Scroll ${esc(s.name)} right">→</button></div></div><div class="rh-scroll" tabindex="0" role="region" aria-label="${esc(s.name)} stories">${items.map(card).join('')}</div><div class="rh-bar" aria-hidden="true"><i></i></div></section>`;
}
function rowInit(sec) {
  const sc = sec.querySelector('.rh-scroll'), pos = sec.querySelector('.rh-pos'), bar = sec.querySelector('.rh-bar i'), bl = sec.querySelector('[data-d="-1"]'), br = sec.querySelector('[data-d="1"]');
  const upd = () => {
    const cs = sc.querySelectorAll('.gc'), w = cs[0].offsetWidth + 14, max = sc.scrollWidth - sc.clientWidth;
    const a = Math.min(cs.length, Math.round(sc.scrollLeft / w) + 1), z = Math.min(cs.length, Math.floor((sc.scrollLeft + sc.clientWidth - 4) / w));
    pos.textContent = `${a}${z > a ? '–' + z : ''} / ${cs.length}`;
    bar.style.width = (max <= 0 ? 100 : Math.max(8, (sc.scrollLeft + sc.clientWidth) / sc.scrollWidth * 100)) + '%';
    bl.disabled = sc.scrollLeft <= 2; br.disabled = max <= 0 || sc.scrollLeft >= max - 2;
  };
  [bl, br].forEach(b => b.onclick = () => sc.scrollBy({ left: +b.dataset.d * sc.clientWidth * .85, behavior: matchMedia('(prefers-reduced-motion:reduce)').matches ? 'auto' : 'smooth' }));
  sc.addEventListener('scroll', upd, { passive: true }); sc.onkeydown = e => { if (e.key == 'ArrowRight') br.click(); if (e.key == 'ArrowLeft') bl.click() };
  addEventListener('resize', upd); upd(); setTimeout(upd, 300);
}
const gActive = () => !!(GF.q.trim() || GF.ch || GF.sub || GF.nyc || GF.b);
const chN = t => (SITE.chapters.find(c => c.title == t) || {}).n;
function chapTiles() {
  return `<div class="ctiles">${SITE.chapters.map(c => {
    const hk = window.BOOKIMG && BOOKIMG.chapters[c.n], n = STORIES.filter(d => d.chapter == c.title).length;
    return `<button class="ct" data-ch="${esc(c.title)}"><span class="ct-pic">${hk ? `<img src="${bimg(hk, 1)}" alt="" loading="lazy">` : ''}</span><span class="ct-n">${c.n}</span><span class="ct-b"><b>${esc(chap(c.title))}</b><span>${esc(brief1(c.intro, 80))}</span><em class="mono">${n} STORIES</em></span></button>`;
  }).join('')}</div>`;
}
function azList(hits) {
  const s = hits.slice().sort((a, b) => a.title.localeCompare(b.title)), L = {};
  s.forEach(d => (L[d.title[0].toUpperCase()] = L[d.title[0].toUpperCase()] || []).push(d));
  return `<div class="az">${Object.keys(L).map(k => `<section><h4 class="az-l">${k}</h4><ul>${L[k].map(d => `<li><a href="#/guide/${d.n}">${esc(d.title)}<span class="mono">${esc(d.sub)}</span></a></li>`).join('')}</ul></section>`).join('')}</div>`;
}
function guideResults() {
  const hits = STORIES.filter(gMatch), act = gActive();
  let h = '';
  if (GF.az) h = hits.length ? azList(hits) : '';
  else if (!act) h = chapTiles();
  else {
    h = `<nav class="cstrip" aria-label="Chapters"><button data-ch="" class="${GF.ch ? '' : 'on'}">All</button>${SITE.chapters.map(c => `<button data-ch="${esc(c.title)}" class="${GF.ch == c.title ? 'on' : ''}">${c.n} · ${esc(chap(c.title))}</button>`).join('')}</nav>`;
    SITE.chapters.forEach(c => {
      const subs = SUBS.filter(s => s.cn == c.n).map(s => ({ s, items: hits.filter(d => d.chapter == c.title && d.sub == s.name) })).filter(x => x.items.length);
      if (!subs.length) return;
      if (GF.ch) { const hk = window.BOOKIMG && BOOKIMG.chapters[c.n]; h += `<div class="chap">${hk ? `<figure class="ch-pic"><img src="${bimg(hk, 1)}" alt="" loading="lazy"></figure>` : ''}<div><h3><span class="chn">${c.n}</span>${esc(chap(c.title))}</h3><p>${esc(c.intro)}</p></div></div>` }
      else h += `<h3 class="chsm"><span class="chn">${c.n}</span>${esc(chap(c.title))}</h3>`;
      subs.forEach(({ s, items }) => { h += rowH(s, items) });
    });
  }
  $('#gres').innerHTML = (hits.length ? h : '<div class="note"><b>No stories match.</b><br>Clear a filter or try a simpler word.</div>') + (act || GF.az ? '' : '') + `<p class="mono credit">${CREDIT}</p>`;
  document.querySelectorAll('#gres .rh').forEach(rowInit);
  document.querySelectorAll('#gres [data-ch]').forEach(b => b.onclick = () => { GF.ch = b.dataset.ch || null; GF.sub = ''; if ($('#gch')) $('#gch').value = GF.ch || ''; fillSub(); guideResults(); filtBadge(); window.scrollTo(0, 0); const gv = $('#gv'); if (gv) gv.scrollTop = 0 });
  $('#gcount').textContent = act || GF.az ? `${hits.length} of ${STORIES.length} stories` : '';
  document.querySelectorAll('.seg button').forEach(b => b.setAttribute('aria-pressed', String((b.dataset.m == 'az') == GF.az)));
}
function fillSub() {
  const opts = SUBS.filter(s => !GF.ch || s.chapter == GF.ch); if (GF.sub && !opts.some(s => s.name == GF.sub)) GF.sub = '';
  const el = $('#gsub'); if (el) el.innerHTML = '<option value="">All subcategories</option>' + opts.map(s => `<option ${GF.sub == s.name ? 'selected' : ''}>${esc(s.name)}</option>`).join('');
}
function filtBadge() { const n = (GF.sub ? 1 : 0) + (GF.nyc ? 1 : 0) + (GF.b ? 1 : 0); const b = $('#gfbtn'); if (b) b.textContent = n ? `Filters · ${n}` : 'Filters' }
function guideList() {
  document.title = 'Field Guide · 99% Invisible: NYC';
  $('#gpage').innerHTML = `<h2 class="disp">Field Guide</h2>
  <p class="lede">Pick a chapter, or search for something you spotted.</p>
  <div class="bar"><input id="gq" type="search" placeholder="Search all 125 stories" aria-label="Search all stories" value="${esc(GF.q)}">
   <button class="tgl" id="gfbtn" aria-expanded="false" aria-controls="gfilt">Filters</button>
   <span class="seg" role="group" aria-label="View"><button data-m="ch" aria-pressed="true">By chapter</button><button data-m="az" aria-pressed="false">A–Z</button></span></div>
  <div class="gfilt" id="gfilt" hidden>
   <select id="gch" aria-label="Chapter"><option value="">All chapters</option>${SITE.chapters.map(c => `<option value="${c.title}" ${GF.ch == c.title ? 'selected' : ''}>${c.n}. ${esc(chap(c.title))}</option>`).join('')}</select>
   <select id="gsub" aria-label="Subcategory"></select>
   <button class="tgl" id="gnyc" aria-pressed="${GF.nyc}">New York only</button><button class="tgl" id="gb" aria-pressed="${GF.b}">With outside research</button>
   <button class="tgl" id="gclr">Clear</button></div>
  <p class="mono count" id="gcount" aria-live="polite"></p><div id="gres"></div>`;
  fillSub(); guideResults(); filtBadge();
  $('#gq').oninput = e => { GF.q = e.target.value; guideResults() };
  $('#gfbtn').onclick = e => { const f = $('#gfilt'); f.hidden = !f.hidden; e.currentTarget.setAttribute('aria-expanded', String(!f.hidden)) };
  $('#gch').onchange = e => { GF.ch = e.target.value || null; fillSub(); guideResults(); filtBadge() };
  $('#gsub').onchange = e => { GF.sub = e.target.value; guideResults(); filtBadge() };
  $('#gnyc').onclick = e => { GF.nyc = !GF.nyc; e.currentTarget.setAttribute('aria-pressed', GF.nyc); guideResults(); filtBadge() };
  $('#gb').onclick = e => { GF.b = !GF.b; e.currentTarget.setAttribute('aria-pressed', GF.b); guideResults(); filtBadge() };
  $('#gclr').onclick = () => { Object.assign(GF, { q: '', ch: null, sub: '', nyc: false, b: false }); $('#gq').value = ''; $('#gch').value = ''; $('#gnyc').setAttribute('aria-pressed', 'false'); $('#gb').setAttribute('aria-pressed', 'false'); fillSub(); guideResults(); filtBadge() };
  document.querySelectorAll('.seg button').forEach(b => b.onclick = () => { GF.az = b.dataset.m == 'az'; guideResults() });
}
function shortOf(t) {
  t = (t || '').replace(/\s+/g, ' ').trim(); const ss = sentences(t); let o = ss[0] || t;
  if (o.length < 90 && ss[1]) o += ' ' + ss[1];
  return o.length > 260 ? o.slice(0, 257).replace(/\s+\S*$/, '') + '…' : o;
}
function journalHTML(d) {
  const im = imgsOf(d), prev = BY[d.n - 1], next = BY[d.n + 1];
  const photo = im.length ? `<figure class="jr-photo"><i class="tape t1"></i><i class="tape t2"></i><img src="${bimg(im[0])}" alt="${esc(balt(im[0], d))}">${bcap(im[0], d) ? `<figcaption class="mono">${bcap(im[0], d)}</figcaption>` : ''}</figure>${im.length > 1 ? `<div class="jr-more">${im.slice(1, 4).map((k, i) => `<img class="m${i}" src="${bimg(k, 1)}" alt="${esc(balt(k, d))}" loading="lazy">`).join('')}</div>` : ''}` : '';
  const row = (k, v) => `<div class="jr-row"><b class="mono">${k}</b><span>${v}</span></div>`;
  const where = d.places.length ? `<ul class="jr-pl">${placesHTML(d)}</ul>` : '';
  return `<article class="jr">
  <div class="crumb"><a class="btn sm" style="text-decoration:none" href="#/guide">← Field Guide</a>${saveBtn(d.n)}${d.pin ? `<a class="btn sm y" style="text-decoration:none" href="#/explore/${d.n}">Show on map</a>` : ''}<a class="btn sm" style="text-decoration:none" href="#/agent?q=${encodeURIComponent(d.title)}">Ask the Field Agent</a></div>
  <div class="jr-board">
   <div class="jr-l">
    <div class="jr-no mono">OBSERVATION No. ${pad(d.n)}</div>
    <div class="mono jr-cat">${esc(chap(d.chapter))} · ${esc(d.sub)}${d.nyc ? ' · NEW YORK' : ''}</div>
    <h2 class="disp jr-t"><span>${esc(d.title)}</span></h2>
    <div class="jr-story"><div class="mono jr-lab">IN SHORT</div><p>${esc(shortOf(d.summary))}</p>${d.summary.length > shortOf(d.summary).length + 10 ? `<details class="jr-full"><summary class="mono">Read the full story</summary><p>${esc(d.summary)}</p></details>` : ''}</div>
    <div class="jr-sticky"><i class="tape t1"></i><div class="mono jr-lab">LOOK FOR</div><p>${esc(d.look)}</p>${d.clues.length ? `<ul>${d.clues.map(c => `<li>${esc(c)}</li>`).join('')}</ul>` : ''}</div>
    ${flagsHTML(d)}${layerBHTML(d)}
   </div>
   <div class="jr-r">
    ${photo}
    <div class="jr-sheet"><span class="jr-clip" aria-hidden="true"></span><div class="jr-sh mono">FIELD SHEET</div>
     ${row('WHAT IT DOES', esc(d.fn))}${row('HISTORY', esc(d.hist))}${row('TAKEAWAY', `<mark>${esc(d.take)}</mark>`)}
     ${where ? row('PLACES', where) : ''}${d.nyc ? row('ON THE MAP', esc(pinLine(d))) : ''}
    </div>
    ${d.cited.length ? `<details class="jr-src"><summary class="mono">SOURCES BEHIND THE STORY · ${d.cited.length}</summary><ul>${d.cited.map(c => `<li>${esc(c)}</li>`).join('')}</ul></details>` : ''}
   </div>
  </div>
  ${d.rel.length ? `<div class="jr-rel"><span class="mono">KEEP EXPLORING</span><div class="relg">${relHTML(d)}</div></div>` : ''}
  </article>`;
}
function guideEntry(n) {
  const d = BY[n]; if (!d) { $('#gpage').innerHTML = `<div class="note"><b>No story numbered ${esc(n)}.</b><br><a href="#/guide">Back to the Field Guide</a></div>`; return }
  document.title = d.title + ' · Field Guide';
  const prev = BY[n - 1], next = BY[n + 1];
  $('#gpage').innerHTML = journalHTML(d) + `<p class="mono credit">${CREDIT}</p>` + `<div class="exp" style="margin-top:22px">${prev ? `<a class="btn sm" style="text-decoration:none" href="#/guide/${prev.n}">← ${prev.n} · ${esc(prev.title)}</a>` : ''}${next ? `<a class="btn sm" style="text-decoration:none" href="#/guide/${next.n}">${next.n} · ${esc(next.title)} →</a>` : ''}</div>`;
  $('#gv').scrollTop = 0;
}
function enterGuide(arg) { /\d+/.test(arg || '') ? guideEntry(+arg) : guideList() }
