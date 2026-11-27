# 99% Invisible: NYC (college prototype)

Based on *The 99% Invisible City* by Roman Mars and Kurt Kohlstedt. Not affiliated with the authors or publisher.

## Open it
1. VS Code > File > Open Folder > choose this folder.
2. Install the "Live Server" extension (VS Code will suggest it).
3. Right-click `index.html` > Open with Live Server. (Double-clicking `index.html` also works.)
4. You need internet for the map tiles, fonts and the Leaflet library.

## The five destinations
| Destination | What it is |
|---|---|
| Explore | Live map of the 21 New York stories (20 pinned). Each pin shows how it was checked and an uncertainty circle. |
| Field Guide | All 125 stories in the book's 6 chapters and 25 subcategories. Search, filter, full entries with PDF page references. |
| Field Agent | **Simulated** retrieval over the 125 stories (BM25 keyword search). Quotes the database with citations; says "I can't find that" instead of guessing. No language model runs. |
| Field Notes | Save stories, add your own notes and sightings, export as Markdown or JSON. Stored in your browser only. |
| About | Sources, method, pin accuracy, what is simulated, known limits. |

Addresses: `#/explore`, `#/explore/65`, `#/guide`, `#/guide/65`, `#/agent`, `#/agent?q=elevator`, `#/notes`, `#/about`, `#/identify`.

## Structure
- `index.html`, `css/styles.css`, `js/*.js` the site (no build step).
- `content/` the database (JSON). `site-data.js` is generated from it. `extraction-progress.json` is the tracker.
- `tools/build_site_data.py` regenerates `content/site-data.js`. Run `python3 tools/build_site_data.py` after editing any JSON in `content/`.
- `review.html` plain review view of the database.
- `docs/` the project briefs.

## Layers
- **Layer A** (book): summary, function, context, takeaway, places named, sources the book cites. Never altered.
- **Layer B** (outside research): shown in dashed boxes "not from the book", with source URLs, access date and verification status. Mostly single secondary sources; confirm before launch.

## Field Agent and API keys
**Never put an API key in front-end code.** To add a real model later, run your own small server that keeps the key in an environment variable, and set its URL in `js/config.js` (`FIELD_AGENT_ENDPOINT`). The page sends it the question and the retrieved passages and shows the reply separately from the book text.

## Status
Milestone 1 (content database) complete. Reviewed database connected to the website. Layer B research done for 17 of 21 New York stories. Open items are in `content/extraction-progress.json`.
The book PDF is not included; keep it in a `source/` folder if you want it with the project.

## AR field mode and Identify (simulated)
Both run on original schematic illustrations in `js/scenes.js`, drawn for this project (not the book's artwork). 14 New York stories have one. Overlay labels and the side list come from each story's `visualClues` in `content/discoveries.json`. Highlights are placed by hand: no camera, tracking or recognition. To add a scene, add an entry to `SCENES` keyed by story number with an `svg()` drawing and `hot` boxes (`c` = index into that story's clues).

## Redesign v3 (in progress, phase by phase)
- Phase 2 landing: `img/streets.svg` is an abstract procedural street texture made by `tools/make_streets.py` (not a real map). Credits line follows the supplied slide.
- Phase 3 Explore: basemap is CARTO dark tiles (fallback Esri/OSM, inverted) tinted black and khaki with CSS filters; the location ring is 1.25 px, hidden during zoom and redrawn at the new scale; the side panel is the six-part numbered layout.
- Fonts: `fonts/Nyc-Regular.ttf` is the display font (letters and basic punctuation only; digits and % fall back to Lilita One).
- Basemap: keyless Esri dark-grey canvas + labels (CARTO now requires an API key), tinted black/yellow with CSS.

## Book illustrations (v3.3)
`img/book/` holds 128 illustrations from the team's "99 Invisible City Illustrations and Descriptions" catalogue (extracted from the book PDF). `tools/build_book_images.py` maps each image to a story by its source PDF page (4 shared pages and the 6 chapter-opener images were checked by eye) and writes `content/book-images.js`. 73 of 125 stories have at least one image; the rest show an original drawing (where one exists) or a number block. These are the book's artwork: keep the credit line, and do not publish without permission.
