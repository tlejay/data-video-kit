// ===== line-cartoon example (Korat solar story): full video. helpers.js, TLD (timeline), MAP are inlined by build.py =====
// Timing: every beat is START/LEND-relative via at(k,u), so a real timeline.json re-times the whole clip.
const NAR=TLD.NAR, DURATION=TLD.DUR; window.DURATION=DURATION;
const C01=x=>Math.max(0,Math.min(1,x)), Lp=(a,b,u)=>a+(b-a)*u, PR=(t,a,b)=>C01((t-a)/(b-a));
const eIO=u=>u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2, eOut=u=>1-Math.pow(1-u,3), eIn=u=>u*u*u, eSine=u=>-(Math.cos(Math.PI*u)-1)/2;
const eBack=(u,s=1.7)=>1+(s+1)*Math.pow(u-1,3)+s*Math.pow(u-1,2);
const eBounce=u=>{const n=7.5625,d=2.75;if(u<1/d)return n*u*u;if(u<2/d)return n*(u-=1.5/d)*u+.75;if(u<2.5/d)return n*(u-=2.25/d)*u+.9375;return n*(u-=2.625/d)*u+.984375;};
function hex(c){return[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];}
function mix(a,b,u){const A=hex(a),B=hex(b);return'#'+A.map((v,i)=>Math.round(Lp(v,B[i],u)).toString(16).padStart(2,'0')).join('');}
const $=id=>document.getElementById(id);
const S=k=>TLD.START['t'+k];
const LE=k=>{if(TLD.LEND&&TLD.LEND['t'+k])return TLD.LEND['t'+k];const w=TLD.T['t'+k];let b=S(k)+1;NAR.forEach(n=>{if(n.a>=w[0]-.05&&n.a<w[1])b=Math.max(b,n.b);});return b;};
const at=(k,u)=>S(k)+u*(LE(k)-S(k));
const TE=k=>TLD.T['t'+k][1];

// ---------- world geometry ----------
// P = poster coords (frame 1). D = detail world, nested in P at scale .25 so the camera dives from the poster's field into it.
const MK=.25, MX=165, MY=550;               // D(540,960) -> P(300,790) = the poster's first farm
const CELL={c2:[0,0],c3:[0,-2700],c4:[1500,-2700],c5:[1500,0],c6:[3000,0],c7:[3000,-2700]};
const BX0=-210,BX1=1290,BY0=-390,BY1=2310;  // every cell background covers this box (cells tile with no gaps)
const D2P=(x,y)=>[MX+MK*x,MY+MK*y];
function KD(t,c,lx,ly,z,r,e){const o=CELL[c];const p=D2P(o[0]+lx,o[1]+ly);return {t,x:p[0],y:p[1],z:z/MK,r:r||0,e:e||eIO};}
const KP=(t,x,y,z,r,e)=>({t,x,y,z,r:r||0,e:e||eIO});

const world=$('world'), hud=$('hud');
world.insertAdjacentHTML('beforebegin',KDEFS+`<defs><filter id="mblur" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur id="mbs" stdDeviation="0 0"/></filter>
<filter id="glowf" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="22"/></filter>
<pattern id="grid40" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0 L0 0 0 40" fill="none" stroke="#BFD9F2" stroke-width="2"/></pattern>
<pattern id="grid200" width="200" height="200" patternUnits="userSpaceOnUse"><path d="M200 0 L0 0 0 200" fill="none" stroke="#9CC3EA" stroke-width="3"/></pattern>
<pattern id="bp40" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0 L0 0 0 40" fill="none" stroke="#5B7FD6" stroke-width="2"/></pattern>
<pattern id="bp200" width="200" height="200" patternUnits="userSpaceOnUse"><path d="M200 0 L0 0 0 200" fill="none" stroke="#9DB6F2" stroke-width="3"/></pattern>
<pattern id="candy" width="80" height="80" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)"><rect width="80" height="80" fill="#E3F8EC"/><rect width="34" height="80" fill="#CFF1DD"/></pattern>
<pattern id="wall" width="44" height="44" patternUnits="userSpaceOnUse"><rect width="44" height="44" fill="#FFF3D6"/><circle cx="22" cy="22" r="5" fill="#FFD9A0"/></pattern>
<clipPath id="iris"><circle id="irisC" cx="540" cy="1000" r="0"/></clipPath><clipPath id="cellclip"><rect x="-210" y="-390" width="1500" height="2700"/></clipPath><clipPath id="pigclip"><ellipse cx="480" cy="790" rx="150" ry="114"/></clipPath>
<linearGradient id="sky2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8ED4FF"/><stop offset="1" stop-color="#E6F7FF"/></linearGradient>
<radialGradient id="warm" cx="50%" cy="22%" r="80%"><stop offset="0" stop-color="#FFF1B0"/><stop offset=".5" stop-color="#FFD36B"/><stop offset="1" stop-color="#FFB347"/></radialGradient></defs>`);

// ---------- entrance animations ----------
const ANIMS=[];  // {id,t,k,cx,cy,d,out,ko}
const SFXL=[];
function anim(id,t,k,cx,cy,o){o=o||{};ANIMS.push({id,t,k,cx,cy,d:o.d||.45,out:o.out,ko:o.ko||'shrink',sfx:o.sfx});if(o.sfx!==false)SFXL.push([+(t).toFixed(2),o.sfx||(k==='drop'||k==='slideL'||k==='slideR'?'whoosh':'pop')]);}
function applyAnims(t){for(const a of ANIMS){const el=$(a.id);if(!el)continue;const u=PR(t,a.t,a.t+a.d);let tr='',op=1;
  if(t<a.t){el.setAttribute('opacity',0);continue;}
  if(a.k==='pop'){const s=eBack(u,2.2);tr=`translate(${a.cx} ${a.cy}) scale(${Math.max(.001,s).toFixed(3)}) translate(${-a.cx} ${-a.cy})`;op=C01(u*4);}
  else if(a.k==='drop'){tr=`translate(0 ${((1-eBounce(u))*-260).toFixed(1)})`;op=C01(u*5);}
  else if(a.k==='slideL'){tr=`translate(${((1-eBack(u,1.4))*-700).toFixed(1)} 0)`;}
  else if(a.k==='slideR'){tr=`translate(${((1-eBack(u,1.4))*700).toFixed(1)} 0)`;}
  else if(a.k==='rise'){tr=`translate(0 ${((1-eOut(u))*140).toFixed(1)})`;op=C01(u*2.5);}
  else if(a.k==='spin'){const s=eBack(u,1.6);tr=`translate(${a.cx} ${a.cy}) rotate(${((1-eOut(u))*-160).toFixed(1)}) scale(${Math.max(.001,s).toFixed(3)}) translate(${-a.cx} ${-a.cy})`;op=C01(u*3);}
  else if(a.k==='unmask'){tr=`translate(${a.cx} ${a.cy}) scale(${eOut(u).toFixed(3)} 1) translate(${-a.cx} ${-a.cy})`;}
  else if(a.k==='fade'){op=eOut(u);}
  if(a.out&&t>=a.out){const v=PR(t,a.out,a.out+.35);if(a.ko==='shrink'){tr+=` translate(${a.cx} ${a.cy}) scale(${(1-eIn(v)).toFixed(3)}) translate(${-a.cx} ${-a.cy})`;}else{tr+=` translate(0 ${(-eIn(v)*300).toFixed(1)})`;}op*=1-v;}
  el.setAttribute('transform',tr);el.setAttribute('opacity',op.toFixed(3));}}
const W=(id,inner)=>`<g id="${id}">${inner}</g>`;
const TXT=(x,y,s,fs,o)=>{o=o||{};return `<text class="key" x="${x}" y="${y}" font-size="${fs}" font-weight="${o.w||700}" fill="${o.fill||K}" text-anchor="${o.a||'middle'}">${s}</text>`;};
// outlined hero text as a string (white fill, black outline, coloured hard shadow)
const HERO=(x,y,s,fs,fill,sh,a)=>`<text x="${x+6}" y="${y+10}" font-size="${fs}" font-weight="700" fill="${sh}" stroke="${sh}" stroke-width="${fs*.14}" stroke-linejoin="round" text-anchor="${a||'middle'}">${s}</text><text class="key" x="${x}" y="${y}" font-size="${fs}" font-weight="700" fill="${fill}" stroke="${K}" stroke-width="${fs*.09}" stroke-linejoin="round" paint-order="stroke" text-anchor="${a||'middle'}">${s}</text>`;
function sunSpin(x,y,R,ang,cool,look){let s='';for(let k=0;k<10;k++){const a=(k*36+ang)*Math.PI/180;const p=(rr,aa)=>[x+rr*Math.cos(aa),y+rr*Math.sin(aa)];s+=poly([p(R*1.18,a-.2),p(R*1.62,a),p(R*1.18,a+.2)],`fill="${L.y2}" ${O}`);}
  s+=`<circle cx="${x}" cy="${y}" r="${R}" fill="${L.y}" ${O}/>`;
  if(cool)s+=`<path d="M${x-R*.62} ${y-R*.2} h${R*1.24}" ${O}/><rect x="${x-R*.6}" y="${y-R*.24}" width="${R*.5}" height="${R*.3}" rx="${R*.1}" fill="${K}"/><rect x="${x+R*.1}" y="${y-R*.24}" width="${R*.5}" height="${R*.3}" rx="${R*.1}" fill="${K}"/>`;
  else{const lx=(look||[0,0])[0]*R*.08,ly=(look||[0,0])[1]*R*.08;s+=`<ellipse cx="${x-R*.3+lx}" cy="${y-R*.12+ly}" rx="${R*.08}" ry="${R*.11}" fill="${K}"/><ellipse cx="${x+R*.3+lx}" cy="${y-R*.12+ly}" rx="${R*.08}" ry="${R*.11}" fill="${K}"/>`;}
  s+=`<ellipse cx="${x-R*.52}" cy="${y+R*.18}" rx="${R*.14}" ry="${R*.08}" fill="${L.pink}"/><ellipse cx="${x+R*.52}" cy="${y+R*.18}" rx="${R*.14}" ry="${R*.08}" fill="${L.pink}"/>`;
  return s+`<path d="M${x-R*.3} ${y+R*.14} Q${x} ${y+R*.6} ${x+R*.3} ${y+R*.14} Z" fill="${L.red}" ${O}/>`;}
// point along a polyline at fraction u
function along(pts,u){let tot=0;const seg=[];for(let i=1;i<pts.length;i++){const l=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);seg.push(l);tot+=l;}
  let d=C01(u)*tot;for(let i=0;i<seg.length;i++){if(d<=seg[i]){const v=d/seg[i];return [Lp(pts[i][0],pts[i+1][0],v),Lp(pts[i][1],pts[i+1][1],v)];}d-=seg[i];}return pts[pts.length-1];}
const ROAD=(d,w)=>`<path d="${d}" stroke="${K}" stroke-width="${w+14}" fill="none" stroke-linecap="round"/><path d="${d}" stroke="#F6DDA8" stroke-width="${w}" fill="none" stroke-linecap="round"/><path d="${d}" stroke="#fff" stroke-width="8" fill="none" stroke-dasharray="26 26" stroke-linecap="round"/>`;
const BG=(fill)=>`<rect x="${BX0}" y="${BY0}" width="${BX1-BX0}" height="${BY1-BY0}" fill="${fill}"/>`;

// ===================== POSTER (frame 1, P coords) =====================
const r0=rng(101);
let ps=bgDots()+`<path d="M-40 600 Q240 540 560 590 Q860 640 1120 560 L1120 1960 L-40 1960 Z" fill="${L.paleY}"/>`;
ps+=`<path d="M-40 1380 Q300 1330 600 1370 Q880 1410 1120 1350 L1120 1960 L-40 1960 Z" fill="${L.green}" ${O}/>`+grass(r0,1430,1900,24)+flowers(r0,1460,1880,10);
ps+=cloud(980,650,.8)+cloud(130,1040,.7);
const RDP='M-30 810 C260 850 520 800 610 870 S500 1060 330 1090 S380 1240 620 1330 S900 1400 1120 1380';
ps+=ROAD(RDP,72)+fieldFarm(300,792,380,true)+factory(700,1066,.6,true)+houseC(290,1352,.56);
ps+=sparkle(530,690,.6)+sparkle(990,860,.5,L.pink)+bolt(470,960,.6)+heart(140,1180,.7)+coin(860,1310,30)+coin(918,1290,22)+piggy(930,1220,.55);
ps+=drop(626,742,.6)+drop(604,770,.45)+plug(120,1336,.5)+battery(170,1240,.5)+sparkle(990,1000,.45)+star(980,760,22,L.pink)+bolt(110,640,.55,L.orange);
const num=(x,y,n,c)=>`<g filter="url(#hard)"><circle cx="${x}" cy="${y}" r="30" fill="${c}" ${O}/></g><text x="${x}" y="${y+13}" font-size="38" font-weight="700" fill="${K}" text-anchor="middle">${n}</text>`;
ps+=num(120,700,1,L.y)+num(980,880,2,L.sky)+num(140,1110,3,L.pink);
world.innerHTML=`<g id="poster">${ps}<g id="posterDyn"></g><g id="posterT"></g></g><g id="dworld" transform="translate(${MX} ${MY}) scale(${MK})"></g><g transform="translate(${MX} ${MY}) scale(${MK})"><circle id="irisR" cx="540" cy="1000" r="0" fill="none" stroke="${K}" stroke-width="30"/></g>`;
{const T=$('posterT');
 titleText(T,106,436,'โซลาร์ไทย',150,'#fff',L.y2,680);labelBlock(T,124,542,'เริ่มที่โคราช!',80,L.pink,-3,true);
 add(T,pin(232,680,.55)+chip(340,650,'โนนสูง','#fff',38,-3,true));add(T,burst(790,666,86,'2553',L.y,52,true));add(T,chip(780,782,'แห่งแรกของไทย',L.green,40,2,true));
 add(T,pitch(122,906,104,-6)+ball(170,880,14));add(T,chip(300,904,'16 สนามฟุตบอล','#fff',38,-2,true));add(T,trophy(118,1002,.5)+chip(290,996,'ใหญ่สุดในอีสาน',L.y,40,2,true));
 add(T,bubble(690,1130,390,86,'คิวต่อไป บ้านคุณ?','#fff',40,true,[-120,80]));add(T,chip(680,1236,'~6 ปี คืนทุน',L.sky,46,-2,true));fixPills(T);}
function drawPoster(t){$('posterDyn').innerHTML=sunSpin(888,370,82,t*14,true)+
  FARMER(565,846,.42,{step:t*7,blink:blinkAt(t,1)})+
  TECH(508,1078,.4,{walk:1,armR:'M38 -186 Q76 -230 70 -276',item:thumb(70,-300,.9),wave:Math.sin(t*5)*10,blink:blinkAt(t,2)})+
  OWNER(500,1378,.48,{armR:'M38 -186 Q86 -210 92 -262',armL:'M-38 -186 Q-80 -170 -84 -128',item:bill(-98,-150,1,8),wave:Math.sin(t*6)*16,blink:blinkAt(t,3)});}

// ===================== DETAIL WORLD =====================
const DW=$('dworld');
const cellG=(c,inner)=>`<g id="${c}" transform="translate(${CELL[c][0]} ${CELL[c][1]})" style="display:none">${inner}</g>`;

// ---------- c2: the first farm in a field (open sky + paddy bands) ----------
const r2=rng(202);
let c2=BG('url(#sky2)');
for(let i=0;i<6;i++)c2+=cloud(-100+i*260+r2()*60,180+r2()*520,.7+r2()*.5);
c2+=`<path d="M${BX0} 990 L${BX0} 930 Q100 860 300 920 Q480 960 640 900 Q860 840 1100 920 Q1200 950 ${BX1} 930 L${BX1} 990 Z" fill="#9FE3B4" ${O}/>`;
{let y=990,h=46,k=0;while(y<BY1){const col=['#7ED99A','#B5E86F','#6BD98F','#A6E58A'][k%4];c2+=`<rect x="${BX0}" y="${y}" width="${BX1-BX0}" height="${h+2}" fill="${col}"/><path d="M${BX0} ${y} H${BX1}" stroke="${K}" stroke-width="4"/>`;
  for(let x=BX0+20;x<BX1;x+=34+h*.3)c2+=`<path d="M${f1(x)} ${f1(y+h*.65)} q4 ${f1(-h*.3)} 8 0" stroke="${L.green2}" stroke-width="${f1(2+h*.05)}" fill="none" stroke-linecap="round"/>`;y+=h;h*=1.22;k++;}}
c2+=ROAD('M760 2400 C700 1900 480 1760 520 1560 S620 1420 560 1380',80);
const FARMROWS=[[1120,88,8,112,120],[1225,108,7,136,96],[1345,132,6,170,70]];
FARMROWS.forEach(([y,w,n,sp,x0],ri)=>{for(let i=0;i<n;i++)c2+=panelC(x0+i*sp,y,w,(ri===2&&i===2)||(ri===1&&i===4));});
c2+=`<rect x="690" y="1060" width="84" height="70" rx="10" fill="${L.grey}" ${O}/>`+bolt(732,1095,.5);
c2+=tower(905,1090,2.0);
c2+=`<path d="M732 1060 Q770 900 790 792" stroke="${K}" stroke-width="5" fill="none"/><path d="M1020 792 Q1150 760 1300 740" stroke="${K}" stroke-width="5" fill="none"/>`;
c2+=`<g id="c2hills"></g>`;
// labels
c2+=W('c2b',burst(320,420,104,'2553',L.y,70,true))+W('c2m',medal(560,410,.9,'1'));
c2+=W('c2c1',chip(470,566,'แห่งแรกของไทย',L.green,56,-2,true));
c2+=W('c2c2',pin(290,700,.6)+chip(490,672,'โนนสูง โคราช','#fff',42,-2,true));
c2+=W('c2c3',plug(250,808,.62)+chip(470,800,'ขายไฟเข้าระบบ',L.y,46,2,true));
c2+=W('c2c4',chip(472,884,'เป็นที่แรกของประเทศ','#fff',36,0,true));
c2+=W('c2c5',chip(540,1012,'จุดเริ่มต้น โซลาร์ฟาร์มทั่วไทย',L.pink,40,-2,true));
c2+=`<g id="c2d"></g>`;
anim('c2b',at(1,.98),'pop',320,420);anim('c2m',at(2,.06),'spin',560,410);anim('c2c1',at(2,.1),'slideL',470,566);anim('c2c2',at(2,.2),'drop',470,672);
anim('c2c3',at(2,.36),'slideR',470,800);anim('c2c4',at(2,.46),'rise',472,884);anim('c2c5',at(2,.62),'unmask',540,1012);
const HILLX=[60,190,320,460,600,740,870,1010,1130];
function drawC2(t){let s=sunSpin(960,270,70,t*12,false,[-1,1]);
  for(let i=0;i<HILLX.length;i++){const t0=at(2,.6)+i*.16;const u=PR(t,t0,t0+.35);if(u<=0)continue;const x=HILLX[i],y=948-((i*37)%3)*12;const sc=eBack(u,2.2);
    s+=`<g transform="translate(${x} ${y}) scale(${sc.toFixed(3)})">${panelC(-20,0,34,false,false)+panelC(20,0,34,false,false)}${u<1?sparkle(0,-40,.5):''}</g>`;}
  // power pulses along the line, starting when "ขายไฟเข้าระบบ" lands
  const LINE=[[732,1060],[760,930],[790,792],[1020,792],[1300,740]];
  if(t>at(2,.34))for(let k=0;k<5;k++){const u=((t-at(2,.34))*.45+k/5)%1;const p=along(LINE,u);s+=`<circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="16" fill="${L.y}" ${O} stroke-width="5"/>`;}
  // panels glint
  const g=Math.floor(t*2.2)%14;const gx=[120,232,344,456,568,680,792,904][g%8];s+=g<8?sparkle(gx,1060,.45,'#fff'):'';
  const fx=Lp(300,470,PR(t,S(2),LE(2)));s+=FARMER(fx,1500,.66,{step:t*7.5,blink:blinkAt(t,4),open:1});
  s+=drop(fx+70,1240,.7)+drop(fx+92,1275,.5);
  $('c2d').innerHTML=s;}

// ---------- c3: sun-intensity map on graph paper ----------
const MS=.46,MOX=78,MOY=372;  // map placement in the cell
let c3=BG('#FFFBEF')+`<rect x="${BX0}" y="${BY0}" width="${BX1-BX0}" height="${BY1-BY0}" fill="url(#grid40)"/><rect x="${BX0}" y="${BY0}" width="${BX1-BX0}" height="${BY1-BY0}" fill="url(#grid200)"/>`;
c3+=`<path d="M60 ${BY0} V${BY1}" stroke="#FF8FA3" stroke-width="5"/>`;
for(let i=0;i<9;i++)c3+=`<circle cx="22" cy="${200+i*240}" r="16" fill="#fff" stroke="#C9D7E6" stroke-width="5"/>`;
c3+=`<g opacity=".55">${star(980,1180,24,'#FFE58A')}${sparkle(150,1330,.5,'#FFE58A')}${bolt(990,300,.5,'#FFE58A')}${heart(1000,1420,.6)}</g>`;
c3+=`<path d="M200 1460 q60 -40 120 0 t120 0 t120 0" stroke="#9CC3EA" stroke-width="6" fill="none" stroke-linecap="round"/>`;
// torn bottom edge over the sky below
{let d=`M${BX0} ${BY1-30}`;for(let x=BX0;x<=BX1;x+=36)d+=` L${x} ${BY1-30+((x/36)%2?26:0)}`;d+=` L${BX1} ${BY1-60} L${BX1} ${BY1-200} L${BX0} ${BY1-200} Z`;c3+=`<path d="${d}" fill="#FFFBEF" stroke="${K}" stroke-width="5"/>`;}
c3+=`<g id="c3beam" opacity="0"></g>`;
{let other='',isan='';for(const p of MAP.prov){if(p.isan)isan+=`<path d="${p.d}"/>`;else other+=`<path d="${p.d}"/>`;}
 c3+=`<g transform="translate(${MOX} ${MOY}) scale(${MS})">`+
   `<g id="c3glow" fill="${L.orange}" opacity="0" filter="url(#glowf)">${isan}</g>`+
   `<g fill="#E4F2FA" stroke="${K}" stroke-width="3.2" stroke-linejoin="round">${other}</g>`+
   `<g id="c3isan" fill="#E4F2FA" stroke="${K}" stroke-width="3.2" stroke-linejoin="round">${isan}</g></g>`;}
const KX=MOX+MAP.pts.korat[0]*MS, KY=MOY+MAP.pts.korat[1]*MS;
c3+=W('c3pin',pin(KX,KY,.62)+chip(KX-6,KY-128,'โคราช','#fff',36,-3,true));
c3+=W('c3a',trophy(520,486,.5)+chip(690,494,'แดดแรง หัวแถว','#fff',40,2,true));
c3+=W('c3b',chip(752,562,'โซนแดดแรงที่สุด',L.orange,44,-2,true));
c3+=W('c3c',arrowC(580,645,.55,180,L.y)+chip(770,645,'อีสานทั้งภาค',L.y,38,2,true));
// sun meters: real values on a 0..6 scale, baseline y 1200
const MB=1146,MH=250/6;
const meter=(x,v0,v1,col,lab,val)=>{const h0=v0*MH,h1=v1*MH;let s=`<rect x="${x-38}" y="${MB-272}" width="76" height="282" rx="38" fill="#fff" ${O}/>`+
  `<g id="${lab==='โคราช'?'c3m1f':'c3m2f'}"><rect x="${x-26}" y="${MB-h1}" width="52" height="${h1}" rx="22" fill="${col}"/>${v1>v0?`<rect x="${x-26}" y="${MB-h1}" width="52" height="${h1-h0}" fill="${L.red}" opacity=".45"/>`:''}</g>`+
  `<circle cx="${x}" cy="${MB+22}" r="34" fill="${col}" ${O}/>`+TXT(x,MB+80,lab,28,{w:600})+`<rect x="${x-66}" y="${MB-336}" width="132" height="54" rx="28" fill="#fff" ${O} stroke-width="4"/>`+TXT(x,MB-296,val,36);return s;};
c3+=W('c3m',`<g filter="url(#hard)"><rect x="560" y="712" width="340" height="530" rx="28" fill="#fff" ${O}/></g>`+TXT(730,758,'แดดต่อวัน (เฉลี่ย)',28,{w:600})+TXT(730,788,'kWh/ตร.ม./วัน',24,{w:500,fill:'#555'})+
  meter(650,5.3,5.6,L.orange,'โคราช','5.3-5.6')+meter(810,5.06,5.06,L.sky2,'เฉลี่ยไทย','5.06'));
c3+=`<g id="c3d"></g>`;
anim('c3a',at(3,.06),'pop',690,494);anim('c3b',at(3,.4),'slideR',752,562);anim('c3c',at(3,.47),'slideR',770,645);
anim('c3pin',at(3,.74),'drop',KX,KY);anim('c3m',at(3,.8),'rise',730,980);anim('c3a',at(3,.06),'pop',690,494);
function drawC3(t){const g=eIO(PR(t,at(3,.37),at(3,.37)+.8));$('c3isan').setAttribute('fill',mix('#E4F2FA',L.y,g));
  $('c3glow').setAttribute('opacity',(g*(.75+.2*Math.sin(t*4))).toFixed(3));
  const b=$('c3beam');b.setAttribute('opacity',(g*.5).toFixed(3));
  if(!b.innerHTML)b.innerHTML=`<path d="M905 300 L${MOX+560*MS} ${MOY+380*MS} L${MOX+1000*MS} ${MOY+900*MS} Z" fill="${L.y}"/><path d="M905 300 L${MOX+760*MS} ${MOY+520*MS} L${MOX+620*MS} ${MOY+840*MS} Z" fill="${L.y2}" opacity=".6"/>`;
  const fu=eOut(PR(t,at(3,.84),at(3,.84)+.8));['c3m1f','c3m2f'].forEach(id=>{const e=$(id);e.setAttribute('transform',`translate(0 ${(MB*(1-fu)).toFixed(1)}) scale(1 ${Math.max(.001,fu).toFixed(3)})`);});
  $('c3d').innerHTML=sunSpin(905,300,80,t*-14,true);}

// ---------- c4: factory roof on a blueprint ----------
let c4=BG('#2346A8')+`<rect x="${BX0}" y="${BY0}" width="${BX1-BX0}" height="${BY1-BY0}" fill="url(#bp40)"/><rect x="${BX0}" y="${BY0}" width="${BX1-BX0}" height="${BY1-BY0}" fill="url(#bp200)"/>`;
c4+=`<g stroke="#CFE0FF" stroke-width="3" fill="none" opacity=".8"><rect x="30" y="1620" width="420" height="160"/><path d="M30 1680 H450 M240 1620 V1780"/><path d="M70 150 H1010 M70 135 V165 M1010 135 V165"/><path d="M1040 300 V1500 M1025 300 H1055 M1025 1500 H1055"/></g>`;
c4+=`<g opacity=".5">${sparkle(980,240,.5,'#CFE0FF')}${star(90,1530,20,'#CFE0FF')}</g>`;
c4+=ROAD('M560 1320 C560 1600 420 1800 520 2000 S560 2300 540 2500',76);
c4+=W('c4f',fieldFarm(175,1110,200,false)+chip(175,1180,'ทุ่ง','#fff',34,0,true));
c4+=`<path id="c4arc" d="M200 1040 Q320 700 720 900" stroke="#fff" stroke-width="6" stroke-dasharray="18 14" fill="none" opacity="0"/>`;
c4+=factory(560,1310,1.1,true);
c4+=W('c4now',HERO(540,610,'วันนี้',150,'#fff',L.y2)+sparkle(330,480,.7)+sparkle(760,500,.55,L.pink));
// roof plan card with 16 pitches
let card=`<g filter="url(#hard)"><rect x="186" y="358" width="708" height="512" rx="30" fill="#fff" ${O}/></g>`+TXT(540,420,'หลังคาโรงงานเดียว ปูแผงเต็ม',36,{w:600});
c4+=W('c4card',card);
const PITCH=[];for(let j=0;j<4;j++)for(let i=0;i<4;i++){const x=270+i*180,y=500+j*100;PITCH.push([x,y]);c4+=W('c4p'+(j*4+i),pitch(x,y,150,0));}
c4+=W('c4n16',chip(540,890,'= 16 สนามฟุตบอล',L.y,56,-2,true));
c4+=W('c4big',trophy(250,1180,.7)+chip(560,1180,'ใหญ่ที่สุดในอีสาน',L.pink,52,2,true));
c4+=`<g id="c4d"></g>`;
anim('c4now',at(4,.0),'pop',540,560,{out:at(4,.34),sfx:'burst'});anim('c4f',at(4,.06),'rise',175,1110,{out:at(4,.34)});
anim('c4card',at(4,.36),'unmask',540,614);
PITCH.forEach((p,i)=>anim('c4p'+i,at(4,.40)+i*.13,'pop',p[0],p[1],{d:.3,sfx:i%4===0?'pop':false}));
anim('c4n16',at(4,.64),'drop',540,890);anim('c4big',at(4,.8),'slideL',560,1180,{sfx:'highlight'});
function drawC4(t){let s='';const a0=at(4,.12),a1=a0+1.5;const u=eIO(PR(t,a0,a1));$('c4arc').setAttribute('opacity',(t>a0?Math.min(1,(t-a0)*3)*(1-PR(t,a1+.4,a1+.8)):0).toFixed(2));
  if(t>a0-.1&&t<a1+.3){const p=[Lp(200,720,u),Lp(1040,900,u)-Math.sin(u*Math.PI)*330];s+=`<g transform="translate(${f1(p[0])} ${f1(p[1])}) rotate(${f1(u*360)})">${panelC(0,20,90,true,false)}</g>`;}
  s+=TECH(872,950,.4,{armR:'M38 -186 Q76 -230 70 -276',wave:-10+Math.sin(t*7)*24,blink:blinkAt(t,5),open:1});
  $('c4d').innerHTML=s;}

// ---------- c5: house cut-away, meter runs backwards, surplus sold back ----------
let c5=BG('url(#candy)');
c5+=ROAD('M540 -500 C540 -200 600 0 420 220 S180 400 170 560',70);
c5+=`<rect x="140" y="560" width="60" height="18" rx="6" fill="${L.red}" ${O}/><rect x="164" y="578" width="12" height="60" fill="${L.brown}" ${O}/>`;
c5+=W('c5c1',chip(460,330,'ก้าวต่อไป',L.y,44,-3,true));
c5+=W('c5c2',HERO(470,470,'หลังคาบ้าน',100,'#fff',L.pink));
// house
c5+=`<rect x="150" y="730" width="620" height="520" fill="url(#wall)" ${O}/><path d="M460 730 V1250" ${O}/><rect x="150" y="1250" width="620" height="22" fill="${L.brown}" ${O}/>`;
const RQ=[[270,560],[650,560],[800,730],[120,730]];
c5+=poly(RQ,`fill="${L.red}" ${O}`)+quadCells([qpt(RQ,.1,.14),qpt(RQ,.9,.14),qpt(RQ,.9,.84),qpt(RQ,.1,.84)],6,2,()=>`fill="${L.blue}" stroke="${K}" stroke-width="5" stroke-linejoin="round"`,.04);
c5+=`<rect x="250" y="800" width="150" height="200" rx="20" fill="#fff" ${O}/><rect x="275" y="820" width="100" height="44" rx="8" fill="${L.navy}" ${O} stroke-width="4"/>`;
c5+=`<path d="M550 1250 v-150 h120 v150" fill="${L.orange}" ${O}/>`;
c5+=pole(930,1270,1.0);
c5+=`<path d="M770 800 Q820 900 874 872 Q960 850 1300 840" stroke="${K}" stroke-width="5" fill="none"/>`;
c5+=W('c5c3',chip(305,1105,'ผลิตเอง ใช้เอง',L.green,38,-2,true));
c5+=W('c5c4',chip(618,1040,'ค่าไฟลดลง','#fff',36,2,true));
c5+=W('c5c5',coin(640,640,26)+chip(800,640,'เหลือ ขายคืน',L.y,40,-2,true));
c5+=`<g id="c5d"></g>`;
anim('c5c1',at(5,.02),'drop',460,330,{out:at(5,.4)});anim('c5c2',at(5,.2),'slideL',470,440,{out:at(5,.4)});anim('c5c3',at(5,.4),'pop',305,1105);anim('c5c4',at(5,.5),'rise',618,1040);anim('c5c5',at(5,.7),'slideR',800,640);
function drawC5(t){let s=sunSpin(890,360,80,t*15,false,[-1,1]);
  const sb=PR(t,at(5,.08),at(5,.08)+.6);if(sb>0)s+=`<g opacity="${(sb*.6).toFixed(2)}"><path d="M890 360 L420 600 L650 600 Z" fill="${L.y}"/></g>`;
  // Ferraris disc: spins forward slowly, then backwards fast once the panels feed the house
  const tb=at(5,.37);const ang=t<tb?t*90:tb*90-(t-tb)*420;
  s+=`<ellipse cx="325" cy="930" rx="58" ry="16" fill="${L.grey}" ${O} stroke-width="5"/>`;
  for(let k=0;k<3;k++){const a=(ang+k*120)*Math.PI/180;const x=325+Math.cos(a)*48;if(Math.sin(a)>0)s+=`<rect x="${f1(x-5)}" y="917" width="10" height="26" fill="${L.red}"/>`;}
  if(t>tb)s+=`<g transform="translate(325 980)">${arrowC(0,0,.45,180,L.green)}</g>`;
  // bill shrinking
  const bs=1.25-.55*eIO(PR(t,at(5,.5),at(5,.5)+1.6));s+=bill(618,880,bs,-6);
  // surplus: bolts out to the pole, coins back to the house
  const CAB=[[770,800],[820,880],[874,872],[960,856],[1300,840]];
  if(t>at(5,.7))for(let k=0;k<4;k++){const u=((t-at(5,.7))*.55+k/4)%1;const p=along(CAB,u);s+=`<circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="13" fill="${L.y}" ${O} stroke-width="5"/>`;
    const q=along(CAB,1-((t-at(5,.7))*.4+k/4+.12)%1);s+=coin(q[0],q[1]-34,17);}
  s+=OWNER(560,1250,.5,{open:1,blink:blinkAt(t,6),armR:'M38 -186 Q86 -210 92 -262',wave:Math.sin(t*6)*14});
  $('c5d').innerHTML=s;}

// ---------- c6: piggy bank fills while the calendar flips to year 6 ----------
let c6=BG('#FFE1D2');
for(let j=-2;j<12;j++)for(let i=-1;i<7;i++){const x=i*180+20,y=j*190+40;c6+=`<rect x="${x}" y="${y}" width="160" height="170" rx="22" fill="#FFF3EA" stroke="#F7C9B3" stroke-width="4"/>`+((i+j)%3===0?`<circle cx="${x+128}" cy="${y+34}" r="12" fill="#FFD9A0"/>`:'');}
for(let i=0;i<7;i++)c6+=`<rect x="${i*180+60}" y="-60" width="22" height="70" rx="11" fill="#C9C9C9" ${O} stroke-width="5"/>`;
c6+=W('c6c1',chip(300,320,'บ้านในโคราช','#fff',40,-2,true));
c6+=W('c6c2',chip(390,404,'ระบบขนาดกลาง',L.y,46,2,true));
c6+=piggy(480,790,2.5);
c6+=`<g clip-path="url(#pigclip)"><g id="c6fill"></g></g><ellipse cx="480" cy="790" rx="155" ry="120" fill="none" ${O}/><circle cx="570" cy="755" r="12" fill="${K}"/><rect x="435" y="665" width="80" height="18" rx="9" fill="${K}"/>`;
c6+=`<g filter="url(#hard)"><rect x="700" y="470" width="230" height="230" rx="26" fill="#fff" ${O}/></g><path d="M700 530 L700 500 Q700 470 726 470 L904 470 Q930 470 930 500 L930 530 Z" fill="${L.red}" ${O}/><rect x="745" y="448" width="16" height="40" rx="8" fill="${K}"/><rect x="870" y="448" width="16" height="40" rx="8" fill="${K}"/>`;
c6+=`<g id="c6cal"></g>`;
c6+=W('c6hero',`<g filter="url(#hard)">${poly([...Array(32)].map((_,k)=>{const a=k*Math.PI/16,rr=k%2?128:150;return [540+rr*Math.cos(a)*1.45,1070+rr*Math.sin(a)*.82];}),`fill="${L.sky}" ${O}`)}</g>`+TXT(540,1076,'~6 ปี',96)+TXT(540,1140,'คืนทุน',52));
c6+=W('c6cav',TXT(520,1238,'ตัวอย่าง: ระบบ 5 kW ราว 180,000 บาท ใช้เอง 70%',27,{w:500})+TXT(520,1274,'ค่าไฟ 4.23 บ./หน่วย ขายคืน 2.20 บ./หน่วย',27,{w:500}));
c6+=`<g id="c6d"></g>`;
anim('c6c1',at(6,.02),'slideL',300,320,{out:at(6,.38)});anim('c6c2',at(6,.12),'pop',390,404,{out:at(6,.38)});anim('c6hero',at(6,.8),'pop',540,1070,{sfx:'burst',d:.55});anim('c6cav',at(6,.86),'rise',520,1256);
const YR0=at(6,.42),YR1=at(6,.76);   // year counter 1..6 lands on 6 before the hero
function drawC6(t){let s='';
  const lvl=eIO(PR(t,at(6,.2),YR1));const top=905-lvl*230;
  let f=`<rect x="320" y="${f1(top)}" width="320" height="400" fill="${L.y}"/>`;for(let k=0;k<30;k++){const x=345+(k%6)*52+(Math.floor(k/6)%2)*26,y=890-Math.floor(k/6)*44;if(y>top-10&&((x-480)/130)**2+((y-790)/98)**2<=1&&Math.hypot(x-570,y-755)>40)f+=`<circle cx="${x}" cy="${y}" r="20" fill="${L.y2}" stroke="${K}" stroke-width="4"/>`;}
  $('c6fill').innerHTML=lvl>0?f:'';
  for(let n=0;n<14;n++){const t0=at(6,.2)+n*.38;if(t<t0||t>t0+.55||t0>YR1)continue;const u=PR(t,t0,t0+.5);s+=`<g opacity="${(1-PR(t,t0+.42,t0+.5)).toFixed(2)}">${coin(475,Lp(420,660,eIn(u)),26)}</g>`;}
  const n=t<YR0?1:Math.min(6,1+Math.floor((t-YR0)/((YR1-YR0)/5.001)));const fl=t>=YR0&&t<YR1?((t-YR0)%((YR1-YR0)/5))/((YR1-YR0)/5):1;
  const sq=fl<.18?Math.cos(fl/.18*Math.PI/2*0)*.0+Math.abs(Math.cos(fl/.18*Math.PI)):1;
  $('c6cal').innerHTML=`<g transform="translate(815 625) scale(1 ${Math.max(.05,sq).toFixed(3)}) translate(-815 -625)">${TXT(815,600,'ปีที่',40,{w:600})}${TXT(815,680,String(n),92)}</g>`;
  s+=OWNER(170,1200,.55,{open:1,blink:blinkAt(t,7),armR:'M38 -186 Q76 -230 70 -276',item:thumb(70,-300,.9),wave:Math.sin(t*5)*8});
  s+=sparkle(660,640,.5+.15*Math.sin(t*6))+sparkle(300,600,.4,L.pink);
  $('c6d').innerHTML=s;}

// ---------- c7: same sun, your roof, the question ----------
let c7=BG('url(#warm)')+`<g clip-path="url(#cellclip)"><g id="c7rays"></g></g>`;
c7+=houseC(600,1640,.95);
c7+=W('c7bub',`<g filter="url(#hard)"><path d="M120 820 Q90 700 190 660 Q230 560 350 590 Q450 540 520 620 Q610 640 590 740 Q620 840 520 860 Q440 920 330 880 Q200 920 150 870 Q100 860 120 820 Z" fill="#fff" ${O}/></g>`+
  fieldFarm(355,800,260,true)+chip(330,640,'ฟาร์มแห่งแรก 2553',L.y,34,-2,true));
c7+=W('c7q',HERO(540,770,'แล้วคุณจะ',122,'#fff',L.pink)+HERO(540,920,'เริ่มเมื่อไหร่?',122,'#fff',L.y2));
c7+=`<g id="c7d"></g>`;
anim('c7bub',at(7,.04),'pop',350,740,{out:at(7,.38)});anim('c7q',at(7,.74),'drop',540,850,{sfx:'highlight',out:LE(7)+.75,ko:'fade'});
function drawC7(t){let r='';const rot=t*6;for(let k=0;k<18;k++){const a=(k*20+rot)*Math.PI/180,b=(k*20+10+rot)*Math.PI/180;r+=`<path d="M540 430 L${f1(540+3000*Math.cos(a))} ${f1(430+3000*Math.sin(a))} L${f1(540+3000*Math.cos(b))} ${f1(430+3000*Math.sin(b))} Z" fill="#FFF0A8" opacity=".55"/>`;}
  $('c7rays').innerHTML=r;
  const look=eIO(PR(t,at(7,.4),at(7,.4)+.6));
  let s=sunSpin(540,430,140,t*10,false,[look*-.6,look]);
  const bu=PR(t,at(7,.1),at(7,.1)+.5)*(1-PR(t,at(7,.6),at(7,.6)+.3));if(bu>0)s+=`<path d="M470 520 L330 640" stroke="#fff" stroke-width="8" stroke-dasharray="16 14" opacity="${bu.toFixed(2)}"/>`;
  const ru=PR(t,at(7,.4),at(7,.4)+.5);if(ru>0)s+=`<path d="M560 580 L620 1230" stroke="#fff" stroke-width="8" stroke-dasharray="16 14" opacity="${(ru*(1-PR(t,at(7,.66),at(7,.66)+.3))).toFixed(2)}"/>`;
  s+=OWNER(620,1308,.66,{open:1,blink:blinkAt(t,8),look:look*14,armR:'M38 -186 Q86 -210 92 -262',wave:look*-8+Math.sin(t*5)*10});
  s+=sparkle(880,1100,.55+.1*Math.sin(t*5))+sparkle(220,1150,.45,L.pink)+heart(900,880,.6)+star(170,420,24);
  $('c7d').innerHTML=s;}

DW.innerHTML=cellG('c2',c2)+cellG('c3',c3)+cellG('c4',c4)+cellG('c5',c5)+cellG('c6',c6)+cellG('c7',c7);
// fit + pill sizing for chips inside cells
fixPills(DW);fixPills($('poster'));

// ---------- end card (HUD, screen space) ----------
hud.innerHTML=`<g id="endc" opacity="0"><rect x="0" y="0" width="1080" height="1920" fill="#FFF7E0" opacity=".88"/>
<g filter="url(#hard)"><rect x="108" y="300" width="864" height="960" rx="40" fill="#fff" ${O}/></g>
${HERO(540,430,'โซลาร์ไทย เริ่มที่โคราช',76,'#fff',L.y2)}
${chip(540,530,'แดดเดียวกัน ถึงหลังคาบ้านคุณ',L.pink,40,-2,true)}
${TXT(160,650,'ที่มา',38,{a:'start'})}
<g id="srcl"></g></g>`;
{const SRC=['ฟาร์มแห่งแรก: Korat 1 (SPCG) เริ่มจ่ายไฟ 21 เม.ย. 2553','(IFC, Bangkok Post)','ความเข้มแสงอาทิตย์ (GHI): กรมพัฒนาพลังงานทดแทนฯ (พพ.)','หลังคาโรงงานในโคราช 20.96 MW 116,000 ตร.ม. (NBT 13 ก.ค. 2569)',
  'ค่าไฟ ก.ย.-ธ.ค. 69 (กกพ.) ขายคืน 2.20 บ./หน่วย (กพช.)','ราคาติดตั้ง: greenenergythailand.com 2569','คืนทุน ~6 ปี เป็นการประมาณจากตัวอย่างข้างต้น','แผนที่: geoBoundaries (CC BY 3.0 IGO)'];
 const g=$('srcl');SRC.forEach((s,i)=>{fit(add(g,`<text class="key" x="160" y="${712+i*64}" font-size="27" font-weight="500" fill="${K}">${s}</text>`),760);});}
fixPills(hud);

// ===================== CAMERA =====================
const KEYS=[
 KP(0,540,960,1.0), KP(1.3,540,958,1.006,0,eSine), KP(at(1,.42),541,956,1.008,0,eSine),
 KD(at(1,.98)+.1,'c2',540,960,1.0,0,u=>eIO(u)),
 KD(at(2,.18),'c2',540,760,1.08), KD(at(2,.4),'c2',580,960,1.1), KD(at(2,.52),'c2',590,950,1.13,0,eSine),
 KD(at(2,.66),'c2',540,900,.9), KD(at(2,.96),'c2',540,880,.94,0,eSine),
 KD(S(3)+.35,'c3',540,900,.95),
 KD(at(3,.33),'c3',545,880,1.0,0,eSine), KD(at(3,.45),'c3',540,720,1.07), KD(at(3,.7),'c3',530,730,1.09,0,eSine),
 KD(at(3,.82),'c3',560,940,1.05), KD(at(3,.99),'c3',565,940,1.08,0,eSine),
 KD(S(4)+.3,'c4',540,900,1.0,0,u=>eIO(u)),
 KD(at(4,.24),'c4',560,900,1.06), KD(at(4,.36),'c4',570,910,1.08,0,eSine),
 KD(at(4,.44),'c4',540,660,1.06), KD(at(4,.62),'c4',540,700,1.1,0,eSine),
 KD(at(4,.72),'c4',540,820,.95), KD(at(4,.84),'c4',540,980,1.08), KD(at(4,.99),'c4',540,1010,1.12,0,eSine),
 KD(S(5)+.35,'c5',540,860,1.0,0,u=>eIO(u)),
 KD(at(5,.22),'c5',590,720,1.08), KD(at(5,.36),'c5',580,740,1.1,0,eSine),
 KD(at(5,.46),'c5',450,950,1.14), KD(at(5,.64),'c5',460,950,1.17,0,eSine),
 KD(at(5,.76),'c5',700,820,1.12), KD(at(5,.99),'c5',560,880,1.0),
 KD(S(6)+.35,'c6',540,900,1.0,-6), KD(S(6)+.75,'c6',540,900,1.0,0,eOut),
 KD(at(6,.3),'c6',500,780,1.1), KD(at(6,.42),'c6',560,720,1.12,0,eSine),
 KD(at(6,.6),'c6',640,700,1.14), KD(at(6,.76),'c6',620,740,1.12,0,eSine),
 KD(at(6,.84),'c6',540,980,1.0), KD(at(6,.99),'c6',540,970,1.04,0,eSine),
 KD(S(7)-.15,'c6',540,-200,.62,0,eIO), KD(S(7)+.45,'c7',540,900,1.0,0,eOut),
 KD(at(7,.22),'c7',420,800,1.1), KD(at(7,.36),'c7',440,800,1.13,0,eSine),
 KD(at(7,.5),'c7',600,1060,1.12), KD(at(7,.64),'c7',600,1040,1.15,0,eSine),
 KD(at(7,.76),'c7',540,880,1.0), KD(at(7,.99),'c7',540,880,1.04,0,eSine),
 KD(DURATION,'c7',540,890,1.1,0,eSine)];
KEYS.sort((a,b)=>a.t-b.t);
function camAt(t){if(t<=KEYS[0].t)return KEYS[0];for(let i=0;i<KEYS.length-1;i++){const a=KEYS[i],b=KEYS[i+1];if(t<=b.t){const u=b.e(PR(t,a.t,b.t));
  return {x:Lp(a.x,b.x,u),y:Lp(a.y,b.y,u),z:Math.exp(Lp(Math.log(a.z),Math.log(b.z),u)),r:Lp(a.r,b.r,u),seg:i};}}return KEYS[KEYS.length-1];}
// cell visibility windows (cells tile, so neighbours show during a move)
const VIS={c2:[at(1,.6),S(3)+.6],c3:[at(2,.9),S(4)+.5],c4:[at(3,.95),S(5)+.6],c5:[at(4,.95),S(6)+.6],c6:[at(5,.95),S(7)+.6],c7:[at(6,.95),DURATION+1]};
const DIVE0=KEYS[2].t, DIVE1=KEYS[3].t;
// whip (t3 -> t4 turn): horizontal motion blur
const WHIP0=at(3,.99), WHIP1=S(4)+.3;

// ---------------- SFX ----------------
SFXL.push([+(DIVE0+.2).toFixed(2),'whoosh'],[+(at(2,.96)+.1).toFixed(2),'whoosh'],[+(WHIP0+.05).toFixed(2),'whoosh'],[+(at(3,.37)).toFixed(2),'highlight'],
 [+(at(4,.99)+.05).toFixed(2),'whoosh'],[+(at(5,.37)).toFixed(2),'highlight'],[+(at(5,.99)+.05).toFixed(2),'whoosh'],[+(at(6,.99)).toFixed(2),'whoosh'],[+(LE(7)+.1).toFixed(2),'pop'],[+(DURATION-.4).toFixed(2),'end']);
for(let n=2;n<=6;n++)SFXL.push([+(YR0+(n-1)*(YR1-YR0)/5).toFixed(2),'pop']);
SFXL.sort((a,b)=>a[0]-b[0]);
window.SFX_CUES=SFXL.map(([t,kind])=>({t,kind}));

// ---------------- frame ----------------
const pillEl=$('pill');let lastCap=null;
const near=(c,t)=>t>=VIS[c][0]&&t<=VIS[c][1];
function draw(t){
  const cam=camAt(t);const dz=1+.004*Math.sin(t*.9);const dx=Math.sin(t*.7)*2.5/cam.z, dy=Math.cos(t*.53)*2/cam.z;
  world.setAttribute('transform',`translate(540 960) rotate(${cam.r.toFixed(3)}) scale(${(cam.z*dz).toFixed(5)}) translate(${(-cam.x-dx).toFixed(3)} ${(-cam.y-dy).toFixed(3)})`);
  const wb=t>WHIP0&&t<WHIP1?Math.sin(PR(t,WHIP0,WHIP1)*Math.PI)*26:0;
  if(wb>.5){world.setAttribute('filter','url(#mblur)');$('mbs').setAttribute('stdDeviation',`${wb.toFixed(1)} 0`);}else world.removeAttribute('filter');
  // poster / dive
  const posterOn=t<DIVE1+.05;$('poster').style.display=posterOn?'':'none';if(posterOn)drawPoster(t);
  for(const c of ['c2','c3','c4','c5','c6','c7']){const on=near(c,t);const el=$(c);el.style.display=on?'':'none';}
  {const iu=PR(t,DIVE0+.25,DIVE1-.1);const ir=eIn(iu)*2300;const c2=$('c2');if(iu<1){c2.setAttribute('clip-path','url(#iris)');$('irisC').setAttribute('r',ir.toFixed(1));}else c2.removeAttribute('clip-path');
   const rg=$('irisR');rg.setAttribute('r',ir.toFixed(1));rg.setAttribute('stroke-width',(14/(camAt(t).z*MK)).toFixed(2));rg.style.display=iu>0&&iu<1?'':'none';}
  if(near('c2',t))drawC2(t);if(near('c3',t))drawC3(t);if(near('c4',t))drawC4(t);if(near('c5',t))drawC5(t);if(near('c6',t))drawC6(t);if(near('c7',t))drawC7(t);
  applyAnims(t);
  // end card
  const ev=PR(t,LE(7)+.1,LE(7)+.7);const ec=$('endc');ec.setAttribute('opacity',eOut(ev).toFixed(3));ec.setAttribute('transform',`translate(0 ${((1-eOut(ev))*60).toFixed(1)})`);
  // captions (outside the camera)
  const cap=NAR.find(n=>t>=n.a&&t<n.b);
  if(!cap){pillEl.style.opacity=0;}else{
    if(cap!==lastCap){pillEl.textContent=cap.t;pillEl.style.fontSize='46px';if(pillEl.scrollWidth>710)pillEl.style.fontSize=Math.floor(46*700/pillEl.scrollWidth)+'px';lastCap=cap;}
    const u=C01((t-cap.a)/.16);pillEl.style.opacity=C01(u*2);pillEl.style.transform=`translateY(${((1-eOut(u))*14).toFixed(1)}px)`;}
}
const tl=gsap.timeline({paused:true});const CLK={t:0};
tl.to(CLK,{t:DURATION,duration:DURATION,ease:'none',onUpdate:()=>draw(CLK.t)});
window.render=t=>{tl.seek(t,false);draw(t);};window.tl=tl;
draw(0);
