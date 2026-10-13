// TEMPLATE 4: risograph / screen-print editorial (3 spot inks, halftone, misregistration, cut paper, stamps)
(function(){const cv=document.getElementById('cv'),st=document.getElementById('st');const r=rng(44);
const P='#F1EADB',Y='#FFD21A',O='#FF5126',B='#2140B4',MUL='style="mix-blend-mode:multiply"';
const DEFS=`<defs>
<filter id="ink" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".03" numOctaves="2" seed="7" result="w"/><feDisplacementMap in="SourceGraphic" in2="w" scale="3.5" result="d"/>
 <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="2" result="sp"/><feColorMatrix in="sp" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -16 0 0 0 10.8" result="holes"/><feComposite in="d" in2="holes" operator="in"/></filter>
<filter id="stamp" x="-15%" y="-15%" width="130%" height="130%"><feTurbulence type="fractalNoise" baseFrequency=".06" numOctaves="2" seed="5" result="w"/><feDisplacementMap in="SourceGraphic" in2="w" scale="4" result="d"/>
 <feTurbulence type="fractalNoise" baseFrequency=".55" numOctaves="2" seed="9" result="sp"/><feColorMatrix in="sp" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -12 0 0 0 7.9" result="holes"/><feComposite in="d" in2="holes" operator="in"/></filter>
<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="11"/><feColorMatrix values="0 0 0 0 .2  0 0 0 0 .16  0 0 0 0 .12  0 0 0 -1.5 .95"/></filter>
<pattern id="lines" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)"><rect width="14" height="6" fill="${O}"/></pattern>
<pattern id="dotB" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><circle cx="6" cy="6" r="3.2" fill="${B}"/></pattern>
</defs>`;
const ink=(c,inner,f,knock)=>`<g ${knock?'':MUL}><g filter="url(#${f||'ink'})" fill="${c}">${inner}</g></g>`;
// variable halftone disc: dots grow toward (dx,dy) direction
function htDisc(cx,cy,R,step,col,dir,rmax){let s='';const a=Math.PI/4;for(let i=-R;i<=R;i+=step)for(let j=-R;j<=R;j+=step){const x=cx+i*Math.cos(a)-j*Math.sin(a),y=cy+i*Math.sin(a)+j*Math.cos(a);
  const d=Math.hypot(x-cx,y-cy);if(d>R-step*.3)continue;const t=Math.max(0,Math.min(1,((x-cx)*dir[0]+(y-cy)*dir[1])/R*.5+.5));const rr=step*.5*rmax*Math.pow(t,1.4);if(rr<.6)continue;
  s+=`<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(rr)}"/>`;}return s;}
function htRect(x0,y0,w,h,step,rfn){let s='';for(let x=x0;x<x0+w;x+=step)for(let y=y0;y<y0+h;y+=step){const rr=rfn((x-x0)/w,(y-y0)/h)*step*.55;if(rr>.6)s+=`<circle cx="${f1(x+((y/step)%2?step/2:0))}" cy="${f1(y)}" r="${f1(rr)}"/>`;}return s;}
function rays(cx,cy,n,R0,R1,w){let s='';for(let k=0;k<n;k++){const a=k*2*Math.PI/n,b=w/2;const p=(rr,aa)=>[cx+rr*Math.cos(aa),cy+rr*Math.sin(aa)];s+=poly([p(R0,a-b/R0),p(R1,a-b/R1*.4),p(R1,a+b/R1*.4),p(R0,a+b/R0)]);}return s;}
// stamped icons (single ink, outline style), centred at 0,0, ~140 box
const SO=(c,w)=>`fill="none" stroke="${c}" stroke-width="${w||9}" stroke-linejoin="round" stroke-linecap="round"`;
const ST={
 sun:c=>`<circle r="36" fill="${c}"/>`+`<g ${SO(c)}>${[...Array(12)].map((_,k)=>{const a=k*30*Math.PI/180;return `<path d="M${f1(50*Math.cos(a))} ${f1(50*Math.sin(a))} L${f1(68*Math.cos(a))} ${f1(68*Math.sin(a))}"/>`;}).join('')}</g>`,
 panel:c=>`<g ${SO(c)}><path d="M-60 30 L-40 -40 L60 -40 L44 30 Z"/><path d="M-53 6 L52 6 M-47 -17 L57 -17 M-27 -40 L-17 30 M7 -40 L13 30 M38 -40 L34 30"/><path d="M-30 30 L-30 62 M30 30 L30 62 M-50 64 L50 64"/></g>`,
 meter:c=>`<g ${SO(c)}><rect x="-48" y="-62" width="96" height="124" rx="14"/><path d="M-30 -10 A30 30 0 0 1 30 -10"/><path d="M0 -10 L18 -32"/></g><rect x="-30" y="22" width="60" height="22" rx="4" fill="${c}"/>`,
 house:c=>`<g ${SO(c)}><path d="M-60 -6 L0 -60 L60 -6"/><path d="M-46 -12 L-46 56 L46 56 L46 -12"/><path d="M-12 56 L-12 20 L12 20 L12 56"/></g><path d="M-36 -26 L-6 -52 L24 -26 Z" fill="${c}"/>`,
 bill:c=>`<g ${SO(c)}><path d="M-42 -62 L42 -62 L42 58 L28 48 L14 58 L0 48 L-14 58 L-28 48 L-42 58 Z"/><path d="M-26 -36 L26 -36 M-26 -14 L14 -14"/></g><text x="0" y="36" font-size="54" font-weight="900" fill="${c}" text-anchor="middle" class="wide">฿</text>`,
 tower:c=>`<g ${SO(c,8)}><path d="M-36 66 L-8 -66 L8 -66 L36 66"/><path d="M-30 40 L26 14 M30 40 L-26 14 M-24 14 L18 -14 M24 14 L-18 -14 M-17 -14 L12 -40 M17 -14 L-12 -40"/><path d="M-50 -40 L50 -40 M-40 -60 L40 -60"/></g>`,
 bolt:c=>`<path d="M10 -70 L-40 8 L-4 8 L-16 70 L40 -14 L4 -14 Z" fill="${c}"/>`,
 mw:c=>`<circle r="66" ${SO(c,6)}/><circle r="54" ${SO(c,3)}/><text x="0" y="15" font-size="40" class="lat" fill="${c}" text-anchor="middle">XX MW</text><text x="0" y="-32" font-size="15" font-weight="800" fill="${c}" text-anchor="middle">กำลังผลิต</text><text x="0" y="46" font-size="15" font-weight="800" fill="${c}" text-anchor="middle">โคราช</text>`,
 km:c=>`<rect x="-74" y="-40" width="148" height="80" rx="6" ${SO(c,6)}/><rect x="-64" y="-30" width="128" height="60" rx="3" fill="${c}"/><text x="0" y="18" font-size="46" class="lat" fill="${P}" text-anchor="middle">XX KM²</text>`,
 yen:c=>`<g ${SO(c)}><circle r="58"/><path d="M-30 0 L-6 24 L34 -22"/></g>`};
// ---------- cover ----------
let s=DEFS+`<rect width="1080" height="1920" fill="${P}"/>`;
// big sun (yellow) + halftone shading (orange) + rays
s+=ink(Y,`<circle cx="760" cy="520" r="290"/>`+rays(760,520,18,320,560,46));
s+=ink(O,htDisc(760,520,290,15,O,[.7,.7],1.15));
// diagonal hatch band
s+=`<g ${MUL} opacity=".9"><rect x="-40" y="1230" width="1200" height="130" fill="url(#lines)" transform="rotate(-6 540 1295)"/></g>`;
// bottom halftone ground (blue) fading upward
s+=ink(Y,`<rect x="0" y="1600" width="1080" height="340"/>`);
s+=ink(B,htRect(0,1520,1080,420,16,(u,v)=>Math.min(.72,v*.9+.08)));
// cut-paper scene: panel slab, tower, house
s+=ink(Y,`<g transform="rotate(-9 700 1380)"><rect x="520" y="1270" width="420" height="220"/></g>`);
s+=ink(B,`<g transform="rotate(-9 708 1376)"><path d="M520 1270 h420 v220 h-420 Z ${[...Array(5)].map((_,i)=>[...Array(3)].map((_,j)=>`M${534+i*82} ${1284+j*68} v56 h70 v-56 Z`).join('')).join('')}" fill-rule="evenodd"/></g>`,'ink',1);
s+=ink(O,`<path d="M150 1500 L208 1196 L228 1196 L286 1500 L256 1500 L218 1280 L180 1500 Z M140 1236 L296 1236 L296 1250 L140 1250 Z M156 1282 L280 1282 L280 1294 L156 1294 Z M190 1360 L250 1360 L250 1372 L190 1372 Z"/>`);
s+=ink(B,`<path d="M330 1500 L330 1386 L410 1322 L490 1386 L490 1500 Z M390 1500 L390 1440 L430 1440 L430 1500 Z" fill-rule="evenodd"/>`);
// registration marks + crop
const reg=(x,y)=>`<g stroke="${B}" stroke-width="2.5" fill="none"><circle cx="${x}" cy="${y}" r="16"/><path d="M${x-28} ${y} h56 M${x} ${y-28} v56"/></g>`;
s+=reg(60,60)+reg(1020,60)+reg(60,1860)+reg(1020,1860);
s+=`<g ${MUL}>${[[O,0],[Y,1],[B,2]].map(([c,k])=>`<rect x="${880+k*36}" y="1560" width="30" height="30" fill="${c}"/>`).join('')}</g>`;
cv.innerHTML=s;
const T=add(cv,'<g></g>');
// misregistered headline: two passes
const two=(x,y,txt,fs,c1,c2,dx,dy,maxW,anchor)=>{const a=add(T,`<g ${MUL}><g filter="url(#ink)"><text x="${x+dx}" y="${y+dy}" font-size="${fs}" font-weight="900" fill="${c2}" ${anchor?'text-anchor="'+anchor+'"':''}>${txt}</text></g></g>`);
  const b=add(T,`<g><g filter="url(#ink)"><text class="key" x="${x}" y="${y}" font-size="${fs}" font-weight="900" fill="${c1}" ${anchor?'text-anchor="'+anchor+'"':''}>${txt}</text></g></g>`);
  const tb=b.querySelector('text');if(maxW){fit(tb,maxW);a.querySelector('text').setAttribute('font-size',tb.getAttribute('font-size'));}return tb;};
add(T,`<text class="key lat" x="92" y="300" font-size="40" fill="${B}" letter-spacing="2">NO.01</text>`);
add(T,`<text class="key" x="200" y="298" font-size="36" font-weight="700" fill="${B}">ข้อมูลพลังงานโคราช ฉบับพิมพ์แดด</text>`);
add(T,`<path d="M92 320 L988 320" stroke="${B}" stroke-width="4"/>`);
two(92,640,'โคราช',380,B,O,9,6,880);
two(90,800,'เมืองหลวงพลังงาน',150,B,Y,7,5,900);
two(94,1004,'แสงอาทิตย์?',270,O,B,-8,6,900);
// stamped label tickets
const tick=(x,y,txt,c,rot)=>{const g=add(T,`<g transform="rotate(${rot} ${x} ${y})"><g ${MUL}><g filter="url(#stamp)"><rect class="pill" x="${x-120}" y="${y-40}" width="240" height="80" fill="none" stroke="${c}" stroke-width="6"/><text class="key" x="${x}" y="${y+18}" font-size="52" font-weight="900" fill="${c}" text-anchor="middle">${txt}</text></g></g></g>`);return g;};
tick(222,1108,'โซลาร์ฟาร์ม',B,-4);tick(540,1112,'หลังคาบ้าน',O,3);tick(852,1110,'คืนทุนกี่ปี?',B,-3);
fixPills(cv,22);
// stamped MW badge on the panel slab
add(T,`<g transform="translate(880 1236) rotate(12)">${ink(B,ST.mw(B),'stamp',1)}</g>`);
add(T,`<rect width="1080" height="1920" filter="url(#grain)" opacity=".32" ${MUL}/>`);
// ---------- strip ----------
const SC=[B,O,B,O,B,O,B,O,B,O];
drawStrip(st,{box:[140,130],
  bg:()=>`<rect width="1080" height="576" fill="${P}"/>`+ink(Y,`<rect x="0" y="0" width="1080" height="12"/>`)+`<rect width="1080" height="576" filter="url(#grain)" opacity=".55"/>`,
  head:()=>ink(O,`<circle cx="70" cy="58" r="32"/>`)+`<text x="70" y="78" font-size="50" class="lat" fill="${P}" text-anchor="middle">4</text>`+
    `<g ${MUL}><text x="124" y="84" font-size="64" class="lat" fill="${O}" opacity=".9">RISO PRINT</text><text x="119" y="80" font-size="64" class="lat" fill="${B}">RISO PRINT</text></g>`+
    `<text x="1040" y="72" font-size="30" font-weight="700" fill="${B}" text-anchor="end">หมึก 3 สี เม็ดสกรีน พิมพ์เหลื่อม ตัวอักษรผอมสูง ตรายาง</text>`,
  cell:(cx,top,cw,k)=>`<rect x="${cx-cw/2+8}" y="${top}" width="${cw-16}" height="224" fill="none" stroke="${B}" stroke-width="2" stroke-dasharray="10 7" opacity=".7"/>`,
  label:(x,y,t)=>`<text x="${x}" y="${y}" font-size="30" font-weight="800" fill="${B}" text-anchor="middle">${t}</text>`,
  items:[['ตราดวงอาทิตย์',()=>ink(O,ST.sun(O),'stamp')],['ตราแผง',()=>ink(B,ST.panel(B),'stamp')],['ตรามิเตอร์',()=>ink(O,ST.meter(O),'stamp')],['ตราบ้าน',()=>ink(B,ST.house(B),'stamp')],['ตราบิลค่าไฟ',()=>ink(O,ST.bill(O),'stamp')],
    ['ตราเสาส่ง',()=>ink(B,ST.tower(B),'stamp')],['ตราสายฟ้า',()=>ink(Y,ST.bolt(Y),'stamp')+ink(O,`<g transform="translate(6 4)">${ST.bolt(O)}</g>`,'stamp')],['ป้าย MW',()=>ink(O,ST.mw(O),'stamp')],['ป้าย km²',()=>ink(B,ST.km(B),'stamp')],['เม็ดสกรีน',()=>ink(Y,`<circle r="66"/>`)+ink(B,htDisc(0,0,66,10,B,[.7,.7],1.2))]]});
})();
