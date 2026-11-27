/* ===== Field Notes: saved stories, your own notes, your own sightings, export ===== */
function download(name, text, type) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove() }, 500) }
const fdate = iso => { try { return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) } catch (e) { return '' } };
function notesMarkdown() {
  let m = `# Field Notes: 99% Invisible NYC\nExported ${new Date().toLocaleDateString()}\n\n## Saved stories\n`;
  if (!store.saved.length) m += '(none)\n';
  store.saved.forEach(s => { const d = BY[s.n]; if (!d) return; m += `\n### #${pad(d.n)} ${d.title}\n${chap(d.chapter)} / ${d.sub}\nLook for: ${d.look}\n${s.text ? `My note: ${s.text}\n` : ''}` });
  m += '\n## My sightings\n'; if (!store.sightings.length) m += '(none)\n';
  store.sightings.forEach(s => { m += `\n### ${s.title || 'Untitled'} (${fdate(s.at)})\n${s.place ? `Where: ${s.place}\n` : ''}${s.n && BY[s.n] ? `Linked story: #${pad(s.n)} ${BY[s.n].title}\n` : ''}${s.text || ''}\n` });
  return m;
}
function enterNotes() {
  document.title = 'Field Notes · 99% Invisible: NYC';
  const saved = store.saved.filter(s => BY[s.n]);
  const sk = [7, 6, 57, 105, 38].filter(k => window.BOOKIMG && BOOKIMG.stories[k]).slice(0, 4);
  const side = `<aside class="nside" aria-label="Sketchbook"><p class="mono">SKETCHBOOK · THINGS TO SPOT</p>${sk.map((k, i) => `<a class="pol p${i}" href="#/guide/${k}"><img src="${bimg(BOOKIMG.stories[k][0], 1)}" alt="" loading="lazy"><span>${esc(BY[k].title)}</span></a>`).join('')}<p class="nside-t">Spot one on your walk, then write it down.</p></aside>`;
  $('#npage').innerHTML = `<div class="nwrap"><div class="nmain"><span class="tag">Destination 04</span><h2 class="disp">Field Notes</h2>
  <p class="lede">Your notebook: stories you saved, notes of your own, and things you spotted yourself. It is stored only in this browser, so export it if you want to keep it.</p>
  <div class="exp"><button class="btn y" id="exmd">Download as Markdown</button><button class="btn" id="exjs">Download as JSON</button></div>
  <h3 class="disp" style="font-size:40px;margin:22px 0 4px">Saved stories (${saved.length})</h3>
  ${saved.length ? saved.map(s => { const d = BY[s.n]; return `<div class="note"><div class="mono">#${pad(d.n)} · ${esc(d.chapter)} · ${esc(d.sub)}${s.at ? ' · SAVED ' + esc(fdate(s.at)) : ''}</div><b style="font-size:26px">${esc(d.title)}</b><p><b>Look for:</b> ${esc(d.look)}</p><label class="mono" for="nt${d.n}">MY NOTE</label><textarea id="nt${d.n}" data-nt="${d.n}" placeholder="What did you notice?">${esc(s.text || '')}</textarea><div class="row"><a class="btn y sm" style="text-decoration:none" href="#/guide/${d.n}">Open entry</a>${d.pin ? `<a class="btn sm" style="text-decoration:none" href="#/explore/${d.n}">Show on map</a>` : ''}<button class="btn sm" data-rm="${d.n}">Remove</button></div></div>` }).join('') : '<div class="note"><b>Nothing saved yet.</b><br>Open a story in the <a href="#/guide">Field Guide</a> or on the <a href="#/explore">map</a> and press Save to notes.</div>'}
  <h3 class="disp" style="font-size:40px;margin:26px 0 4px">My sightings (${store.sightings.length})</h3>
  <form class="fld" id="sf"><label for="st">What did you see?</label><input id="st" required maxlength="120" placeholder="e.g. Blacked-out windows on a brownstone">
   <label for="sp">Where (optional)</label><input id="sp" maxlength="160" placeholder="Street or neighbourhood">
   <label for="sx">Notes (optional)</label><textarea id="sx" maxlength="1500"></textarea>
   <label for="sn">Related story (optional)</label><select id="sn"><option value="">None</option>${STORIES.map(d => `<option value="${d.n}">${d.n} · ${esc(d.title)}</option>`).join('')}</select>
   <div><button class="btn y" type="submit">Add sighting</button></div></form>
  ${store.sightings.map(s => `<div class="note"><div class="mono">${esc(fdate(s.at))}${s.place ? ' · ' + esc(s.place) : ''}${s.n && BY[s.n] ? ` · <a href="#/guide/${s.n}">#${pad(s.n)} ${esc(BY[s.n].title)}</a>` : ''}</div><b style="font-size:24px">${esc(s.title || 'Untitled')}</b><p>${esc(s.text || '')}</p><div class="row"><button class="btn sm" data-rs="${esc(s.id)}">Remove</button></div></div>`).join('')}</div>${side}</div>`;
  $('#exmd').onclick = () => download('field-notes.md', notesMarkdown(), 'text/markdown');
  $('#exjs').onclick = () => download('field-notes.json', JSON.stringify(store, null, 2), 'application/json');
  document.querySelectorAll('[data-nt]').forEach(t => t.oninput = () => setNoteText(+t.dataset.nt, t.value));
  document.querySelectorAll('[data-rm]').forEach(b => b.onclick = () => toggleSave(+b.dataset.rm));
  document.querySelectorAll('[data-rs]').forEach(b => b.onclick = () => removeSighting(b.dataset.rs));
  $('#sf').onsubmit = e => { e.preventDefault(); addSighting({ title: $('#st').value.trim(), place: $('#sp').value.trim(), text: $('#sx').value.trim(), n: +$('#sn').value || null }) };
}
document.addEventListener('notes-changed', () => { if (!$('#nv').hidden) enterNotes() });
