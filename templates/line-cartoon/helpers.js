// ===== line-cartoon sticker kit (solar video, template 3) =====
// Thick black outlines, flat fills, smiling characters. Every function returns an SVG string.
// Shared by frame-1 posters and the scenes. Text made by helpers carries class="key" when key=true.
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function add(parent,html){parent.insertAdjacentHTML('beforeend',html);return parent.lastElementChild;}
function fit(el,maxW){let fs=parseFloat(el.getAttribute('font-size'));for(let i=0;i<80&&el.getBBox().width>maxW;i++){fs*=0.97;el.setAttribute('font-size',fs.toFixed(1));}return el;}
const lerp=(a,b,t)=>a+(b-a)*t, f1=v=>(+v).toFixed(1);
function qpt(q,u,v){const t=[lerp(q[0][0],q[1][0],u),lerp(q[0][1],q[1][1],u)],b=[lerp(q[3][0],q[2][0],u),lerp(q[3][1],q[2][1],u)];return [lerp(t[0],b[0],v),lerp(t[1],b[1],v)];}
function poly(pts,attrs){return `<path d="M${pts.map(p=>f1(p[0])+' '+f1(p[1])).join(' L')} Z" ${attrs||''}/>`;}
function quadCells(q,nx,ny,attrsFn,gap){gap=gap==null?.06:gap;let s='';for(let i=0;i<nx;i++)for(let j=0;j<ny;j++){const u0=(i+gap)/nx,u1=(i+1-gap)/nx,v0=(j+gap)/ny,v1=(j+1-gap)/ny;s+=poly([qpt(q,u0,v0),qpt(q,u1,v0),qpt(q,u1,v1),qpt(q,u0,v1)],attrsFn(i,j));}return s;}
// resize rect.pill to hug the <text> right after it
function fixPills(root,padX){root.querySelectorAll('rect.pill').forEach(rc=>{const t=rc.nextElementSibling;if(!t||t.tagName!=='text')return;const b=t.getBBox();const p=padX||parseFloat(rc.getAttribute('height'))*.42;rc.setAttribute('x',f1(b.x-p));rc.setAttribute('width',f1(b.width+2*p));});}

const K='#1A1A1A',L={y:'#FFD23F',y2:'#FFB627',sky:'#8FD3FF',sky2:'#5DB8F5',green:'#6BD98F',green2:'#3FB86A',pink:'#FF9EB5',orange:'#FF8A3D',red:'#FF5C5C',blue:'#4F7BFF',navy:'#2A3F8F',skin:'#FFD9B3',white:'#FFFFFF',cream:'#FFF7E0',paleY:'#FFF2B8',grey:'#C9C9C9',brown:'#8B5A3C',purple:'#A98BFF'};
const SW=7,O=`stroke="${K}" stroke-width="${SW}" stroke-linejoin="round" stroke-linecap="round"`;
const KDEFS=`<defs><filter id="hard" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="6" dy="8" stdDeviation="0" flood-color="${K}" flood-opacity="1"/></filter>
<pattern id="dots" width="36" height="36" patternUnits="userSpaceOnUse"><circle cx="18" cy="18" r="3" fill="#D8EFE4"/></pattern>
<pattern id="stripes" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="20" height="40" fill="#5CCB7F"/></pattern></defs>`;
const limb=(d,col,w)=>`<path d="${d}" stroke="${K}" stroke-width="${w+SW*2}" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" stroke="${col}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
const G=(x,y,s,inner,rot)=>`<g transform="translate(${f1(x)} ${f1(y)})${rot?` rotate(${rot})`:''} scale(${s})">${inner}</g>`;
const kc=k=>k?'class="key"':'';

// ---- small stickers ----
function sunFace(x,y,R,cool){let s='';for(let k=0;k<10;k++){const a=k*36*Math.PI/180;const p=(rr,aa)=>[x+rr*Math.cos(aa),y+rr*Math.sin(aa)];s+=poly([p(R*1.18,a-.2),p(R*1.62,a),p(R*1.18,a+.2)],`fill="${L.y2}" ${O}`);}
  s+=`<circle cx="${x}" cy="${y}" r="${R}" fill="${L.y}" ${O}/>`;
  if(cool)s+=`<path d="M${x-R*.62} ${y-R*.2} h${R*1.24}" ${O}/><rect x="${x-R*.6}" y="${y-R*.24}" width="${R*.5}" height="${R*.3}" rx="${R*.1}" fill="${K}"/><rect x="${x+R*.1}" y="${y-R*.24}" width="${R*.5}" height="${R*.3}" rx="${R*.1}" fill="${K}"/>`;
  else s+=`<path d="M${x-R*.42} ${y-R*.1} q${R*.12} ${-R*.16} ${R*.24} 0 M${x+R*.18} ${y-R*.1} q${R*.12} ${-R*.16} ${R*.24} 0" ${O} fill="none"/>`;
  s+=`<ellipse cx="${x-R*.52}" cy="${y+R*.18}" rx="${R*.14}" ry="${R*.08}" fill="${L.pink}"/><ellipse cx="${x+R*.52}" cy="${y+R*.18}" rx="${R*.14}" ry="${R*.08}" fill="${L.pink}"/>`;
  return s+`<path d="M${x-R*.3} ${y+R*.14} Q${x} ${y+R*.6} ${x+R*.3} ${y+R*.14} Z" fill="${L.red}" ${O}/>`;}
function drop(x,y,s){return `<path d="M${x} ${y-22*s} Q${x+14*s} ${y-2*s} ${x+10*s} ${y+8*s} Q${x} ${y+18*s} ${x-10*s} ${y+8*s} Q${x-14*s} ${y-2*s} ${x} ${y-22*s} Z" fill="${L.sky}" ${O} stroke-width="${SW*.7}"/><ellipse cx="${x-4*s}" cy="${y+2*s}" rx="${3*s}" ry="${5*s}" fill="#fff"/>`;}
function sparkle(x,y,s,col){return `<path d="M${x} ${y-30*s} Q${x+5*s} ${y-5*s} ${x+30*s} ${y} Q${x+5*s} ${y+5*s} ${x} ${y+30*s} Q${x-5*s} ${y+5*s} ${x-30*s} ${y} Q${x-5*s} ${y-5*s} ${x} ${y-30*s} Z" fill="${col||L.y}" ${O} stroke-width="${SW*.75}"/>`;}
function coin(x,y,R){return `<circle cx="${x+R*.12}" cy="${y+R*.12}" r="${R}" fill="${L.y2}" ${O}/><circle cx="${x}" cy="${y}" r="${R}" fill="${L.y}" ${O}/><circle cx="${x}" cy="${y}" r="${R*.68}" fill="none" stroke="${L.y2}" stroke-width="${R*.1}"/><text x="${x}" y="${y+R*.36}" font-size="${R}" font-weight="700" fill="${K}" text-anchor="middle">฿</text>`;}
function plug(x,y,s){return limb(`M${x} ${y+30*s} q${-40*s} ${50*s} ${-90*s} ${30*s}`,L.navy,8*s)+`<rect x="${x-26*s}" y="${y-30*s}" width="${52*s}" height="${60*s}" rx="${14*s}" fill="${L.orange}" ${O}/><rect x="${x-15*s}" y="${y-58*s}" width="${9*s}" height="${30*s}" rx="${3*s}" fill="#D0D0D0" ${O} stroke-width="${SW*.6}"/><rect x="${x+6*s}" y="${y-58*s}" width="${9*s}" height="${30*s}" rx="${3*s}" fill="#D0D0D0" ${O} stroke-width="${SW*.6}"/><circle cx="${x-8*s}" cy="${y}" r="${3.5*s}" fill="${K}"/><circle cx="${x+8*s}" cy="${y}" r="${3.5*s}" fill="${K}"/><path d="M${x-8*s} ${y+10*s} q${8*s} ${8*s} ${16*s} 0" ${O} stroke-width="${SW*.6}" fill="none"/>`;}
function battery(x,y,s){return `<rect x="${x-34*s}" y="${y-60*s}" width="${68*s}" height="${120*s}" rx="${14*s}" fill="#fff" ${O}/><rect x="${x-14*s}" y="${y-74*s}" width="${28*s}" height="${14*s}" rx="${4*s}" fill="${K}"/><rect x="${x-24*s}" y="${y-10*s}" width="${48*s}" height="${60*s}" rx="${8*s}" fill="${L.green}"/><path d="M${x+4*s} ${y-44*s} L${x-14*s} ${y+4*s} L${x} ${y+4*s} L${x-6*s} ${y+38*s} L${x+16*s} ${y-12*s} L${x+2*s} ${y-12*s} Z" fill="${L.y}" ${O} stroke-width="${SW*.6}"/>`;}
function bill(x,y,s,rot){return G(x,y,s,`<path d="M-40 -55 L40 -55 L40 50 L30 58 L20 50 L10 58 L0 50 L-10 58 L-20 50 L-30 58 L-40 50 Z" fill="#fff" ${O}/><rect x="-28" y="-42" width="56" height="10" rx="5" fill="${L.sky}"/><path d="M-28 -18 h40 M-28 -2 h30 M-28 14 h44" stroke="#BDBDBD" stroke-width="6" stroke-linecap="round"/><text x="22" y="40" font-size="28" font-weight="700" fill="${L.red}" text-anchor="middle">฿</text>`,rot||0);}
function thumb(x,y,s){return G(x,y,s,`<rect x="-46" y="-6" width="26" height="62" rx="8" fill="${L.blue}" ${O}/><path d="M-20 -2 Q-6 -10 0 -34 Q4 -56 18 -50 Q28 -44 20 -12 L40 -12 Q54 -10 52 4 Q56 16 48 22 Q54 32 44 40 Q48 52 36 56 L-20 56 Z" fill="${L.skin}" ${O}/><path d="M48 22 H30 M44 40 H28" ${O} stroke-width="${SW*.7}"/>`);}
function clock(x,y,R){return `<circle cx="${x}" cy="${y}" r="${R}" fill="#fff" ${O}/><circle cx="${x}" cy="${y}" r="${R*.08}" fill="${K}"/><path d="M${x} ${y} L${x} ${y-R*.6} M${x} ${y} L${x+R*.42} ${y+R*.14}" ${O}/>`+[0,90,180,270].map(a=>`<circle cx="${f1(x+Math.cos(a*Math.PI/180)*R*.76)}" cy="${f1(y+Math.sin(a*Math.PI/180)*R*.76)}" r="${R*.06}" fill="${K}"/>`).join('')+`<path d="M${x-R*.7} ${y-R*1.05} l${-R*.25} ${-R*.2} M${x+R*.7} ${y-R*1.05} l${R*.25} ${-R*.2}" ${O}/>`;}
function bolt(x,y,s,col){return `<path d="M${x+8*s} ${y-40*s} L${x-22*s} ${y+6*s} L${x-2*s} ${y+6*s} L${x-10*s} ${y+40*s} L${x+24*s} ${y-8*s} L${x+4*s} ${y-8*s} Z" fill="${col||L.y}" ${O} stroke-width="${SW*.8}"/>`;}
function heart(x,y,s){return `<path d="M${x} ${y+16*s} C${x-34*s} ${y-6*s} ${x-20*s} ${y-30*s} ${x} ${y-14*s} C${x+20*s} ${y-30*s} ${x+34*s} ${y-6*s} ${x} ${y+16*s} Z" fill="${L.pink}" ${O} stroke-width="${SW*.7}"/>`;}
function star(x,y,R,col){let p=[];for(let k=0;k<10;k++){const a=-Math.PI/2+k*Math.PI/5,rr=k%2?R*.48:R;p.push([x+rr*Math.cos(a),y+rr*Math.sin(a)]);}return poly(p,`fill="${col||L.y}" ${O} stroke-width="${SW*.8}"`);}
function cloud(x,y,k){return `<path d="M${x-60*k} ${y} Q${x-70*k} ${y-40*k} ${x-30*k} ${y-42*k} Q${x-14*k} ${y-80*k} ${x+24*k} ${y-60*k} Q${x+66*k} ${y-66*k} ${x+62*k} ${y-20*k} Q${x+86*k} ${y} ${x+60*k} ${y} Z" fill="#fff" ${O}/>`;}
function piggy(x,y,s){return G(x,y,s,`<ellipse cx="0" cy="0" rx="62" ry="48" fill="${L.pink}" ${O}/><path d="M-30 -40 L-40 -66 L-12 -48" fill="${L.pink}" ${O}/><rect x="52" y="-14" width="26" height="30" rx="10" fill="${L.pink}" ${O}/><circle cx="62" cy="1" r="3.5" fill="${K}"/><circle cx="70" cy="1" r="3.5" fill="${K}"/><circle cx="36" cy="-14" r="5" fill="${K}"/><rect x="-18" y="-50" width="30" height="8" rx="4" fill="${K}"/>`+
  `<rect x="-40" y="38" width="18" height="24" rx="6" fill="${L.pink}" ${O}/><rect x="20" y="38" width="18" height="24" rx="6" fill="${L.pink}" ${O}/><path d="M-62 -6 q-18 -6 -12 -20" ${O} fill="none"/>`);}
function pin(x,y,s,col){return G(x,y,s,`<path d="M0 0 C-10 -24 -36 -40 -36 -66 A36 36 0 1 1 36 -66 C36 -40 10 -24 0 0 Z" fill="${col||L.red}" ${O}/><circle cx="0" cy="-66" r="13" fill="#fff" ${O} stroke-width="5"/>`);}
function calendar(x,y,s,txt,key){return G(x,y,s,`<rect x="-70" y="-64" width="140" height="132" rx="16" fill="#fff" ${O}/><path d="M-70 -30 L-70 -48 Q-70 -64 -54 -64 L54 -64 Q70 -64 70 -48 L70 -30 Z" fill="${L.red}" ${O}/><rect x="-42" y="-80" width="12" height="30" rx="6" fill="${K}"/><rect x="30" y="-80" width="12" height="30" rx="6" fill="${K}"/>`+
  `<text ${kc(key)} x="0" y="38" font-size="52" font-weight="700" fill="${K}" text-anchor="middle">${txt}</text>`);}
function medal(x,y,s,txt){return G(x,y,s,`<path d="M-30 -10 L-48 70 L-24 58 L-14 84 L4 4 Z" fill="${L.blue}" ${O}/><path d="M30 -10 L48 70 L24 58 L14 84 L-4 4 Z" fill="${L.red}" ${O}/><circle cx="0" cy="-20" r="50" fill="${L.y}" ${O}/><circle cx="0" cy="-20" r="34" fill="none" stroke="${L.y2}" stroke-width="7"/><text x="0" y="-2" font-size="50" font-weight="700" fill="${K}" text-anchor="middle">${txt||'1'}</text>`);}
function trophy(x,y,s){return G(x,y,s,`<path d="M-40 -70 L40 -70 L34 -20 Q28 10 0 12 Q-28 10 -34 -20 Z" fill="${L.y}" ${O}/><path d="M-40 -58 Q-74 -58 -64 -30 Q-56 -14 -34 -18 M40 -58 Q74 -58 64 -30 Q56 -14 34 -18" fill="none" ${O}/><rect x="-8" y="10" width="16" height="22" fill="${L.y2}" ${O}/><rect x="-36" y="30" width="72" height="22" rx="6" fill="${L.brown}" ${O}/>${star(0,-36,16,'#fff')}`);}
function arrowC(x,y,s,rot,col){return G(x,y,s,`<path d="M-50 -14 L10 -14 L10 -36 L54 0 L10 36 L10 14 L-50 14 Z" fill="${col||L.orange}" ${O}/>`,rot||0);}
function burst(x,y,R,txt,fill,fs,key,n){n=n||14;let p=[];for(let k=0;k<n*2;k++){const a=k*Math.PI/n,rr=k%2?R*.84:R;p.push([x+rr*Math.cos(a),y+rr*Math.sin(a)]);}
  return `<g filter="url(#hard)">${poly(p,`fill="${fill||L.y}" ${O}`)}</g><text ${kc(key)} x="${x}" y="${y+fs*.36}" font-size="${fs}" font-weight="700" fill="${K}" text-anchor="middle">${txt}</text>`;}
function chip(x,y,txt,fill,fs,rot,key,col){fs=fs||40;const w=txt.length*fs*.55+fs*1.2;return `<g transform="rotate(${rot||0} ${x} ${y})" filter="url(#hard)"><rect class="pill" x="${x-w/2}" y="${y-fs*.8}" width="${w}" height="${fs*1.6}" rx="${fs*.8}" fill="${fill}" ${O}/><text ${kc(key)} x="${x}" y="${y+fs*.36}" font-size="${fs}" font-weight="600" fill="${col||K}" text-anchor="middle">${txt}</text></g>`;}
function bubble(x,y,w,h,txt,fill,fs,key,tail){tail=tail||[-w*.25,h*.5+34];return `<g filter="url(#hard)"><path d="M${x-w/2+h*.4} ${y-h/2} L${x+w/2-h*.4} ${y-h/2} Q${x+w/2} ${y-h/2} ${x+w/2} ${y-h/2+h*.4} L${x+w/2} ${y+h/2-h*.4} Q${x+w/2} ${y+h/2} ${x+w/2-h*.4} ${y+h/2} L${x+tail[0]+24} ${y+h/2} L${x+tail[0]} ${y+tail[1]} L${x+tail[0]-4} ${y+h/2} L${x-w/2+h*.4} ${y+h/2} Q${x-w/2} ${y+h/2} ${x-w/2} ${y+h/2-h*.4} L${x-w/2} ${y-h/2+h*.4} Q${x-w/2} ${y-h/2} ${x-w/2+h*.4} ${y-h/2} Z" fill="${fill||'#fff'}" ${O}/></g>`+
  `<text ${kc(key)} x="${x}" y="${y+fs*.36}" font-size="${fs}" font-weight="700" fill="${K}" text-anchor="middle">${txt}</text>`;}
// outlined title text (white fill, black outline, coloured hard shadow); returns [shadowEl, mainEl] after adding to parent
function titleText(T,x,y,txt,fs,fill,shadow,maxW,anchor){const an=anchor?`text-anchor="${anchor}"`:'';const a=add(T,`<text x="${x+6}" y="${y+10}" font-size="${fs}" font-weight="700" fill="${shadow}" stroke="${shadow}" stroke-width="${fs*.14}" stroke-linejoin="round" ${an}>${txt}</text>`);
  const b=add(T,`<text class="key" x="${x}" y="${y}" font-size="${fs}" font-weight="700" fill="${fill}" stroke="${K}" stroke-width="${fs*.09}" stroke-linejoin="round" paint-order="stroke" ${an}>${txt}</text>`);
  if(maxW){fit(b,maxW);a.setAttribute('font-size',b.getAttribute('font-size'));a.setAttribute('stroke-width',(parseFloat(b.getAttribute('font-size'))*.14).toFixed(1));b.setAttribute('stroke-width',(parseFloat(b.getAttribute('font-size'))*.09).toFixed(1));}return [a,b];}
// tilted label block with hard shadow (auto width)
function labelBlock(T,x,y,txt,fs,fill,rot,anchorLeft){const g=add(T,`<g transform="rotate(${rot||0} ${x} ${y})"><g filter="url(#hard)"><rect x="0" y="${y-fs*.95}" width="10" height="${fs*1.5}" rx="${fs*.36}" fill="${fill}" ${O}/></g><text class="key" x="${x}" y="${y+fs*.1}" font-size="${fs}" font-weight="700" fill="${K}" ${anchorLeft?'':'text-anchor="middle"'}>${txt}</text></g>`);
  const t=g.querySelector('text'),r=g.querySelector('rect'),b=t.getBBox(),p=fs*.45;r.setAttribute('x',f1(b.x-p));r.setAttribute('width',f1(b.width+2*p));return g;}

// ---- solar objects ----
function panelC(x,y,w,face,legs){const h=w*.62;let s=legs===false?'':`<path d="M${x-w*.3} ${y} l0 ${h*.5} M${x+w*.3} ${y} l0 ${h*.5}" ${O}/>`;s+=`<rect x="${x-w/2}" y="${y-h}" width="${w}" height="${h}" rx="${w*.06}" fill="${L.blue}" ${O}/>`;
  for(let i=1;i<4;i++)s+=`<path d="M${f1(x-w/2+i*w/4)} ${y-h} l0 ${h}" stroke="#A9C1FF" stroke-width="${SW*.5}"/>`;s+=`<path d="M${x-w/2} ${y-h/2} h${w}" stroke="#A9C1FF" stroke-width="${SW*.5}"/><path d="M${x-w*.38} ${y-h*.88} l${w*.14} 0" stroke="#fff" stroke-width="${SW}" stroke-linecap="round"/>`;
  if(face)s+=`<circle cx="${x-w*.14}" cy="${y-h*.45}" r="${w*.045}" fill="${K}"/><circle cx="${x+w*.14}" cy="${y-h*.45}" r="${w*.045}" fill="${K}"/><path d="M${x-w*.1} ${y-h*.28} Q${x} ${y-h*.12} ${x+w*.1} ${y-h*.28}" ${O} fill="none"/>`;return s;}
// field solar farm: green ground blob with rows of panels; centre-bottom at x,y, width w
function fieldFarm(x,y,w,face){let s=`<ellipse cx="${x}" cy="${y}" rx="${w/2}" ry="${w*.13}" fill="${L.green}" ${O}/>`;const rows=[[y-w*.02,5,w*.15],[y+w*.06,4,w*.17]];
  rows.forEach(([yy,n,pw],ri)=>{for(let i=0;i<n;i++){const xx=x-(n-1)*pw*.6+i*pw*1.2;s+=panelC(xx,yy-pw*.12,pw,face&&ri===1&&i===1);}});return s;}
function houseC(x,y,s,o){o=o||{};let g=`<rect x="-150" y="-210" width="300" height="210" rx="10" fill="${o.wall||L.cream}" ${O}/><rect x="40" y="-130" width="66" height="130" rx="8" fill="${L.orange}" ${O}/><circle cx="92" cy="-62" r="5" fill="${K}"/>`+
  `<rect x="-110" y="-160" width="100" height="80" rx="8" fill="${L.sky}" ${O}/><path d="M-60 -160 v80 M-110 -120 h100" ${O}/>`;
  const rq=[[-118,-350],[118,-350],[188,-200],[-188,-200]];g+=poly(rq,`fill="${o.roof||L.red}" ${O}`);
  if(o.panels!==false)g+=quadCells([qpt(rq,.12,.14),qpt(rq,.88,.14),qpt(rq,.88,.82),qpt(rq,.12,.82)],4,2,()=>`fill="${L.blue}" stroke="${K}" stroke-width="5" stroke-linejoin="round"`,.04)+`<path d="M${qpt(rq,.2,.24)} l18 0" stroke="#fff" stroke-width="6" stroke-linecap="round"/>`;
  if(o.chimney!==false)g+=`<rect x="90" y="-420" width="40" height="70" fill="${L.grey}" ${O}/>`;return G(x,y,s,g);}
// factory with a huge panel-covered sawtooth roof; centre-bottom x,y, width ~600 at s=1
function factory(x,y,s,face){let g=`<rect x="-300" y="-190" width="600" height="190" rx="8" fill="#E9EEF5" ${O}/>`;
  for(let i=0;i<4;i++)g+=`<rect x="${-270+i*140}" y="-120" width="100" height="120" fill="${L.grey}" ${O}/>`+[1,2,3].map(k=>`<path d="M${-270+i*140} ${-120+k*30} h100" stroke="${K}" stroke-width="4"/>`).join('');
  g+=`<rect x="200" y="-410" width="46" height="150" fill="${L.grey}" ${O}/><rect x="200" y="-410" width="46" height="22" fill="${L.red}" ${O}/>`;
  for(let i=0;i<4;i++){const x0=-312+i*156;const q=[[x0+20,-330],[x0+156,-330],[x0+156,-190],[x0,-190]];g+=poly(q,`fill="${L.navy}" ${O}`);
    g+=quadCells([qpt(q,.06,.1),qpt(q,.94,.1),qpt(q,.94,.9),qpt(q,.06,.9)],3,3,()=>`fill="${L.blue}" stroke="${K}" stroke-width="4" stroke-linejoin="round"`,.05);
    g+=`<path d="M${x0+156} -330 L${x0+156} -190" ${O}/>`;}
  g+=`<path d="M${-280} -300 l20 0" stroke="#fff" stroke-width="7" stroke-linecap="round"/>`;
  if(face)g+=`<circle cx="-60" cy="-160" r="8" fill="${K}"/><circle cx="60" cy="-160" r="8" fill="${K}"/><path d="M-30 -146 Q0 -124 30 -146" ${O} fill="none"/><ellipse cx="-96" cy="-142" rx="16" ry="8" fill="${L.pink}"/><ellipse cx="96" cy="-142" rx="16" ry="8" fill="${L.pink}"/>`;
  return G(x,y,s,g);}
// football pitch (top view), centre x,y, width w
function pitch(x,y,w,rot){const h=w*.64;let g=`<rect x="${-w/2}" y="${-h/2}" width="${w}" height="${h}" rx="${w*.04}" fill="${L.green}" ${O}/>`;
  for(let i=0;i<6;i+=2)g+=`<rect x="${-w/2+i*w/6+4}" y="${-h/2+4}" width="${w/6}" height="${h-8}" fill="#5CCB7F"/>`;
  g+=`<g stroke="#fff" stroke-width="${w*.018}" fill="none"><rect x="${-w/2+w*.05}" y="${-h/2+h*.08}" width="${w*.9}" height="${h*.84}"/><path d="M0 ${-h/2+h*.08} V${h/2-h*.08}"/><circle r="${h*.16}"/><rect x="${-w/2+w*.05}" y="${-h*.22}" width="${w*.12}" height="${h*.44}"/><rect x="${w/2-w*.17}" y="${-h*.22}" width="${w*.12}" height="${h*.44}"/></g>`;
  g+=`<rect x="${-w/2}" y="${-h/2}" width="${w}" height="${h}" rx="${w*.04}" fill="none" ${O}/>`;return G(x,y,1,g,rot||0);}
function ball(x,y,R){return `<circle cx="${x}" cy="${y}" r="${R}" fill="#fff" ${O}/>`+poly([0,1,2,3,4].map(k=>{const a=-Math.PI/2+k*2*Math.PI/5;return [x+R*.38*Math.cos(a),y+R*.38*Math.sin(a)];}),`fill="${K}"`);}
function tower(x,y,s){return G(x,y,s,`<g ${O} fill="none"><path d="M-40 0 L-8 -200 L8 -200 L40 0"/><path d="M-34 -30 L26 -70 M34 -30 L-26 -70 M-24 -70 L18 -110 M24 -70 L-18 -110 M-15 -110 L12 -150 M15 -110 L-12 -150"/><path d="M-60 -150 L60 -150 M-46 -180 L46 -180"/></g>`);}
// character: bottom-centre at x,y, ~360 tall at s=1.
// o: shirt pants hat(straw|helmet) hair longHair armL armR item itemBehind strap
// animation (all optional): walk (static stride) | step (phase rad, walk cycle) | blink (bool) | open (dot eyes) | wave (deg, rotates right arm) | look (deg, head tilts up) | bob (px)
function person(x,y,s,o){let g=`<ellipse cx="0" cy="4" rx="70" ry="12" fill="${K}" opacity=".12"/>`;
  let lg,f;if(o.step!=null){const a=Math.sin(o.step)*26;lg=[`M-16 -110 L${f1(-20+a)} -10`,`M16 -110 L${f1(20-a)} -10`];f=[[-24+a,-4-Math.max(0,-Math.cos(o.step))*6],[24-a,-4-Math.max(0,Math.cos(o.step))*6]];}
  else if(o.walk){lg=['M-16 -110 L-38 -12','M16 -110 L30 -8'];f=[[-42,-6],[34,-4]];}else{lg=['M-16 -110 L-20 -10','M16 -110 L20 -10'];f=[[-24,-4],[24,-4]];}
  g+=limb(lg[0],o.pants,26)+limb(lg[1],o.pants,26)+`<ellipse cx="${f1(f[0][0])}" cy="${f1(f[0][1])}" rx="22" ry="12" fill="${K}"/><ellipse cx="${f1(f[1][0])}" cy="${f1(f[1][1])}" rx="22" ry="12" fill="${K}"/>`;
  const bob=o.bob||(o.step!=null?-Math.abs(Math.sin(o.step))*7:0);g+=`<g transform="translate(0 ${f1(bob)})">`;
  let armL=o.armL||'M-38 -186 Q-70 -150 -66 -112',armR=o.armR||'M38 -186 Q70 -150 66 -112';
  if(o.step!=null&&!o.armL){const a=Math.sin(o.step)*22;armL=`M-38 -186 Q${f1(-66-a*.3)} -150 ${f1(-62-a)} -112`;}
  if(o.step!=null&&!o.armR){const a=Math.sin(o.step)*22;armR=`M38 -186 Q${f1(66-a*.3)} -150 ${f1(62-a)} -112`;}
  const end=d=>d.trim().split(/[ QLM]+/).filter(Boolean).slice(-2).map(Number),hl=end(armL),hr=end(armR);
  const rotR=o.wave?`transform="rotate(${f1(o.wave)} 38 -186)"`:'';
  g+=limb(armL,o.shirt,24)+`<rect x="-44" y="-214" width="88" height="116" rx="32" fill="${o.shirt}" ${O}/>`;
  if(o.strap)g+=`<path d="M-30 -210 L30 -110" stroke="${o.strap}" stroke-width="12"/>`;
  if(o.itemBehind)g+=o.itemBehind;
  g+=`<circle cx="${hl[0]}" cy="${hl[1]}" r="14" fill="${L.skin}" ${O}/>`;
  g+=`<g ${rotR}>${limb(armR,o.shirt,24)}<circle cx="${hr[0]}" cy="${hr[1]}" r="14" fill="${L.skin}" ${O}/></g>`;
  let h=`<circle cx="0" cy="-268" r="52" fill="${L.skin}" ${O}/>`;
  if(o.hair)h+=`<path d="M-50 -276 Q-46 -330 4 -326 Q50 -322 50 -280 Q30 -300 6 -292 Q-20 -306 -50 -276 Z" fill="${K}"/>`;
  if(o.longHair)h+=`<path d="M-54 -250 Q-62 -330 0 -330 Q62 -330 54 -250 L44 -250 Q40 -296 4 -298 Q-30 -300 -44 -250 Z" fill="${K}"/>`;
  const ey=o.look?-272:-266;
  if(o.blink)h+=`<path d="M-26 ${ey} h16 M10 ${ey} h16" ${O} stroke-width="6" fill="none"/>`;
  else if(o.open)h+=`<ellipse cx="-18" cy="${ey}" rx="6" ry="8" fill="${K}"/><ellipse cx="18" cy="${ey}" rx="6" ry="8" fill="${K}"/><circle cx="-16" cy="${ey-3}" r="2.2" fill="#fff"/><circle cx="20" cy="${ey-3}" r="2.2" fill="#fff"/>`;
  else h+=`<path d="M-26 -268 q8 -10 16 0 M10 -268 q8 -10 16 0" ${O} stroke-width="6" fill="none"/>`;
  h+=`<ellipse cx="-32" cy="-248" rx="10" ry="6" fill="${L.pink}"/><ellipse cx="32" cy="-248" rx="10" ry="6" fill="${L.pink}"/><path d="M-16 -246 Q0 -222 16 -246 Z" fill="${L.red}" ${O} stroke-width="5"/>`;
  if(o.hat==='straw')h+=`<ellipse cx="0" cy="-306" rx="86" ry="20" fill="#F2C46D" ${O}/><path d="M-40 -310 Q-36 -352 0 -354 Q36 -352 40 -310 Z" fill="#F2C46D" ${O}/><path d="M-40 -318 Q0 -308 40 -318" stroke="${L.red}" stroke-width="8"/>`;
  if(o.hat==='helmet')h+=`<path d="M-54 -292 Q-54 -350 0 -352 Q54 -350 54 -292 Z" fill="${L.y}" ${O}/><rect x="-64" y="-298" width="128" height="16" rx="8" fill="${L.y2}" ${O}/><path d="M0 -350 L0 -300" stroke="${L.y2}" stroke-width="10"/>`;
  g+=o.look?`<g transform="rotate(${f1(-o.look)} 0 -220)">${h}</g>`:h;
  if(o.item)g+=`<g ${rotR}>${o.item}</g>`;return G(x,y,s,g+'</g>');}
// blink helper: true for ~0.13 s every ~3.4 s, offset by seed
const blinkAt=(t,seed)=>((t+seed*1.37)%3.4)<0.13;
// utility pole (side view), bottom-centre x,y
function pole(x,y,s){return G(x,y,s,`<rect x="-10" y="-420" width="20" height="420" rx="6" fill="${L.brown}" ${O}/><rect x="-70" y="-390" width="140" height="18" rx="6" fill="${L.brown}" ${O}/><circle cx="-56" cy="-398" r="9" fill="#fff" ${O} stroke-width="5"/><circle cx="56" cy="-398" r="9" fill="#fff" ${O} stroke-width="5"/>`);}
const FARMER=(x,y,s,extra)=>person(x,y,s,Object.assign({shirt:L.green2,pants:L.brown,hat:'straw',armL:'M-38 -186 Q-74 -160 -70 -120',itemBehind:limb('M-90 -40 L-56 -230','#A0703C',12)+`<path d="M-56 -230 l-36 -8 l-6 26 Z" fill="#BDBDBD" ${O}/>`},extra||{}));
const TECH=(x,y,s,extra)=>person(x,y,s,Object.assign({shirt:L.orange,pants:L.navy,hat:'helmet',strap:L.y},extra||{}));
const OWNER=(x,y,s,extra)=>person(x,y,s,Object.assign({shirt:L.sky,pants:'#5B5BD6',hair:1},extra||{}));
const HOE='M-90 -40 L-56 -230';
// background
function bgDots(){return `<rect width="1080" height="1920" fill="#fff"/><rect width="1080" height="1920" fill="url(#dots)"/>`;}
function grass(r,y0,y1,n){let s='';for(let i=0;i<n;i++){const x=40+r()*1000,y=y0+r()*(y1-y0);s+=`<path d="M${f1(x-14)} ${f1(y)} q4 -18 8 -2 q6 -22 10 -2 q6 -16 10 4" stroke="${L.green2}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;}return s;}
function flowers(r,y0,y1,n){let s='';for(let i=0;i<n;i++){const x=60+r()*960,y=y0+r()*(y1-y0);s+=`<circle cx="${f1(x)}" cy="${f1(y)}" r="11" fill="${[L.y,L.pink,'#fff'][i%3]}" ${O} stroke-width="5"/><circle cx="${f1(x)}" cy="${f1(y)}" r="3" fill="${K}"/>`;}return s;}
