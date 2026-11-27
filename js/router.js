/* ===== router: #/explore[/n]  #/guide[/n]  #/agent[?q=]  #/notes  #/about  #/identify ===== */
const VIEWS = { home: 'land', explore: 'mapv', guide: 'gv', agent: 'av', notes: 'nv', about: 'abv', identify: 'idv' };
const DEST = [
  ['explore', '01', 'Explore', `A live map of the ${NYC_DB.length} New York stories.`],
  ['guide', '02', 'Field Guide', `All ${STORIES.length} stories, searchable.`],
  ['agent', '03', 'Field Agent', 'Ask the book a question. Simulated.'],
  ['notes', '04', 'Field Notes', 'Save, annotate and export.'],
  ['about', '05', 'About', 'Sources, method and limits.'],
  ['identify', '06', 'What am I looking at?', '']];
function parseHash() {
  const h = (location.hash || '#/').replace(/^#\/?/, ''); const [path, qs] = h.split('?'); const [r, arg] = path.split('/');
  const q = qs ? new URLSearchParams(qs).get('q') : null;
  return { r: VIEWS[r] ? r : 'home', arg: arg || '', q };
}
function route() {
  document.body.dataset.r = (location.hash || '#/').replace(/^#\/?/, '').split(/[/?]/)[0] || 'home';
  const { r, arg, q } = parseHash();
  $('#ovl').innerHTML = '';
  Object.entries(VIEWS).forEach(([k, id]) => { $('#' + id).hidden = k != r });
  document.querySelectorAll('nav button').forEach(b => b.setAttribute('aria-current', b.dataset.r == r));
  document.title = '99% Invisible: NYC';
  if (r == 'explore') enterExplore(+arg || null);
  else if (r == 'guide') enterGuide(arg);
  else if (r == 'agent') enterAgent(q);
  else if (r == 'notes') enterNotes();
  else if (r == 'about') enterAbout();
  else if (r == 'identify') idRender();
  const v = $('#' + VIEWS[r]); if (v && r != 'guide') v.scrollTop = 0;
}
(function init() {
  document.querySelectorAll('nav button').forEach(b => b.onclick = () => { location.hash = '#/' + b.dataset.r });
  $('#home').onclick = () => { location.hash = '#/' }; $('#home').onkeydown = e => { if (e.key == 'Enter') location.hash = '#/' };
  badge(); initExplore();
  window.addEventListener('hashchange', route); route();
})();
