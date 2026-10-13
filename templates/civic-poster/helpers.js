// shared helpers + sticker library (inlined into index.html by build.py)
const COL={navy:'#13233F',navy2:'#0B172B',paper:'#F4F1EA',white:'#FFFFFF',teal:'#1FA59A',teal2:'#15807A',amber:'#F2A33A',amber2:'#C97D1C',ink:'#141414',grey:'#9AA3B2'};
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const NS='http://www.w3.org/2000/svg';
function add(parent,html){parent.insertAdjacentHTML('beforeend',html);return parent.lastElementChild;}
// shrink a <text> until its bbox width <= maxW
function fit(el,maxW){let fs=parseFloat(el.getAttribute('font-size'));for(let i=0;i<60&&el.getBBox().width>maxW;i++){fs*=0.97;el.setAttribute('font-size',fs.toFixed(1));}return el;}

// person pictogram, bottom-centre at 0,0, height ~110 at s=1
// kind: plain | office | farmer | vendor | labour
function person(x,y,s,kind,col,acc){acc=acc||COL.white;let g=`<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${s.toFixed(3)})">`;
  g+=`<ellipse cx="0" cy="0" rx="22" ry="5" fill="#000" opacity=".18"/>`;
  g+=`<path d="M-21 -64 Q-21 -72 -13 -72 L13 -72 Q21 -72 21 -64 L21 -33 Q21 -30 18 -30 L13 -30 L12 -2 Q12 0 10 0 L3 0 Q1 0 1 -2 L1 -30 L-1 -30 L-1 -2 Q-1 0 -3 0 L-10 0 Q-12 0 -12 -2 L-13 -30 L-18 -30 Q-21 -30 -21 -33 Z" fill="${col}"/>`;
  g+=`<circle cx="0" cy="-86" r="12.5" fill="${col}"/>`;
  if(kind==='office'){g+=`<path d="M-7 -72 L0 -62 L7 -72 Z" fill="${acc}"/><path d="M0 -64 L-3.5 -58 L0 -42 L3.5 -58 Z" fill="${COL.navy}"/>`;}
  if(kind==='farmer'){g+=`<path d="M-30 -90 L0 -110 L30 -90 Q0 -86 -30 -90 Z" fill="${acc}"/>`;}
  if(kind==='vendor'){g+=`<path d="M-38 -70 L38 -70" stroke="${acc}" stroke-width="4" stroke-linecap="round"/>`+
     `<path d="M-38 -70 L-46 -46 M-38 -70 L-30 -46 M38 -70 L30 -46 M38 -70 L46 -46" stroke="${acc}" stroke-width="2"/>`+
     `<path d="M-50 -46 L-26 -46 L-30 -32 L-46 -32 Z M26 -46 L50 -46 L46 -32 L30 -32 Z" fill="${acc}"/>`;}
  if(kind==='labour'){g+=`<path d="M-15 -90 Q-15 -104 0 -104 Q15 -104 15 -90 Z M-19 -91 L19 -91 L19 -87 L-19 -87 Z" fill="${acc}"/>`;}
  return g+'</g>';}

// ballot paper with tick, centred at x,y, rotation r, width w
function ballot(x,y,w,r,tick,op){const h=w*1.32;op=op==null?1:op;
  return `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${r.toFixed(1)})" opacity="${op}">`+
  `<rect x="${-w/2}" y="${-h/2}" width="${w}" height="${h}" rx="${w*.05}" fill="#fff" stroke="#d8d3c8" stroke-width="${w*.015}"/>`+
  `<rect x="${-w*.36}" y="${-h*.36}" width="${w*.22}" height="${w*.22}" rx="${w*.03}" fill="none" stroke="#c9c3b6" stroke-width="${w*.03}"/>`+
  `<path d="M${-w*.33} ${-h*.36+w*.11} l${w*.07} ${w*.08} l${w*.15} ${-w*.2}" fill="none" stroke="${tick||COL.teal}" stroke-width="${w*.06}" stroke-linecap="round" stroke-linejoin="round"/>`+
  `<rect x="${-w*.06}" y="${-h*.33}" width="${w*.4}" height="${w*.05}" rx="${w*.02}" fill="#d9d4ca"/>`+
  `<rect x="${-w*.36}" y="${-h*.05}" width="${w*.22}" height="${w*.22}" rx="${w*.03}" fill="none" stroke="#c9c3b6" stroke-width="${w*.03}"/>`+
  `<rect x="${-w*.06}" y="${-h*.02}" width="${w*.4}" height="${w*.05}" rx="${w*.02}" fill="#d9d4ca"/>`+
  `<rect x="${-w*.36}" y="${h*.26}" width="${w*.7}" height="${w*.05}" rx="${w*.02}" fill="#e3ded4"/></g>`;}

// 3D-ish ballot box: front face centre-bottom at x,y, width w, height h, depth d
function ballotBox(x,y,w,h,d,face,side,top){const L=x-w/2,R=x+w/2,T=y-h,dx=d*.55,dy=d*.45;
  return `<g>`+
  `<path d="M${R} ${y} L${R+dx} ${y-dy} L${R+dx} ${T-dy} L${R} ${T} Z" fill="${side}"/>`+
  `<path d="M${L} ${T} L${R} ${T} L${R+dx} ${T-dy} L${L+dx} ${T-dy} Z" fill="${top}"/>`+
  `<path d="M${L+w*.22+dx*.5} ${T-dy*.5-w*.02} L${R-w*.22+dx*.5} ${T-dy*.5-w*.02} L${R-w*.22+dx*.5} ${T-dy*.5+w*.02} L${L+w*.22+dx*.5} ${T-dy*.5+w*.02} Z" fill="#0b1426"/>`+
  `<rect x="${L}" y="${T}" width="${w}" height="${h}" fill="${face}"/>`+
  `</g>`;}
function idCard(x,y,w,r,col){const h=w*.63;return `<g transform="translate(${x},${y}) rotate(${r})"><rect x="${-w/2}" y="${-h/2}" width="${w}" height="${h}" rx="${w*.07}" fill="#fff"/>`+
  `<rect x="${-w/2}" y="${-h/2}" width="${w}" height="${h*.22}" rx="${w*.07}" fill="${col}"/><rect x="${-w/2}" y="${-h/2+h*.12}" width="${w}" height="${h*.1}" fill="${col}"/>`+
  `<rect x="${-w*.42}" y="${-h*.12}" width="${w*.26}" height="${h*.5}" rx="${w*.03}" fill="#d9e3ea"/><circle cx="${-w*.29}" cy="${h*.03}" r="${w*.06}" fill="#9fb3c4"/><path d="M${-w*.38} ${h*.36} Q${-w*.29} ${h*.16} ${-w*.2} ${h*.36} Z" fill="#9fb3c4"/>`+
  `<rect x="${-w*.08}" y="${-h*.08}" width="${w*.46}" height="${h*.07}" rx="${h*.03}" fill="#c8cfd8"/><rect x="${-w*.08}" y="${h*.08}" width="${w*.36}" height="${h*.07}" rx="${h*.03}" fill="#c8cfd8"/><rect x="${-w*.08}" y="${h*.24}" width="${w*.42}" height="${h*.07}" rx="${h*.03}" fill="#c8cfd8"/></g>`;}
window.render=()=>{};
