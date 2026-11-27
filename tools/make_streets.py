"""Generates img/streets.svg: an ABSTRACT street-grid texture for the landing page.
It is a procedural pattern (rotated grids, avenues, black 'water'), not a survey of real streets."""
import random, math
random.seed(99)
W,H=1600,900
patches=[ # polygon, grid angle, block w, block h
 ([(-20,330),(520,170),(760,330),(640,560),(120,700),(-20,640)],29,9,26),
 ([(540,-20),(980,-20),(1060,260),(780,330),(620,180)],0,12,12),
 ([(820,380),(1250,250),(1620,330),(1620,740),(1100,700),(900,560)],-18,10,18),
 ([(1020,-20),(1620,-20),(1620,230),(1280,230)],12,14,10),
 ([(160,720),(640,600),(1000,760),(1060,920),(160,920)],29,9,26),
 ([(-20,-20),(500,-20),(430,120),(-20,260)],-8,12,9)]
out=[f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMid slice"><rect width="{W}" height="{H}" fill="#000"/><defs>']
for i,(p,a,bw,bh) in enumerate(patches):
    out.append(f'<clipPath id="c{i}"><polygon points="{" ".join(f"{x},{y}" for x,y in p)}"/></clipPath>')
out.append('</defs>')
for i,(p,a,bw,bh) in enumerate(patches):
    out.append(f'<g clip-path="url(#c{i})"><g transform="rotate({a} 800 450)" stroke="#9a9a7c" fill="none">')
    d=[];y=-900
    while y<1800:
        d.append(f'M-900 {y:.1f}H2500'); y+=bh*random.uniform(.7,1.5)
    out.append(f'<path d="{"".join(d)}" stroke-width=".8" opacity=".75"/>')
    d=[];x=-900
    while x<2500:
        d.append(f'M{x:.1f} -900V1800'); x+=bw*random.uniform(.8,1.3)*random.choice([1,1,1,3])
    out.append(f'<path d="{"".join(d)}" stroke-width=".7" opacity=".55"/>')
    d=[];y=-900
    while y<1800:
        d.append(f'M-900 {y:.1f}H2500'); y+=bh*random.uniform(7,11)
    out.append(f'<path d="{"".join(d)}" stroke-width="2.4"/></g></g>')
# arterials / bridges crossing the black gaps
for _ in range(9):
    x1,y1=random.randint(0,W),random.randint(0,H); a=random.uniform(0,math.pi); L=random.randint(300,900)
    x2,y2=x1+L*math.cos(a),y1+L*math.sin(a); cx,cy=(x1+x2)/2+random.randint(-90,90),(y1+y2)/2+random.randint(-90,90)
    out.append(f'<path d="M{x1:.0f} {y1:.0f}Q{cx:.0f} {cy:.0f} {x2:.0f} {y2:.0f}" stroke="#9a9a7c" stroke-width="{random.choice([1.6,2.6,3.4])}" fill="none" opacity=".8"/>')
out.append('</svg>')
open('img/streets.svg','w').write(''.join(out))
