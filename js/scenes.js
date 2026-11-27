(function(){
/* ===== Original schematic illustrations for AR field mode and Identify =====
 * Drawn for this prototype. They are simple, generic, not to scale and NOT taken from the book.
 * Each scene: svg (600x450 viewBox), hot = hotspots {x,y,w,h,c,t}:
 *   c = index into that story's visualClues (the database's "look for" clues), or -1 when it comes from the look-for prompt;
 *   t = short label drawn on the overlay. */
const K = '#111', G1 = '#d6d2c0', G2 = '#b9b6a6', G3 = '#9b9886', G4 = '#777', G5 = '#555', G6 = '#333', W = '#f4f1e8';
const R = (x, y, w, h, f, s = 2) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}"${s ? ` stroke="${K}" stroke-width="${s}"` : ''}/>`;
const Ln = (a, b, c, d, w = 2, col = K) => `<line x1="${a}" y1="${b}" x2="${c}" y2="${d}" stroke="${col}" stroke-width="${w}"/>`;
const Po = (pts, f, s = 2) => `<polygon points="${pts}" fill="${f}"${s ? ` stroke="${K}" stroke-width="${s}"` : ''}/>`;
const Ci = (x, y, r, f, s = 2) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}"${s ? ` stroke="${K}" stroke-width="${s}"` : ''}/>`;
const Tx = (x, y, t, sz = 14, col = K, anchor = 'middle') => `<text x="${x}" y="${y}" text-anchor="${anchor}" style="font:700 ${sz}px 'Space Mono',monospace" fill="${col}">${t}</text>`;
const Pa = (d, f, s = 2) => `<path d="${d}" fill="${f}"${s ? ` stroke="${K}" stroke-width="${s}"` : ''}/>`;
const sky = (g = 380) => R(0, 0, 600, 450, G1, 0) + R(0, g, 600, 450 - g, G4, 0) + R(0, g - 4, 600, 6, G5, 0);
const win = (x, y, w, h, f = W) => R(x, y, w, h, f) + Ln(x + w / 2, y, x + w / 2, y + h, 1.5, G4) + Ln(x, y + h / 2, x + w, y + h / 2, 1.5, G4) + R(x - 3, y + h, w + 6, 5, G2);

const SCENES = {
  /* 6 Fake Facades: three row houses, the middle one has blacked-out windows */
  6: {
    cap: 'A row house that is not a house', svg: () => { let s = sky(380);
      [[20, true], [215, false], [410, true]].forEach(([x, real]) => {
        s += R(x, 110, 170, 270, real ? '#a59f8a' : '#968f7b') + R(x - 4, 100, 178, 18, G3) + Ln(x, 140, x + 170, 140, 1, G5);
        for (let r = 0; r < 3; r++)for (let c = 0; c < 2; c++) { const wx = x + 22 + c * 74, wy = 150 + r * 72;
          s += real ? win(wx, wy, 52, 52) : R(wx, wy, 52, 52, K) + Ln(wx + 26, wy, wx + 26, wy + 52, 1.5, G6) + Ln(wx, wy + 26, wx + 52, wy + 26, 1.5, G6) + R(wx - 3, wy + 52, 58, 5, G6) }
        s += R(x + 62, 320, 46, 60, real ? G6 : K) });
      s += Po('248,380 248,368 352,368 352,380', G3) + Po('256,368 256,356 344,356 344,368', G2) + R(258, 322, 84, 34, K, 0) + Tx(300, 408, 'NO. 58', 13, K); return s },
    hot: [{ x: 232, y: 146, w: 136, h: 190, c: 2, t: 'Jet-black windows' }, { x: 246, y: 352, w: 108, h: 30, c: 3, t: 'Stoop and brick front' }]
  },
  /* 7 Ventilation Buildings */
  7: {
    cap: 'A windowless tower on the waterfront', svg: () => { let s = sky(300) + R(0, 300, 600, 150, G5, 0);
      for (let i = 0; i < 9; i++)s += Ln(0, 322 + i * 14, 600, 322 + i * 14 + (i % 2 ? 3 : -3), 1.5, G3);
      s += R(205, 60, 190, 245, '#a59f8a') + R(195, 296, 210, 16, G3) + R(190, 308, 220, 10, G4);
      for (let i = 0; i < 8; i++)s += Pa(`M${210 + i * 22} 100 v-14 a10 10 0 0 1 20 0 v14 z`, G2, 1.5);
      s += R(200, 104, 200, 6, G3) + R(196, 112, 208, 6, G4);
      for (let i = 0; i < 5; i++)s += R(240 + i * 26, 150, 14, 120, G6, 1.5) + [0, 1, 2, 3, 4, 5, 6, 7, 8].map(j => Ln(240 + i * 26, 156 + j * 13, 254 + i * 26, 150 + j * 13 + 6, 1, G3)).join('');
      s += Ci(207, 126, 6, G2, 1.5) + Ci(393, 126, 6, G2, 1.5);
      s += R(475, 170, 60, 140, '#a59f8a') + R(470, 164, 70, 10, G3);
      for (let i = 0; i < 3; i++)s += R(486 + i * 16, 190, 8, 70, G6, 1);
      s += R(462, 304, 86, 12, G3); return s },
    hot: [{ x: 205, y: 82, w: 190, h: 42, c: 1, t: 'Arch strings' }, { x: 235, y: 146, w: 135, h: 128, c: 2, t: 'Louvre panels' }, { x: 190, y: 296, w: 220, h: 26, c: 3, t: 'Cantilevered base' }, { x: 465, y: 160, w: 80, h: 160, c: 0, t: 'Tower in the river' }]
  },
  /* 38 Utility Poles */
  38: {
    cap: 'What a utility pole is carrying', svg: () => { let s = sky(390);
      s += R(288, 40, 24, 380, '#8a8672') + Ln(300, 40, 300, 420, 1, G5);
      [[78, 150, 450], [130, 190, 410]].forEach(([y, a, b]) => { s += R(a - 20, y, b - a + 40, 12, '#7d7966'); [a, a + 60, b - 60, b].forEach(x => s += R(x - 4, y - 10, 8, 10, G2, 1.5)) });
      for (let k = 0; k < 4; k++)s += `<path d="M${150 + k * 20} 68 Q 80 ${96 + k * 8} 10 ${90 + k * 14}" stroke="${K}" stroke-width="2" fill="none"/>`;
      for (let k = 0; k < 6; k++)s += `<path d="M${410 + k * 8} ${68 + (k % 2) * 56} Q 500 ${100 + k * 10} 595 ${110 + k * 12}" stroke="${K}" stroke-width="${k < 3 ? 3 : 2}" fill="none"/>`;
      s += R(316, 168, 34, 62, G3) + Pa('M316 168 q17 -14 34 0', G2) + Ln(333, 230, 300, 250, 2);
      s += R(318, 262, 54, 64, '#a53' + '', 0).replace('#a53', G2) + R(322, 268, 46, 34, G4) + Ci(345, 318, 4, K, 0) + Tx(345, 289, 'CALL', 9, W);
      s += Ln(300, 250, 330, 262, 2) + R(272, 330, 8, 6, G6, 0); return s },
    hot: [{ x: 148, y: 72, w: 304, h: 20, c: 0, t: 'Wooden crossarm' }, { x: 410, y: 58, w: 185, h: 120, c: 1, t: 'Bundled cables' }, { x: 314, y: 258, w: 62, h: 72, c: 2, t: 'Call box' }]
  },
  /* 57 Revolving Doors */
  57: {
    cap: 'Three ways through the same wall', svg: () => { let s = R(0, 0, 600, 450, G2, 0) + R(0, 396, 600, 54, G4, 0) + R(30, 70, 540, 330, '#a59f8a') + R(40, 78, 520, 22, G3);
      [[70, 150], [410, 150]].forEach(([x]) => { s += R(x, 130, 120, 266, W) + Ln(x + 60, 130, x + 60, 396, 3) + R(x + 6, 140, 48, 250, '#cfe6e0', 1.5) + R(x + 66, 140, 48, 250, '#cfe6e0', 1.5) + R(x + 6, 262, 108, 12, G5, 1.5) });
      s += R(215, 130, 170, 266, W) + Pa('M215 130 a85 40 0 0 1 170 0', G2) + Ci(300, 265, 80, '#cfe6e0', 3) + Ln(300, 195, 300, 335, 3) + Ln(230, 265, 370, 265, 3) + Ln(248, 213, 352, 317, 2, G5) + Ln(352, 213, 248, 317, 2, G5);
      s += Tx(300, 118, 'ENTRANCE', 13, K); return s },
    hot: [{ x: 215, y: 150, w: 170, h: 246, c: 0, t: 'Revolving door' }, { x: 410, y: 256, w: 120, h: 28, c: 1, t: 'Panic bar' }]
  },
  /* 58 Emergency Exits: fire escape on a tenement */
  58: {
    cap: 'An escape bolted onto a facade', svg: () => { let s = sky(404) + R(90, 90, 420, 316, '#a59f8a') + R(84, 80, 432, 14, G3) + R(272, 62, 58, 20, G4);
      for (let f = 0; f < 4; f++)for (let c = 0; c < 4; c++)s += win(120 + c * 96, 112 + f * 70, 50, 46);
      for (let f = 0; f < 4; f++) { const y = 160 + f * 70; s += R(150, y, 220, 8, G6, 1.5) + Ln(150, y, 150, y - 22, 2) + Ln(370, y, 370, y - 22, 2) + Ln(150, y - 22, 370, y - 22, 2);
        if (f < 3) s += `<path d="M${f % 2 ? 160 : 350} ${y + 8} L ${f % 2 ? 350 : 160} ${y + 70}" stroke="${K}" stroke-width="4" fill="none"/>` + `<path d="M${f % 2 ? 170 : 340} ${y + 8} L ${f % 2 ? 360 : 150} ${y + 70}" stroke="${K}" stroke-width="2" fill="none" stroke-dasharray="6 5"/>` }
      s += Ln(180, 370, 180, 410, 4) + Ln(198, 370, 198, 410, 4); [376, 386, 396, 406].forEach(y => s += Ln(180, y, 198, y, 2)); return s },
    hot: [{ x: 148, y: 138, w: 226, h: 240, c: 0, t: 'Iron fire escape' }, { x: 172, y: 366, w: 34, h: 46, c: 1, t: 'Drop ladder' }, { x: 268, y: 58, w: 66, h: 28, c: 2, t: 'Scuttle hatch' }]
  },
  /* 65 Modern Elevators */
  65: {
    cap: 'The clues around an elevator door', svg: () => { let s = R(0, 0, 600, 450, G2, 0) + R(0, 410, 600, 40, G4, 0) + R(150, 110, 300, 300, G3) + R(170, 130, 130, 280, G2) + R(300, 130, 130, 280, G2) + Ln(300, 130, 300, 410, 3);
      [0, 1, 2, 3, 4, 5].forEach(i => s += Ln(170, 170 + i * 40, 300, 170 + i * 40, 1, G4) + Ln(300, 170 + i * 40, 430, 170 + i * 40, 1, G4));
      s += Pa('M205 108 a95 80 0 0 1 190 0 z', W) + Pa('M215 104 a85 70 0 0 1 170 0', 'none', 1.5);
      for (let i = 0; i < 7; i++) { const a = Math.PI * (1 - i / 6), x = 300 + 70 * Math.cos(a), y = 106 - 58 * Math.sin(a); s += Tx(x, y + 5, i + 1, 11, K) }
      s += Ln(300, 106, 270, 62, 3) + Ci(300, 106, 6, K, 0);
      s += R(470, 220, 100, 56, '#b8b08e') + Tx(520, 242, 'ELEVATOR', 10, K) + Tx(520, 258, 'CO. · N.Y.', 10, K) + Ci(478, 228, 2, K, 0) + Ci(562, 228, 2, K, 0) + Ci(478, 268, 2, K, 0) + Ci(562, 268, 2, K, 0);
      return s },
    hot: [{ x: 205, y: 34, w: 190, h: 84, c: 1, t: 'Floor dial' }, { x: 466, y: 216, w: 108, h: 64, c: 0, t: 'Brand plate' }]
  },
  /* 67 Skyscraper Races */
  67: {
    cap: 'Two crowns in a race', svg: () => { let s = sky(404);
      s += R(112, 180, 136, 224, '#a59f8a') + R(104, 172, 152, 12, G3);
      [[0, 120, 52], [1, 98, 44], [2, 76, 36], [3, 54, 26]].forEach(([i, w, h]) => { s += Pa(`M${180 - w / 2 - 6} ${172 - i * 34} a${w / 2 + 6} ${h + 8} 0 0 1 ${w + 12} 0 z`, i % 2 ? G2 : G3);
        for (let k = 0; k < 5 - i; k++)s += Po(`${180 - (w - 20) / 2 + k * ((w - 20) / (4 - i || 1)) - 4},${170 - i * 34} ${180 - (w - 20) / 2 + k * ((w - 20) / (4 - i || 1))},${158 - i * 34} ${180 - (w - 20) / 2 + k * ((w - 20) / (4 - i || 1)) + 4},${170 - i * 34}`, W, 1) });
      s += Ln(180, 36, 180, 62, 3) + Po('150,196 158,196 154,184', G6, 1) + Po('202,196 210,196 206,184', G6, 1) + Po('106,240 118,240 112,226', G6, 1) + Po('242,240 254,240 248,226', G6, 1);
      for (let r = 0; r < 6; r++)for (let c = 0; c < 4; c++)s += R(124 + c * 30, 262 + r * 22, 14, 12, W, 1);
      s += R(350, 232, 150, 172, '#a59f8a') + Po('340,232 510,232 450,150 400,150', G3) + Po('400,150 450,150 425,100', G2) + Ln(425, 100, 425, 70, 2) + R(405, 150, 40, 14, G4);
      for (let r = 0; r < 7; r++)for (let c = 0; c < 5; c++)s += R(364 + c * 28, 250 + r * 21, 14, 11, W, 1);
      s += Tx(180, 430, 'A', 12, K) + Tx(425, 430, 'B', 12, K); return s },
    hot: [{ x: 124, y: 36, w: 112, h: 144, c: 0, t: 'Arches and sunburst windows' }, { x: 100, y: 180, w: 160, h: 62, c: 1, t: 'Corner eagles' }]
  },
  /* 68 Managing Crises */
  68: {
    cap: 'A tower standing on four legs', svg: () => { let s = sky(404);
      s += Po('150,150 450,150 450,120 150,60', '#a59f8a') + R(150, 150, 300, 160, '#a59f8a');
      for (let r = 0; r < 6; r++)s += Ln(150, 160 + r * 24, 450, 160 + r * 24, 6, G2);
      for (let r = 0; r < 6; r++)s += R(150, 163 + r * 24, 300, 3, G4, 0);
      s += R(144, 306, 312, 10, G5) + R(280, 316, 40, 90, G3) + Ln(300, 316, 300, 406, 1.5, G5);
      s += R(150, 360, 100, 46, G2) + Po('150,360 250,360 200,320', G4) + Ln(200, 320, 200, 298, 3) + Ln(190, 308, 210, 308, 3);
      s += R(176, 378, 18, 28, G6, 1.5) + R(206, 378, 18, 28, G6, 1.5) + R(168, 94, 30, 22, W, 1.5) + Tx(183, 110, 'TMD', 9, K); return s },
    hot: [{ x: 272, y: 308, w: 56, h: 100, c: 0, t: 'Stilt at mid-side' }, { x: 148, y: 58, w: 304, h: 96, c: 1, t: 'Sloped roof' }, { x: 146, y: 296, w: 112, h: 112, c: 2, t: 'Corner church' }]
  },
  /* 94 Neighborhood Monikers */
  94: {
    cap: 'A street that names its neighbourhood', svg: () => { let s = sky(404) + R(30, 90, 270, 314, '#8e8a78') + R(24, 80, 282, 12, G3);
      for (let f = 0; f < 3; f++) { for (let c = 0; c < 4; c++) { const x = 42 + c * 64, y = 112 + f * 92; s += Ln(x, y, x, y + 80, 5, G2) + Pa(`M${x + 6} ${y + 80} v-52 a24 24 0 0 1 48 0 v52 z`, '#333', 1.5) + Ln(x + 30, y + 28, x + 30, y + 80, 1.5, '#aaa') } s += Ln(30, 100 + f * 92 + 94, 300, 100 + f * 92 + 94, 3, G3) }
      s += R(318, 90, 252, 314, '#a0522d' + '', 0).replace('#a0522d', '#a1907d') + R(318, 90, 252, 314, 'none', 2);
      for (let r = 0; r < 7; r++)for (let c = 0; c < 6; c++)s += R(318 + c * 42 + ((r % 2) ? 0 : 0), 96 + r * 14, 40, 12, '#b4a18c', 0);
      [0, 1].forEach(i => s += R(338 + i * 112, 114, 92, 120, '#ddd7c4') + Ln(384 + i * 112, 114, 384 + i * 112, 234, 2) + Ln(338 + i * 112, 174, 430 + i * 112, 174, 2) + R(332 + i * 112, 108, 104, 6, G5, 0) + Ln(332 + i * 112, 90, 332 + i * 112, 120, 5, G6));
      s += R(330, 300, 230, 40, K) + Tx(445, 328, 'SoHo CAFE', 22, '#FFF34A') + R(330, 344, 230, 52, G3) + R(344, 354, 36, 42, K, 0) + Tx(445, 380, 'SOUTH OF HOUSTON', 11, W); return s },
    hot: [{ x: 28, y: 90, w: 276, h: 314, c: 0, t: 'Cast-iron facade' }, { x: 332, y: 106, w: 230, h: 136, c: 1, t: 'Loft windows' }, { x: 328, y: 298, w: 234, h: 44, c: 2, t: 'Acroname on a sign' }]
  },
  /* 101 High Line */
  101: {
    cap: 'A railway turned into a park', svg: () => { let s = sky(404);
      s += R(390, 70, 180, 334, '#a59f8a') + R(384, 62, 192, 12, G3); for (let r = 0; r < 6; r++)for (let c = 0; c < 3; c++)if (!(r == 3)) s += win(404 + c * 54, 90 + r * 50, 36, 30);
      s += R(390, 232, 180, 54, G1, 0) + Pa('M390 286 v-54 h180 v54', 'none', 0) + R(390, 232, 180, 3, G5, 0) + R(390, 283, 180, 3, G5, 0);
      s += R(0, 286, 600, 22, G5) + R(0, 308, 600, 10, G6) + [0, 1, 2, 3, 4, 5, 6, 7].map(i => R(i * 80 + 20, 318, 12, 86, G6, 0) + Ln(i * 80 + 26, 318, i * 80 + 66, 404, 2, G5)).join('');
      s += R(0, 276, 600, 12, G3);
      for (let i = 0; i < 22; i++) { const x = 10 + i * 26; s += Pa(`M${x} 276 q${(i % 3) * 3 - 3} -${18 + (i * 7) % 22} ${6} -${10 + (i * 5) % 16} q3 ${10} ${4} ${10 + (i * 5) % 16}`, '#6f7a5e', 1) }
      s += Ln(60, 276, 260, 276, 3, K) + R(150, 250, 60, 8, G2) + Ln(158, 258, 158, 276, 2) + Ln(202, 258, 202, 276, 2) + R(280, 236, 24, 40, G2) + Tx(292, 262, 'VEND', 6, K);
      s += Ln(100, 290, 280, 290, 2, W) + Ln(100, 296, 280, 296, 2, W); return s },
    hot: [{ x: 4, y: 236, w: 270, h: 56, c: 0, t: 'Planted rail' }, { x: 146, y: 246, w: 70, h: 32, c: 1, t: 'Seating' }, { x: 386, y: 226, w: 190, h: 66, c: 2, t: 'Walkway through a building' }]
  },
  /* 105 Common Squirrels */
  105: {
    cap: 'Squirrels, oaks and poles', svg: () => { let s = sky(390);
      s += R(104, 190, 38, 200, '#6f6b58') + `<path d="M120 250 L60 190 M125 230 L190 168" stroke="#6f6b58" stroke-width="12" fill="none"/>`;
      [[120, 120, 100], [60, 170, 62], [190, 150, 66], [140, 80, 52]].forEach(([x, y, r]) => s += Ci(x, y, r, '#7e8670', 0)); s += Ci(120, 120, 100, 'none', 2);
      s += R(440, 40, 22, 360, '#8a8672') + R(400, 74, 100, 10, '#7d7966') + Ln(400, 78, 340, 100, 2) + Ln(500, 78, 580, 106, 2);
      s += Pa('M436 240 q-32 -40 -10 -86 q18 -4 14 30 q10 20 -4 56 z', G3, 2);
      s += `<ellipse cx="458" cy="252" rx="16" ry="26" fill="${G2}" stroke="${K}" stroke-width="2"/>` + Ci(456, 222, 12, G2) + Po('448,212 446,198 454,208', G2, 1.5) + Ci(452, 220, 2, K, 0) + R(448, 276, 6, 10, G3, 1) + R(462, 276, 6, 10, G3, 1);
      s += Ln(0, 390, 600, 390, 3) + `<ellipse cx="300" cy="396" rx="60" ry="6" fill="${G5}"/>`; return s },
    hot: [{ x: 420, y: 150, w: 70, h: 140, c: 0, t: 'Squirrel on a pole' }, { x: 20, y: 20, w: 220, h: 200, c: 1, t: 'Oak in a park' }]
  },
  /* 106 Fish Stories: street over a buried stream */
  106: {
    cap: 'The street above, the stream below', svg: () => { let s = R(0, 0, 600, 190, G1, 0) + R(0, 190, 600, 260, '#6e6a5b', 0) + R(0, 180, 600, 14, G5, 0);
      s += R(60, 40, 130, 38, '#1f5d3f' + '', 0).replace('#1f5d3f', G6) + Tx(125, 66, 'CANAL ST', 17, W) + Ln(60, 78, 60, 180, 5) + Ln(190, 78, 190, 180, 5) + R(300, 60, 260, 120, '#a59f8a') + [0, 1, 2, 3].map(i => win(318 + i * 62, 80, 36, 40)).join('') + R(380, 138, 40, 42, G6);
      for (let i = 0; i < 14; i++)s += Ln(10 + i * 44, 194, 28 + i * 44, 210, 1, G3);
      s += `<path d="M0 330 q80 -34 160 0 t160 0 t160 0 t160 0" stroke="${W}" stroke-width="26" fill="none" opacity=".85"/>` + `<path d="M0 330 q80 -34 160 0 t160 0 t160 0 t160 0" stroke="${K}" stroke-width="2" fill="none" stroke-dasharray="8 6"/>`;
      s += `<ellipse cx="400" cy="318" rx="26" ry="10" fill="${K}"/>` + Po('424,318 442,306 442,330', K, 0) + Ci(384, 316, 2, W, 0);
      s += R(260, 372, 90, 62, G2) + R(272, 384, 66, 20, G5) + Ci(305, 418, 8, G6) + Ln(305, 372, 305, 334, 5) + Ln(305, 340, 260, 340, 3); return s },
    hot: [{ x: 56, y: 36, w: 138, h: 46, c: 0, t: 'Street name' }, { x: 256, y: 366, w: 98, h: 72, c: 1, t: 'Basement pump' }]
  },
  /* 124 Grassroots Gardening */
  124: {
    cap: 'A garden on a corner lot', svg: () => { let s = sky(364);
      s += R(0, 90, 200, 274, '#a59f8a') + [0, 1, 2].map(i => win(30 + i * 56, 120, 34, 48)).join('') + [0, 1, 2].map(i => win(30 + i * 56, 220, 34, 48)).join('');
      s += R(430, 70, 170, 294, '#8e8a78') + Tx(515, 140, 'GREEN', 26, '#8fb58a') + Tx(515, 176, 'GRO', 26, '#8fb58a') + [0, 1, 2, 3, 4, 5, 6, 7].map(i => `<circle cx="${446 + i * 20}" cy="${200 + (i % 3) * 6}" r="5" fill="#8fb58a" opacity=".6"/>`).join('');
      s += R(262, 180, 18, 184, '#6f6b58') + Ci(271, 140, 72, '#7e8670', 0) + Ci(222, 170, 40, '#7e8670', 0) + Ci(322, 170, 40, '#7e8670', 0);
      [[240, 130], [290, 110], [320, 160], [220, 170], [262, 160], [300, 140], [250, 100]].forEach(([x, y]) => s += Ci(x, y, 8, W, 1.5));
      s += R(0, 330, 600, 34, '#8c8a6c', 0) + R(130, 326, 330, 8, G5, 0);
      for (let i = 0; i < 12; i++)s += Ln(130 + i * 30, 300, 130 + i * 30, 364, 1.5, G5);
      s += Ln(130, 310, 460, 310, 1.5, G5) + Ln(130, 340, 460, 340, 1.5, G5);
      s += R(150, 344, 110, 18, '#5b4a35', 0) + R(310, 344, 130, 18, '#5b4a35', 0) + [0, 1, 2, 3, 4].map(i => Ci(165 + i * 22, 340, 6, '#6f7a5e', 0)).join('') + [0, 1, 2, 3, 4, 5].map(i => Ci(322 + i * 20, 340, 6, '#6f7a5e', 0)).join(''); return s },
    hot: [{ x: 196, y: 72, w: 150, h: 120, c: 0, t: 'Fruit on a street tree' }, { x: 436, y: 112, w: 160, h: 112, c: 1, t: 'Moss graffiti' }]
  },
  /* 125 Collaborative Placemaking: sneckdown, seen from above */
  125: {
    cap: 'Snow shows how little road cars use', svg: () => { let s = R(0, 0, 600, 450, '#c9c6b8', 0) + R(0, 160, 600, 130, G5, 0) + R(235, 0, 130, 450, G5, 0);
      s += R(0, 160, 600, 6, '#ddd', 0) + R(0, 284, 600, 6, '#ddd', 0) + R(235, 0, 6, 450, '#ddd', 0) + R(359, 0, 6, 450, '#ddd', 0);
      [[0, 0, 235, 160], [365, 0, 235, 160], [0, 290, 235, 160], [365, 290, 235, 160]].forEach(([x, y, w, h]) => s += R(x, y, w, h, '#a8a592', 0));
      s += Pa('M235 160 q-8 -38 -52 -48 q-4 -30 -50 -30 h-8 v78 z', W, 1.5).replace('M235 160', 'M235 160') + Pa('M365 160 q8 -38 52 -48 q4 -30 50 -30 h8 v78 z', W, 1.5) + Pa('M235 290 q-8 38 -52 48 q-4 30 -50 30 h-8 v-78 z', W, 1.5) + Pa('M365 290 q8 38 52 48 q4 30 50 30 h8 v-78 z', W, 1.5);
      s += Pa('M235 160 q4 18 20 30 q30 30 45 30 q15 0 45 -30 q16 -12 20 -30', 'none', 0);
      s += `<path d="M0 205 H235 q40 0 55 20 q-15 20 -55 20 H0" stroke="${G3}" stroke-width="3" fill="none" stroke-dasharray="10 8"/>` + `<path d="M600 205 H365 q-40 0 -55 20 q15 20 55 20 H600" stroke="${G3}" stroke-width="3" fill="none" stroke-dasharray="10 8"/>`;
      s += Pa('M118 140 q4 12 18 12 q10 -8 6 -18 q-12 0 -24 6 z', '#7e8a5e', 1) + Pa('M104 124 q10 -4 16 4 q-10 6 -16 -4 z', '#8a7a4e', 1) + Ln(96, 138, 150, 150, 2, '#eee') + Ln(100, 146, 138, 156, 2, '#eee'); return s },
    hot: [{ x: 365, y: 82, w: 140, h: 86, c: 0, t: 'Snow at the corner' }, { x: 90, y: 96, w: 100, h: 66, c: 1, t: 'Leaves and chalk' }]
  }
};
window.SCENES = SCENES;
})();
