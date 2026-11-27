/* ===== Explore: live map of the New York stories + simulated AR / Identify on original illustrations ===== */
const DB = NYC_DB;
const CATS = [...new Map(DB.map(d => [d.cn, d.chapter])).entries()].sort((a, b) => a[0] - b[0]).map(x => x[1]);
const STG = ['Explore', 'Notice', 'Identify', 'Reveal', 'Understand', 'Continue'];
const NYC = [40.7306, -73.9866], NYCZ = 11.5, SOHO = [40.7228, -74.0028];
let sel = null, cat = null, expl = new Set(), idSel = null, map = null, mks = [], hl = null, tl = null, from = null;
function stage(n) { }

function match(d) { const q = $('#q').value.trim().toLowerCase(); return (!cat || d.chapter == cat) && (!q || hay(d).includes(q)) }
function ensureMap() {
  if (map) return true;
  if (!window.L) { $('#map').innerHTML = '<div class="empty"><b>Map library could not load.</b><br>Connect to the internet and refresh.</div>'; return false }
  map = L.map('map', { zoomControl: false, center: NYC, zoom: NYCZ, minZoom: 10, maxZoom: 18, zoomSnap: .5, maxBounds: [[40.3, -74.6], [41.1, -73.3]] });
  loadTiles(0);
  /* the ring is hidden while the map zooms and redrawn at the new scale, so its stroke never stretches */
  map.on('zoomstart', () => $('#map').classList.add('moving'));
  map.on('zoomend', () => { if (!$('#mapv').hidden) draw(); $('#map').classList.remove('moving') }); return true
}
/* Keyless basemaps only (no API keys in front-end code). 1: Esri dark-grey canvas + labels, tinted black/yellow by CSS. 2-3: street maps, inverted. */
const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services/';
const TP = [['Esri dark', ESRI + 'Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', 'Esri, HERE, Garmin, © OpenStreetMap contributors', 'dk', ESRI + 'Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}'], ['Esri streets', ESRI + 'World_Street_Map/MapServer/tile/{z}/{y}/{x}', 'Tiles © Esri', 'lt'], ['OpenStreetMap', 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', '© OpenStreetMap contributors', 'lt']];
let tl2 = null;
function loadTiles(i) {
  if (tl) tl.remove(); if (tl2) { tl2.remove(); tl2 = null }
  if (i >= TP.length) { $('#mapmsg').hidden = false; $('#mapmsg').innerHTML = '<b>BASEMAP NOT LOADING</b><br>Map tiles come from the internet. Open the page through Live Server (or directly in Chrome or Safari) while online, then refresh.'; $('.legend .mono').textContent = 'NO BASEMAP'; return }
  let err = 0, ok = false; tl = L.tileLayer(TP[i][1], { maxZoom: 18, maxNativeZoom: i == 0 ? 16 : 18, attribution: TP[i][2] });
  tl.on('tileload', () => { ok = true; $('#mapmsg').hidden = true; $('.legend .mono').textContent = 'BASEMAP: ' + TP[i][0] + ' · PIN ACCURACY PER STORY' });
  tl.on('tileerror', () => { if (!ok && ++err >= 3) { tl.off('tileload'); tl.off('tileerror'); loadTiles(i + 1) } });
  $('#map').classList.remove('dk', 'lt'); $('#map').classList.add(TP[i][3]); tl.addTo(map); tl.bringToBack && tl.bringToBack();
  if (TP[i][4]) { tl2 = L.tileLayer(TP[i][4], { maxZoom: 18, maxNativeZoom: 16 }).addTo(map) }
}
function flyTo(ll, zm) { const rm = matchMedia('(prefers-reduced-motion:reduce)').matches; rm ? map.setView(ll, zm) : map.flyTo(ll, zm, { duration: 1.4 }) }
function groups(items) {
  const z = map.getZoom(); if (z >= 15) return items.map(d => [d]);
  const out = []; items.forEach(d => { const p = map.latLngToContainerPoint(d.pin.ll); const g = out.find(g => g.p.distanceTo(p) < 36); if (g) g.items.push(d); else out.push({ p, items: [d] }) }); return out.map(g => g.items)
}
function pinIcon(d, ok) { const on = sel == d.n, ex = expl.has(d.n); return L.divIcon({ className: '', iconSize: [38, 38], iconAnchor: [19, 19], html: `<div class="pk ${ex ? 'ex' : ''} ${on ? 'on' : ''} ${ok ? '' : 'dim'}">${d.n}</div>` }) }
function draw() {
  if (!ensureMap()) return; map.invalidateSize();
  mks.forEach(m => m.remove()); mks = []; if (hl) { hl.remove(); hl = null }
  const s = sel && BY[sel];
  if (s && s.pin) {
    hl = L.circle(s.pin.ll, { radius: s.pin.rad, color: '#FFF34A', weight: 1.25, opacity: .95, fillColor: '#FFF34A', fillOpacity: .05, className: 'ring', interactive: false }).addTo(map);
    mks.push(L.marker(s.pin.ll, { interactive: false, keyboard: false, zIndexOffset: -400, icon: L.divIcon({ className: '', iconSize: [0, 0], html: '<div class="rg"><i></i><i></i><b></b></div>' }) }).addTo(map));
    mks.push(L.marker(s.pin.ll, { interactive: false, keyboard: false, zIndexOffset: -500, icon: L.divIcon({ className: '', iconSize: [230, 20], iconAnchor: [115, -46], html: `<div class="zone-tip aplbl">${PST[s.pin.st]} · ±${s.pin.rad} m</div>` }) }).addTo(map))
  }
  const pinned = DB.filter(d => d.pin), live = pinned.filter(d => match(d) && d.n != sel);
  pinned.filter(d => !match(d)).forEach(d => mks.push(L.marker(d.pin.ll, { interactive: false, keyboard: false, icon: pinIcon(d, false) }).addTo(map)));
  if (s && s.pin) { const m = L.marker(s.pin.ll, { keyboard: true, title: `${s.n}. ${s.title}`, zIndexOffset: 1000, icon: pinIcon(s, true) }).addTo(map); m.on('click', () => pick(s.n)); mks.push(m) }
  groups(live).forEach(g => {
    if (g.length == 1) { const d = g[0]; const m = L.marker(d.pin.ll, { keyboard: true, title: `${d.n}. ${d.title}`, icon: pinIcon(d, true) }).addTo(map); m.bindTooltip(`#${pad(d.n)} · ${esc(d.title)} · ${esc(d.kicker)}`, { direction: 'top', offset: [0, -18], className: 'zone-tip' }); m.on('click', () => pick(d.n)); mks.push(m); return }
    const la = g.reduce((a, d) => a + d.pin.ll[0], 0) / g.length, lo = g.reduce((a, d) => a + d.pin.ll[1], 0) / g.length;
    const m = L.marker([la, lo], { keyboard: true, title: `${g.length} stories here: zoom in`, icon: L.divIcon({ className: '', iconSize: [46, 46], iconAnchor: [23, 23], html: `<div class="pk grp">${g.length}</div>` }) }).addTo(map);
    m.bindTooltip(g.map(d => '#' + pad(d.n) + ' ' + esc(d.title)).join('<br>'), { direction: 'top', offset: [0, -22], className: 'zone-tip' });
    m.on('click', () => map.fitBounds(L.latLngBounds(g.map(d => d.pin.ll)), { padding: [80, 80], maxZoom: 16 })); mks.push(m)
  })
}
function setHash(h) { try { history.replaceState(null, '', h) } catch (e) { } }
function pick(n, cont) { if (!BY[n] || !BY[n].nyc) return; sel = n; expl.add(n); draw(); panel(); stage(cont ? 5 : 1); setHash('#/explore/' + n); const d = BY[n]; if (map && d.pin) flyTo(d.pin.ll, 16) }
function clearSel() { sel = null; setHash('#/explore'); draw(); panel(); stage(0) }

const SPLIT = /(?<!\b(?:St|Mr|Mrs|Dr|Mt|Ave|No|vs|Jr|Sr|Co|Inc|Blvd)\.)(?<![A-Z]\.)(?<=[.!?])\s+(?=[A-Z“"])/;
function brief(t, n) { t = (t || '').replace(/\s+/g, ' ').trim(); const m = t.split(SPLIT); let s = m[0]; if (s.length < 110 && m[1]) s += ' ' + m[1]; if (s.length > n) { s = s.slice(0, n); s = s.slice(0, s.lastIndexOf(' ')) + '…' } return s }
const lab = (n, t) => `<div class="ed-lab"><i>${n}</i>${t}</div>`;
function panel() {
  const p = $('#panel');
  if (!sel || !BY[sel]) {
    const hits = DB.filter(match), pinned = DB.filter(d => d.pin).length;
    p.innerHTML = `<div class="pg"><div class="ed-sec"><div class="ed-lab"><i>NYC</i>The map</div><h3>Find what hides in plain sight.</h3><p>Tap a pin to see the hidden detail behind that spot, then go and look for it. ${DB.length} places to start, ${pinned} pinned.</p></div>${hits.length ? hits.map(d => `<button class="rel" data-p="${d.n}"><b>${d.n}</b><span>${esc(d.title)}<br><span class="mono">${esc(d.chapter)} · ${esc(d.sub)}${d.pin ? '' : ' · NO MAP PIN'}${expl.has(d.n) ? ' · EXPLORED' : ''}</span></span></button>`).join('') : '<div class="empty"><b>No discoveries match.</b><br>Clear the search or filter.</div>'}</div>`;
    p.querySelectorAll('[data-p]').forEach(b => b.onclick = () => pick(+b.dataset.p)); return
  }
  const d = BY[sel], sc = SCENES[d.n];
  const bim = imgsOf(d);
  const pic = bim.length ? `<figure class="ed-pic bk"><img src="${bimg(bim[0], 1)}" alt="${esc(balt(bim[0], d))}"><figcaption>${bcap(bim[0], d)}</figcaption></figure>` : sc ? `<figure class="ed-pic" id="edpic" role="button" tabindex="0" aria-label="Open AR field mode for ${esc(d.title)}">${sceneSVG(d.n, false).replace('xMidYMid meet', 'xMidYMid slice')}<figcaption>ORIGINAL ILLUSTRATION · TAP FOR AR FIELD MODE</figcaption></figure>` : `<div class="ed-pic nopic" aria-hidden="true"><span>${pad(d.n)}</span></div>`;
  const rel = d.rel.filter(r => BY[r]);
  p.innerHTML = `<div class="pg ed"><div class="ed-top mono"><span>#${pad(d.n)}</span><button id="back">← All stories</button></div>${pic}
 <div class="ed-sec">${lab('01', 'Discovery')}<h3>${esc(d.title)}</h3></div>
 <div class="ed-sec">${lab('02', 'Category')}<div class="cat"><span>${esc(d.chapter)}</span><span>${esc(d.sub)}</span></div></div>
 <div class="ed-sec">${lab('03', 'The essential idea')}<p>${esc(brief(d.summary, 260))}</p></div>
 <div class="ed-sec">${lab('04', 'Why it matters')}<p>${esc(brief(d.take || d.fn, 200))}</p></div>
 <div class="ed-sec ed-look">${lab('05', 'What to look for')}<p>${esc(d.look)}</p></div>
 <div class="ed-sec">${lab('06', 'Action')}<div class="ed-act"><a class="btn y" style="text-decoration:none" href="#/guide/${d.n}">Read the full discovery →</a>${saveBtn(d.n)}${sc ? '<button class="btn" id="arb">AR field mode (simulated)</button>' : ''}</div></div>
 <details class="more"><summary>Location accuracy and related stories</summary><div class="ed-sec"><p class="mono apx">${pinLine(d)}</p>${d.layerB.length ? '<p class="mono">Outside research is in the full entry.</p>' : ''}${d.flags.length ? '<p class="mono">Some details are flagged for verification in the full entry.</p>' : ''}${rel.length ? `<div class="mono" style="margin:10px 0 4px">KEEP EXPLORING</div>${rel.map(r => BY[r].pin ? `<button class="rel" data-r="${r}"><b>${r}</b><span>${esc(BY[r].title)}<br><span class="mono">${esc(BY[r].chapter)} · ON THIS MAP</span></span></button>` : `<a class="rel" style="text-decoration:none;color:inherit" href="#/guide/${r}"><b>${r}</b><span>${esc(BY[r].title)}<br><span class="mono">${esc(BY[r].chapter)} · IN THE FIELD GUIDE</span></span></a>`).join('')}` : ''}</div></details></div>`;
  $('#back').onclick = clearSel; if ($('#arb')) $('#arb').onclick = () => ar(d.n);
  if ($('#edpic')) { const o = () => ar(d.n); $('#edpic').onclick = o; $('#edpic').onkeydown = e => { if (e.key == 'Enter' || e.key == ' ') { e.preventDefault(); o() } } }
  p.querySelectorAll('[data-r]').forEach(b => b.onclick = () => pick(+b.dataset.r, 1)); p.scrollTop = 0
}
function initExplore() {
  $('#zi').onclick = () => map && map.zoomIn(); $('#zo').onclick = () => map && map.zoomOut();
  $('#zr').onclick = () => { clearSel(); if (map) flyTo(NYC, NYCZ) };
  $('#chips').innerHTML = CATS.map(c => `<button class="chip" aria-pressed="false" data-c="${c}">${chap(c)}</button>`).join('');
  $('#chips').onclick = e => { const b = e.target.closest('.chip'); if (!b) return; cat = cat == b.dataset.c ? null : b.dataset.c; document.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', c.dataset.c == cat)); draw(); if (!sel) panel() };
  $('#q').oninput = () => { draw(); if (!sel) panel() }; $('#q').onkeydown = e => { if (e.key == 'Enter') { const f = DB.find(match); if (f) pick(f.n) } };
  stage(0); panel()
}
function enterExplore(n) { stage(sel ? 1 : 0); draw(); if (n && BY[n] && BY[n].nyc) pick(n); else { panel() } }

/* ---------- simulated AR + Identify ----------
 * Both run on ORIGINAL schematic illustrations (js/scenes.js) drawn for this project. They are not the book's artwork.
 * Overlays are placed by hand on the drawings: nothing is detected or recognised. Labels come from each story's database "look for" clues. */
const ILL = 'Original illustration, schematic, not from the book';
const SCN = Object.keys(SCENES).map(Number).filter(n => BY[n]).sort((a, b) => a - b);
const hf = `<pattern id="ht" width="4" height="4" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".8" fill="#111"/></pattern>`;
function hotSVG(n) {
  return SCENES[n].hot.map((a, i) => {
    const lw = Math.round(a.t.length * 7.8 + 16), lx = Math.max(4, Math.min(a.x, 596 - lw)); let ly = a.y - 26; if (ly < 4) ly = a.y + a.h + 4;
    return `<g class="an hs" data-h="${i}" style="animation-delay:${i * .2 + .2}s"><rect x="${a.x}" y="${a.y}" width="${a.w}" height="${a.h}" fill="#FFF34A" fill-opacity=".25" stroke="#FFF34A" stroke-width="4"/><circle cx="${a.x + 15}" cy="${a.y + 15}" r="13" fill="#FFF34A" stroke="#111" stroke-width="2"/><text x="${a.x + 15}" y="${a.y + 20}" text-anchor="middle" style="font:700 14px 'Space Mono'" fill="#111">${i + 1}</text><rect x="${lx}" y="${ly}" width="${lw}" height="22" fill="#FFF34A"/><text x="${lx + 8}" y="${ly + 16}" class="cap">${esc(a.t)}</text></g>`
  }).join('')
}
function sceneSVG(n, ann) {
  return `<svg class="scene" viewBox="0 0 600 450" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${ILL}: ${esc(SCENES[n].cap)}"><defs>${hf}</defs><g style="filter:grayscale(1)">${SCENES[n].svg()}</g><rect width="600" height="450" fill="url(#ht)" opacity=".12"/>${ann ? hotSVG(n) : ''}</svg>`
}
let arShow = true;
function ar(n) {
  if (!SCENES[n] || !BY[n]) return; from = n; arRender()
}
function arRender() {
  const d = BY[from], S = SCENES[from];
  $('#ovl').innerHTML = `<div class="ov" role="dialog" aria-label="AR field mode"><div class="stage">${sceneSVG(from, arShow)}<span class="st">AR FIELD MODE · SIMULATED</span><div class="ret"></div><div class="modes"><button id="tgl" aria-pressed="${arShow}">${arShow ? 'Hide' : 'Show'} overlays</button></div></div>
 <div class="side"><div class="row" style="margin-top:0"><button class="btn" id="cl2">← Close</button></div><span class="tag">Stage 04 · Reveal</span><h3 class="disp">${esc(d.title)}</h3><div class="clue"><b>LOOK FOR.</b> ${esc(d.look)}</div>
 <ol class="hlist">${S.hot.map((a, i) => `<li><button data-h="${i}"><b>${i + 1}</b> ${esc(a.t)}<span>${esc(d.clues[a.c] || '')}</span></button></li>`).join('')}</ol>
 <div class="blk"><b>NOTE</b><br>${ILL}. The overlays are placed by hand on a drawing: no camera, tracking or recognition is running. The clue text comes from the story's database entry.</div>
 <a class="btn y" id="arst" style="text-decoration:none;display:inline-block" href="#/guide/${d.n}">Read the full story</a></div></div>`;
  $('#cl2').onclick = () => { $('#ovl').innerHTML = '' };
  $('#tgl').onclick = () => { arShow = !arShow; arRender() };
  document.querySelectorAll('.hlist button').forEach(b => b.onclick = () => { const st = $('.stage'), on = b.classList.contains('on'); document.querySelectorAll('.hlist .on,.hs.on').forEach(e => e.classList.remove('on')); st.classList.toggle('foc', !on); if (on) return; b.classList.add('on'); const g = document.querySelector(`.hs[data-h="${b.dataset.h}"]`); if (g) g.classList.add('on') })
}
function idRender() {
  $('#tg').innerHTML = SCN.map((n, i) => `<button aria-pressed="${idSel === n}" data-n="${n}" aria-label="Sample ${i + 1}"><svg viewBox="0 0 600 450" role="img" aria-label="Sample ${i + 1}"><defs>${hf}</defs><g style="filter:grayscale(1)">${SCENES[n].svg()}</g></svg><span>Sample ${i + 1}</span></button>`).join('');
  $('#tg').onclick = e => { const b = e.target.closest('button'); if (!b) return; idSel = +b.dataset.n; $('#idres').innerHTML = ''; idRender(); $('#idbtn').disabled = false };
  $('#idbtn').disabled = idSel === null;
  $('#idbtn').onclick = () => {
    const n = idSel, d = BY[n], S = SCENES[n]; $('#idres').innerHTML = '<div class="res mono">ANALYSING SAMPLE…</div>';
    setTimeout(() => {
      $('#idres').innerHTML = `<div class="res"><span class="tag">Simulated result</span><h3 class="disp" style="font-size:40px;margin:8px 0">${esc(d.title)}</h3><div class="mono">#${pad(d.n)} · ${esc(d.chapter)} · ${esc(d.sub)}</div><p><b>What to notice in this sample:</b></p><ul class="cl">${S.hot.map(a => `<li><b>${esc(a.t)}.</b> ${esc(d.clues[a.c] || '')}</li>`).join('')}</ul><p><b>Why it matters:</b> ${esc(d.take)}</p><p class="mono">This is not recognition. The answer is simply the drawing you picked. ${ILL}.</p><div class="row"><button class="btn" id="go">Reveal in AR</button><a class="btn y" style="text-decoration:none" href="#/guide/${d.n}">Read the story</a></div></div>`;
      $('#go').onclick = () => ar(n)
    }, 700)
  }
}
