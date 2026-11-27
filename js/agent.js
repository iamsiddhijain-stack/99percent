/* ===== Field Agent: SIMULATED retrieval-augmented answers =====
 * What this really is: a BM25 keyword search over the 125 stories stored in this page.
 * It selects the best-matching passages and quotes the database's own summary text, with citations.
 * No language model runs. Nothing is sent anywhere unless window.FIELD_AGENT_ENDPOINT is set (js/config.js). */
const STOP = new Set('a an and are as at be but by can could did do does for from had has have how i if in into is it its me my of on or our so than that the their them then there these they this to was we were what when where which who whom why will with would you your about tell show give find any also just not no yes more most some such get got make made one'.split(' '));
const stem = w => {
  if (w.length > 4 && w.endsWith('ies')) w = w.slice(0, -3) + 'y'; else if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) w = w.slice(0, -1);
  if (w.length > 5 && w.endsWith('ing')) w = w.slice(0, -3); else if (w.length > 4 && w.endsWith('ed')) w = w.slice(0, -2);
  if (w.length > 3 && w.endsWith('e')) w = w.slice(0, -1);
  return w.length > 6 ? w.slice(0, 6) : w;
};
const tok = s => String(s).toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w && !STOP.has(w)).map(stem);
let AI = null;            // lazy index
function buildIndex() {
  const chunks = [];
  STORIES.forEach(d => {
    const t = tok(d.title + ' ' + d.kicker);
    chunks.push({ n: d.n, type: 'book', text: d.summary, tokens: tok(d.summary + ' ' + d.fn + ' ' + d.take + ' ' + d.sub).concat(t, t) });
    chunks.push({ n: d.n, type: 'look', text: d.look, tokens: tok(d.look + ' ' + d.clues.join(' ')).concat(t, t) });
    chunks.push({ n: d.n, type: 'places', text: d.places.map(p => [p.spec, p.hood, p.city, p.country].filter(Boolean).join(', ')).join(' | '), tokens: tok(d.places.map(p => [p.spec, p.hood, p.city, p.country].join(' ')).join(' ') + ' ' + d.kw.join(' ')).concat(t, t) });
    d.layerB.forEach((b, i) => chunks.push({ n: d.n, type: 'outside', bi: i, text: b.claim, tokens: tok(b.claim + ' ' + (b.hood || '')).concat(t, t) }));
  });
  const N = chunks.length, df = {}; let tot = 0;
  chunks.forEach(c => { const sq = tok(c.text); c.bg = new Set(sq.slice(1).map((w, i) => sq[i] + ' ' + w)); tot += c.tokens.length; c.tf = {}; c.tokens.forEach(w => c.tf[w] = (c.tf[w] || 0) + 1); Object.keys(c.tf).forEach(w => df[w] = (df[w] || 0) + 1) });
  const idf = {}; Object.keys(df).forEach(w => idf[w] = Math.log(1 + (N - df[w] + .5) / (df[w] + .5)));
  const titleTok = {}; STORIES.forEach(d => titleTok[d.n] = [...new Set(tok(d.title))]);
  return { chunks, idf, avg: tot / N, titleTok };
}
function score(c, q) { const k1 = 1.4, b = .75; let s = 0; q.forEach(w => { const f = c.tf[w]; if (f) s += AI.idf[w] * f * (k1 + 1) / (f + k1 * (1 - b + b * c.tokens.length / AI.avg)) }); return s }
function retrieve(question) {
  if (!AI) AI = buildIndex();
  const seq = tok(question), q = [...new Set(seq)]; if (!q.length) return { q, stories: [] };
  const qbg = seq.slice(1).map((w, i) => seq[i] + ' ' + w);
  const per = {};
  AI.chunks.forEach(c => { const s = score(c, q); if (s > 0) { (per[c.n] = per[c.n] || []).push({ c, s }) } });
  const out = Object.keys(per).map(n => {
    n = +n; const arr = per[n].sort((a, b) => b.s - a.s), tt = AI.titleTok[n];
    const titleHit = tt.length && tt.every(w => q.includes(w)) ? 3 : 0;
    const phrase = Math.min(3, 1.5 * Math.max(0, ...per[n].map(x => qbg.filter(g => x.c.bg.has(g)).length)));
    const book = arr.find(x => x.c.type == 'book') || arr[0];
    const outs = arr.filter(x => x.c.type == 'outside' && x.s >= .6 * arr[0].s);
    const seen = new Set(); per[n].forEach(x => q.forEach(w => { if (x.c.tf[w]) seen.add(w) }));
    return { n, best: arr[0].s, total: arr[0].s + titleHit + phrase, cov: seen.size / q.length, book, look: arr.find(x => x.c.type == 'look'), places: arr.find(x => x.c.type == 'places'), outs };
  }).filter(r => r.cov >= (q.length >= 3 ? .6 : 1)).sort((a, b) => b.total - a.total);   // must match most of the question's terms
  return { q, stories: out };
}
const sentences = t => t.split(/(?<=[.!?])(?<!\b[A-Z]\.)(?<!\b(?:St|Mr|Mrs|Ms|Dr|vs|Inc|No|Jr|Sr)\.)\s+(?=[A-Z“"'(])/);   // do not split after initials or abbreviations
function pickSentences(text, q) {
  const ss = sentences(text), sc = ss.map((s, i) => ({ i, s, v: tok(s).filter(w => q.includes(w)).length }));
  let top = sc.filter(x => x.v > 0).sort((a, b) => b.v - a.v || a.i - b.i).slice(0, 2).sort((a, b) => a.i - b.i);
  if (!top.length) top = sc.slice(0, 2);
  return top.map(x => x.s).join(' ');
}
let CHAT = [], LAST = [];
const SUGGEST = ['Why do some buildings have fake facades?', 'Who invented the safety elevator?', 'What happened to the original Penn Station?', 'What is the story of the Liz Christy garden?', 'What was the Triangle Shirtwaist fire?', 'Why does Citicorp Center stand on stilts?', 'What is a sneckdown?', 'What are ghost streams under Manhattan?', 'Tell me about the High Line'];
function shortAns(t) { const ss = sentences(t); let o = ss[0] || t; if (o.length < 110 && ss[1]) o += ' ' + ss[1]; return o.length > 340 ? o.slice(0, 337).replace(/\s+\S*$/, '') + '…' : o }
const bThumb = d => { const k = imgsOf(d)[0]; return k ? `<img src="${bimg(k, 1)}" alt="" loading="lazy">` : `<i class="bc-n">${pad(d.n)}</i>` };
function answerHTML(rel, q) {
  const r = rel[0], d = BY[r.n];
  const out = r.outs.map(o => { const b = d.layerB[o.c.bi]; return `<div class="outside"><p>${esc(b.claim)}</p><p class="mono">${esc(b.verification)}<br>ACCESSED ${esc(b.accessed)} · ${(b.sources || []).map(s => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a>`).join(' · ')}</p></div>` }).join('');
  const showPlaces = r.places && r.places.s >= .8 * r.best && r.places.c.type == 'places' && !r.book.c.text.includes(r.places.c.text);
  return `<p class="ans">${esc(shortAns(pickSentences(d.summary, q)))}</p>
  <div class="clue"><b>LOOK FOR.</b> ${esc(d.look)}</div>
  <div class="based"><span class="mono">BASED ON</span><div class="bcards">${rel.map(x => { const e = BY[x.n]; return `<a class="bc" href="#/guide/${e.n}">${bThumb(e)}<b>${esc(e.title)}</b><span class="mono">${esc(e.sub)}</span></a>` }).join('')}</div></div>
  <details class="more2"><summary class="mono">More from “${esc(d.title)}”</summary><p>${esc(d.summary)}</p><p><b>Takeaway:</b> ${esc(d.take)}</p>${showPlaces ? `<p class="mono">PLACES NAMED: ${esc(r.places.c.text)}</p>` : ''}${d.flags.length ? `<p class="mono">⚠ TO VERIFY: ${esc(d.flags[0])}</p>` : ''}</details>
  ${out ? `<details class="more2"><summary class="mono">Outside research (${r.outs.length}) · added by this project, not part of the story</summary>${out}</details>` : ''}
  <div class="exp" style="margin:8px 0 0;justify-content:flex-start"><a class="btn sm y" style="text-decoration:none" href="#/guide/${d.n}">Open the story</a>${d.pin ? `<a class="btn sm" style="text-decoration:none" href="#/explore/${d.n}">Show on map</a>` : ''}${saveBtn(d.n)}</div>`;
}
function answer(question) {
  const t = question.trim();
  if (/^(hi|hello|hey|hiya)\b/i.test(t)) return { html: `<p>Hello. Ask me about anything in the 125 stories: an object, a place, a word. I answer only from the database and I show where each answer comes from.</p>`, ns: [] };
  if (/^(more|tell me more|go on|expand|and\??)$/i.test(t) && LAST.length) {
    const d = BY[LAST[0]];
    return { html: `<div class="hit"><h4><a href="#/guide/${d.n}">#${pad(d.n)} · ${esc(d.title)}</a></h4><p>${esc(d.summary)}</p><div class="blk"><b>WHAT IT DOES</b> ${esc(d.fn)}<b>TAKEAWAY</b> ${esc(d.take)}</div><div class="clue"><b>LOOK FOR.</b> ${esc(d.look)}</div>${layerBHTML(d)}${flagsHTML(d)}</div>`, ns: LAST };
  }
  const R = retrieve(t);
  const top = R.stories[0];
  if (!top || (top.total < 2.2)) return { html: `<p><b>I can't find that in the 125 stories.</b> I won't guess. The database covers the city's objects, places and ideas; try different words, or browse the <a href="#/guide">Field Guide</a>.</p>`, ns: [] };
  const rel = R.stories.filter(r => r.total >= Math.max(2.2, top.total * .6)).slice(0, 3);
  return { html: answerHTML(rel, R.q), ns: rel.map(r => r.n), q: R.q, passages: rel.flatMap(r => [{ id: BY[r.n].id, layer: 'A', cite: `${BY[r.n].title}, ${pp(BY[r.n])}`, text: BY[r.n].summary }, ...r.outs.map(o => ({ id: BY[r.n].id, layer: 'B', cite: (BY[r.n].layerB[o.c.bi].sources || []).map(s => s.url).join(' '), text: BY[r.n].layerB[o.c.bi].claim }))]) };
}
async function askServer(question, passages) {
  const url = window.FIELD_AGENT_ENDPOINT; if (!url) return null;
  try {
    const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 20000);
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question, passages }), signal: ctl.signal }); clearTimeout(to);
    if (!r.ok) throw 0; const j = await r.json(); return typeof j.answer == 'string' ? j.answer : null;
  } catch (e) { return null }
}
function renderChat() {
  const box = $('#chat'); if (!box) return;
  box.innerHTML = CHAT.map(m => m.role == 'u' ? `<div class="msg"><span class="msg u">${esc(m.text)}</span></div>` : `<div class="msg a"><div class="mono amark">FIELD AGENT · SIMULATED</div>${m.html}${m.server ? `<div class="outside"><div class="mono"><b>SERVER ANSWER · GENERATED BY YOUR CONFIGURED SERVER · NOT CHECKED AGAINST THE BOOK</b></div><p>${esc(m.server)}</p></div>` : ''}</div>`).join('');
  const q = box.lastElementChild && box.lastElementChild.previousElementSibling; if (q && CHAT.length) q.scrollIntoView({ block: 'start' });
}
async function ask(text) {
  text = String(text || '').trim(); if (!text) return;
  CHAT.push({ role: 'u', text }); const a = answer(text); const m = { role: 'a', html: a.html }; CHAT.push(m); if (a.ns && a.ns.length) LAST = a.ns; renderChat();
  if (window.FIELD_AGENT_ENDPOINT && a.passages && a.passages.length) { const s = await askServer(text, a.passages); if (s) { m.server = s; renderChat() } }
}
function enterAgent(q) {
  document.title = 'Field Agent · 99% Invisible: NYC';
  $('#apage').innerHTML = `<span class="tag">Destination 03</span><h2 class="disp">Field Agent</h2>
  <p class="lede">Ask about anything hidden in the city.</p>
  <details class="simd"><summary class="mono"><b>SIMULATED</b> · how this works</summary><p>This page searches the 125 stories stored in your browser and assembles answers from their text. <b>No language model is running</b> and nothing leaves your browser. When the stories have no answer it says so instead of guessing. Outside research is always labelled separately.</p></details>
  <form class="ask" id="askf"><input id="askq" type="text" placeholder="e.g. Who invented the safety elevator?" aria-label="Ask the Field Agent" autocomplete="off"><button class="btn" type="submit">Ask</button></form>
  <div class="exp">${[0, 1, 2, 3].map(i => SUGGEST[i]).map(s => `<button class="chipq" data-s="${esc(s)}">${esc(s)}</button>`).join('')}</div>
  <div class="chat" id="chat" aria-live="polite"></div>`;
  $('#askf').onsubmit = e => { e.preventDefault(); const v = $('#askq').value; $('#askq').value = ''; ask(v) };
  document.querySelectorAll('[data-s]').forEach(b => b.onclick = () => ask(b.dataset.s));
  renderChat();
  if (q && !(CHAT.length && CHAT[CHAT.length - 2] && CHAT[CHAT.length - 2].text == q)) ask(q); else $('#askq').focus();
}
