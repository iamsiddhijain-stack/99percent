/* ===== About ===== */
function enterAbout() {
  document.title = 'About · 99% Invisible: NYC';
  const nB = STORIES.filter(d => d.layerB.length).length, nF = STORIES.filter(d => d.flags.length).length, nP = NYC_DB.filter(d => d.pin).length;
  const nyB = NYC_DB.filter(d => d.layerB.length).length, subs = SITE.subs.length, chs = SITE.chapters.length;
  const cnt = k => NYC_DB.filter(d => d.pin && d.pin.st == k).length;
  $('#abpage').innerHTML = `<span class="tag">Destination 05</span><h2 class="disp">About</h2>
  <p class="lede">A field guide to the things hiding in plain sight, built from a book about them.</p>
  <h3>What this is</h3>
  <p>A college communication-design prototype. Its source material is <i>The 99% Invisible City: A Field Guide to the Hidden World of Everyday Design</i> by Roman Mars and Kurt Kohlstedt. This project is not affiliated with or endorsed by the authors, the publisher or the 99% Invisible podcast. The summaries here are written for this project and are not quotations from the book. For the full stories, read the book.</p>
  <h3>Where the content comes from</h3>
  <ul><li><b>${STORIES.length} stories</b> in the book's <b>${chs} chapters and ${subs} subcategories</b>.</li>
  <li><b>Layer A is the book.</b> Summary, function, historical context, takeaway, places named and the sources the book itself cites. Nothing is added from outside.</li>
  <li><b>Layer B is outside research,</b> shown in dashed boxes marked “not from the book”, each with source links, the date we read it and how well it was checked. ${nB} stories have it so far (${nyB} of the ${NYC_DB.length} New York stories).</li>
  <li>The <b>“look for”</b> prompts are our own editorial suggestions derived from each story's text. They are not book quotes.</li>
  <li>Where the book did not say something, the database says so or leaves it empty. It does not fill gaps. ${nF} stories carry a “requires verification” note.</li></ul>
  <h3>How the map works</h3>
  <p>${NYC_DB.length} stories are set in New York City and ${nP} have a pin. The book gives place names, not coordinates, so every pin carries a status and an uncertainty circle:</p>
  <table class="tbl"><tr><th>Pin status</th><th>Meaning</th><th>Pins</th></tr>
  <tr><td>Cross-checked</td><td>Two outside sources agree on the coordinates</td><td>${cnt('cross')}</td></tr>
  <tr><td>Wikipedia coordinates</td><td>One outside source; a building or site</td><td>${cnt('wikipedia')}</td></tr>
  <tr><td>Estimated</td><td>Placed from a described location or the street grid; not surveyed</td><td>${cnt('estimated')}</td></tr>
  <tr><td>Area centre</td><td>The middle of a neighbourhood, park or square, not a specific site</td><td>${cnt('area')}</td></tr></table>
  <p>Pins that would sit on top of one another are nudged apart for display and say so. The other ${STORIES.length - NYC_DB.length} stories take place elsewhere and appear in the Field Guide but not on this map.</p>
  <h3>What is simulated</h3>
  <ul><li><b>Field Agent:</b> a keyword search (BM25) over the stories stored in this page. It picks the best-matching passages and shows the database's own text with citations. <b>No language model is running</b> and nothing leaves your browser. It says “I can't find that” rather than guessing.</li>
  <li><b>AR field mode and Identify:</b> highlights drawn by hand on ${SCN.length} original schematic illustrations of New York details (made for this project, not the book's artwork). No camera and no recognition is involved; the labels come from each story's “look for” clues.</li></ul>
  <h3>Known limits</h3>
  <ul><li>Most Layer B facts rest on one secondary source, often Wikipedia or a blog. They need checking against primary sources (landmark reports, archives) before any public launch.</li>
  <li>The book dates Citicorp Center to 1967; outside sources say construction began in 1974 and it opened in 1977. We left the book's text unchanged and flagged the difference.</li>
  <li>Four New York stories have no outside research yet (the 1970s car-ban proposal, the Statue of Liberty patina, buried Manhattan streams, and Times Square plazas).</li>
  <li>Stories are summaries. They are meant to send you to the street and to the book, not to replace either.</li></ul>
  <h3>Your data</h3>
  <p>Field Notes are saved only in this browser. There are no accounts and no analytics. The page loads map tiles (Esri or OpenStreetMap), fonts (Google Fonts) and the Leaflet map library (cdnjs) from the internet.</p>
  <h3>For developers</h3>
  <ul><li>Content lives in <code>content/*.json</code>. After editing it, run <code>python3 tools/build_site_data.py</code> to regenerate <code>content/site-data.js</code>.</li>
  <li><code>content/extraction-progress.json</code> is the tracker: what was reviewed, what is verified and what is still open.</li>
  <li>To connect a real language model to the Field Agent, run your own server that holds the API key in an environment variable and set its URL in <code>js/config.js</code>. <b>Never put an API key in front-end code.</b></li></ul>`;
}
