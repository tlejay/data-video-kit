// ===== civic-poster example (social-security board vote): full video. Data (TLD, MAP) and helpers are inlined above by build.py =====
const NAR=TLD.NAR, DURATION=TLD.DUR; window.DURATION=DURATION;
const C01=x=>Math.max(0,Math.min(1,x)), L=(a,b,u)=>a+(b-a)*u, P=(t,a,b)=>C01((t-a)/(b-a));
const eIO=u=>u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2, eOut=u=>1-Math.pow(1-u,3), eIn=u=>u*u*u, eQuint=u=>1-Math.pow(1-u,5);
const eBack=(u,s=1.7)=>1+(s+1)*Math.pow(u-1,3)+s*Math.pow(u-1,2);
const eBounce=u=>{const n=7.5625,d=2.75;if(u<1/d)return n*u*u;if(u<2/d)return n*(u-=1.5/d)*u+.75;if(u<2.5/d)return n*(u-=2.25/d)*u+.9375;return n*(u-=2.625/d)*u+.984375;};
function hex(c){return[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];}
function mix(a,b,u){const A=hex(a),B=hex(b);return'#'+A.map((v,i)=>Math.round(L(v,B[i],u)).toString(16).padStart(2,'0')).join('');}
const $=id=>document.getElementById(id);
const G=(id,inner,extra='')=>`<g id="${id}" ${extra}>${inner}</g>`;
function TX(x,y,s,size,fill,o={}){return `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" font-weight="${o.w||700}" text-anchor="${o.a||'start'}" ${o.cls?`class="${o.cls}"`:'class="key"'} ${o.extra||''}>${s}</text>`;}
function PILL(x,y,w,h,s,size,bg,fg,o={}){return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h/2}" fill="${o.outline?'none':bg}" ${o.outline?`stroke="${bg}" stroke-width="4"`:''} ${o.sh?'filter="url(#sh)"':''}/>`+
  TX(x+w/2,y+h/2+size*.36,s,size,fg,{a:'middle',w:o.w||700});}
const SHADOWTX=(x,y,s,size,fill,o={})=>`<text x="${x+8}" y="${y+12}" font-size="${size}" fill="#000" opacity=".35" font-weight="800" text-anchor="${o.a||'start'}" filter="url(#blur)">${s}</text>`+TX(x,y,s,size,fill,Object.assign({w:800},o));

// ---------------- world cells ----------------
const CELL={c1:[0,0],c2:[1300,0],c3:[1300,2400],c4:[2900,0],c5:[4500,0],c6:[4500,2400],c7:[5800,0]};
const restOf=(c,dx=0,dy=0)=>[CELL[c][0]+540+dx,CELL[c][1]+960+dy];
function floorSVG(y0,x0=-110,x1=1190){const xm=(x0+x1)/2;let s=`<path d="M${x0} ${y0} Q${xm} ${y0-35} ${x1} ${y0} L${x1} 2160 L${x0} 2160 Z" fill="url(#flr)"/>`;
  for(let i=0;i<9;i++){const y=y0+10+i*i*9+i*22;s+=`<path d="M${x0} ${y} Q${xm} ${y-30+i*3} ${x1} ${y}" stroke="#fff" stroke-width="2" fill="none" opacity="${(.09-i*.008).toFixed(3)}"/>`;}return s;}
function booth(x,y,w,h,d,face,side,top,cur){let s=`<g filter="url(#sh)">`+ballotBox(x,y,w,h,d,face,side,top);
  const n=6,cw=(w-28)/n;for(let i=0;i<n;i++)s+=`<rect x="${x-w/2+14+i*cw+2}" y="${y-h+40}" width="${cw-4}" height="${h-48}" rx="${cw*.35}" fill="${i%2?cur:mix(cur,'#000000',.12)}"/>`;
  s+=`<rect x="${x-w/2-10}" y="${y-h-8}" width="${w+20}" height="30" rx="6" fill="${COL.amber}"/>`;return s+`</g>`;}
const world=$('world'), hud=$('hud');
const r1=rng(66);
// ===== c1: poster A =====
let s1='';
{const r=r1;
for(let i=0;i<16;i++){s1+=`<g filter="url(#blur)">${ballot(560+r()*500,480+r()*450,26+r()*24,r()*360,COL.teal,.35)}</g>`;}
s1=floorSVG(1240)+s1;
s1+=`<ellipse cx="740" cy="1252" rx="330" ry="34" fill="#000" opacity=".4"/><ellipse cx="225" cy="1250" rx="130" ry="18" fill="#000" opacity=".4"/>`;
s1+=`<g filter="url(#sh)">`+ballotBox(215,1240,190,170,80,'#5B6B85','#3E4C64','#76869F')+`</g>`;
s1+=ballot(232,1052,52,-8,COL.grey,1);
s1+=TX(215,1186,'2566',58,'#DCE3EE',{a:'middle'});
s1+=`<g id="c1erupt"></g>`;
var ERUPT=[];{const bx=715,by=1240,bh=380;for(let i=0;i<70;i++){const t=r();const ang=(-75+(r()-.5)*90)*Math.PI/180;const dist=60+Math.pow(t,0.8)*520;
  const x=bx+20+Math.cos(ang)*dist*0.9,y=by-bh-30+Math.sin(ang)*dist;const w=46+r()*48;const rot=(r()-.5)*90,tk=i%5===0?COL.amber:COL.teal;
  if(y<520||x<590||x>1060) continue;ERUPT.push({x,y,w,rot,tk,v:8+r()*16,vr:(r()-.5)*14});}}
{const bx=715,by=1240,bw=440,bh=380;for(let i=0;i<22;i++){const x=bx-bw/2+80+r()*(bw-10),y=by-bh-10-r()*70;s1+=ballot(x,y,54+r()*20,(r()-.5)*120,COL.teal,1);}
 s1+=`<g filter="url(#sh)">`+ballotBox(bx,by,bw,bh,150,'url(#bigface)','#127A72','#5FD6CB')+`</g>`;
 for(let i=0;i<9;i++){s1+=ballot(470+r()*480,1262+r()*40,50+r()*10,(r()-.5)*160,COL.teal,1);}
 for(let i=0;i<26;i++){const t=r();const y=1300+t*t*560,w=30+t*70;const x=60+r()*960;s1+=`<g ${t<.4?'filter="url(#blur2)"':''}>${ballot(x,y,w,(r()-.5)*170,i%4?COL.teal:COL.amber,.35+t*.5)}</g>`;}
 s1+=G('c1lab',TX(bx,by-bh+150,'2569',128,'#fff',{a:'middle',w:800})+`<rect x="${bx-150}" y="${by-bh+186}" width="300" height="6" rx="3" fill="#fff" opacity=".55"/>`+TX(bx,by-bh+262,'11 ต.ค. 69',54,'#E9FFFC',{a:'middle',w:600}));
 // four 2566-sized outlines filling the 2569 face (volume x4)
 [[515,875],[725,875],[515,1055],[725,1055]].forEach(([x,y],i)=>{s1+=G('c1q'+i,`<rect x="${x}" y="${y}" width="190" height="170" rx="6" fill="#5B6B85" fill-opacity=".55" stroke="#fff" stroke-width="5" stroke-dasharray="16 10"/>`+TX(x+95,y+106,'2566',44,'#fff',{a:'middle'}));});}
s1+=G('c1pill',PILL(90,262,300,64,'คนมาใช้สิทธิ',40,COL.amber,COL.ink));
s1+=G('c1head',TX(90,420,'เลือกตั้งบอร์ดประกันสังคม',80,'#fff',{w:800,extra:'textLength="895" lengthAdjust="spacingAndGlyphs"'}));
s1+=G('c1x4',SHADOWTX(96,740,'×4',330,COL.amber));
s1+=G('c1sub',TX(96,836,'มากกว่าเดิม 4 เท่า',56,'#fff'));
s1+=G('c1kor',`<rect x="90" y="884" width="370" height="78" rx="39" fill="none" stroke="${COL.amber}" stroke-width="4"/>`+TX(275,938,'แล้วโคราชล่ะ?',46,COL.amber,{a:'middle'}));
}
// ===== c2: registration gate -> ID card straight to the booth =====
const FORM=(()=>{let f=`<rect x="-170" y="-220" width="340" height="440" rx="14" fill="#fff"/><rect x="-170" y="-220" width="340" height="86" rx="14" fill="#E9E4D8"/><rect x="-170" y="-150" width="340" height="16" fill="#E9E4D8"/>`+
  `<text x="0" y="-160" font-size="44" font-weight="700" fill="${COL.navy}" text-anchor="middle">ลงทะเบียน</text>`;
  for(let i=0;i<5;i++){f+=`<rect x="-130" y="${-100+i*58}" width="30" height="30" rx="5" fill="none" stroke="#B9B2A3" stroke-width="4"/><rect x="-82" y="${-92+i*58}" width="${200-(i%2)*60}" height="14" rx="7" fill="#D8D2C4"/>`;}
  f+=`<rect x="-130" y="${190-20}" width="150" height="10" rx="5" fill="#B9B2A3"/>`;return f;})();
const TEARL='M-200 -260 L10 -260 L-14 -180 L18 -110 L-12 -40 L20 30 L-10 100 L16 170 L-6 260 L-200 260 Z';
const TEARR='M200 -260 L10 -260 L-14 -180 L18 -110 L-12 -40 L20 30 L-10 100 L16 170 L-6 260 L200 260 Z';
let s2=floorSVG(1200);
s2+=`<defs><clipPath id="tl"><path d="${TEARL}"/></clipPath><clipPath id="tr"><path d="${TEARR}"/></clipPath></defs>`;
s2+=`<ellipse cx="830" cy="1206" rx="170" ry="24" fill="#000" opacity=".4"/>`;
s2+=G('c2booth',booth(830,1200,220,360,110,'#E9F4F2','#9FC3BF','#FFFFFF',COL.navy));
s2+=G('c2walk','');
// gate: posts + arm + calendar sign
s2+=G('c2gate',`<rect x="520" y="900" width="26" height="300" rx="6" fill="#DCE3EE"/><rect x="514" y="1190" width="38" height="14" rx="4" fill="#9AA3B2"/>`+
  `<g id="c2arm"><rect x="533" y="960" width="300" height="34" rx="17" fill="${COL.amber}"/>`+[0,1,2,3].map(i=>`<rect x="${580+i*66}" y="960" width="30" height="34" fill="#141414" opacity=".8"/>`).join('')+`</g>`+
  `<g id="c2cal" filter="url(#sh)"><rect x="453" y="700" width="160" height="170" rx="16" fill="#fff"/><rect x="453" y="700" width="160" height="48" rx="16" fill="#E2574C"/><rect x="453" y="730" width="160" height="18" fill="#E2574C"/>`+
  `<rect x="478" y="688" width="12" height="30" rx="6" fill="#555"/><rect x="576" y="688" width="12" height="30" rx="6" fill="#555"/>`+
  [0,1,2,3,4,5,6,7,8].map(i=>`<rect x="${478+(i%3)*42}" y="${764+Math.floor(i/3)*32}" width="28" height="20" rx="4" fill="${i===4?'#E2574C':'#D5DCE5'}"/>`).join('')+`</g>`);
s2+=G('c2formL',`<g clip-path="url(#tl)">${FORM}</g>`)+G('c2formR',`<g clip-path="url(#tr)">${FORM}</g>`);
s2+=G('c2id',`<g filter="url(#sh)">${idCard(270,700,380,-8,COL.teal)}</g>`+PILL(110,860,320,70,'บัตรประชาชน',44,COL.amber,COL.ink));
s2+=G('c2h1',PILL(110,262,190,64,'2566',44,'#9AA3B2',COL.ink)+TX(110,400,'ต้องลงทะเบียนล่วงหน้า',76,'#fff',{w:800}));
s2+=G('c2h2',PILL(110,262,190,64,'2569',44,COL.amber,COL.ink)+TX(110,400,'ไม่ต้องลงทะเบียน',84,'#fff',{w:800})+TX(110,480,'ถือบัตรประชาชน เข้าคูหาได้เลย',50,'#BFF2EC',{w:600}));
// ===== c3: three doors 33 / 39 / 40 =====
const DOORX=[250,535,820];
function door(i,x){const w=200,h=380,y=1160,d=90;let s=`<ellipse cx="${x+20}" cy="${y+8}" rx="${w*.7}" ry="20" fill="#000" opacity=".35"/>`;
  s+=`<g filter="url(#sh)">`+ballotBox(x,y,w,h,d,'#3B2C66','#251B45','#574490')+`</g>`;
  s+=`<path d="M${x-70} ${y} L${x-70} ${y-230} A70 70 0 0 1 ${x+70} ${y-230} L${x+70} ${y} Z" fill="#0E0920"/>`;
  s+=`<path d="M${x-70} ${y} L${x-70} ${y-230} A70 70 0 0 1 ${x+70} ${y-230} L${x+70} ${y} Z" fill="url(#doorlight)" id="c3lt${i}" opacity="0"/>`;
  s+=`<g id="c3leaf${i}"><path d="M${x-70} ${y} L${x-70} ${y-230} A70 70 0 0 1 ${x+70} ${y-230} L${x+70} ${y} Z" fill="#1A1233" stroke="#7E68C2" stroke-width="4"/><circle cx="${x+48}" cy="${y-130}" r="7" fill="${COL.amber}"/></g>`;
  return s;}
let s3=`<radialGradient id="doorlight" cx="50%" cy="60%" r="70%"><stop offset="0" stop-color="#fff"/><stop offset=".5" stop-color="#7FF0E4"/><stop offset="1" stop-color="${COL.teal}"/></radialGradient>`;
s3+=`<circle id="c3glow" cx="820" cy="960" r="420" fill="url(#glowT)" opacity="0"/>`;
DOORX.forEach((x,i)=>{s3+=G('c3d'+i,door(i,x)+PILL(x-108,650,216,72,'มาตรา '+[33,39,40][i],42,i===2?COL.amber:'#E6E0F5',COL.ink));});
s3+=G('c3p0',person(250,1270,1.5,'office','#E9EEF4',COL.teal));
s3+=G('c3p1',person(535,1270,1.5,'plain','#B9A9E8'));
s3+=G('c3p2',person(745,1290,1.3,'farmer',COL.amber,'#FFE3A6')+person(830,1270,1.45,'vendor','#E8962A','#FFE3A6')+person(905,1290,1.3,'labour',COL.amber,'#FFE3A6'));
s3+=G('c3h',TX(110,350,'สิทธิ์นี้ ไม่ได้มีแค่',64,'#fff',{w:700})+TX(110,470,'มนุษย์เงินเดือน',104,COL.amber,{w:800}));
s3+=G('c3free',PILL(330,400,600,92,'คนทำงานอิสระ ก็เลือกได้',52,COL.teal,'#fff',{sh:1}));
// ===== c4: real map, Korat =====
const ISAN=new Set(['Roi Et','Nong Bua Lam Phu','Surin','Nakhon Ratchasima','Chaiyaphum','Si Sa Ket','Nong Khai','Khon Kaen','Loei','Kalasin','Udon Thani','Sakon Nakhon','Yasothon','Buri Ram','Bueng Kan','Ubon Ratchathani','Maha Sarakham','Mukdahan','Amnat Charoen','Nakhon Phanom']);
const PC=n=>{const b=MAP.prov.find(p=>p.n===n).bbox;return[(b[0]+b[2])/2,(b[1]+b[3])/2];};
const KOR=[574,683],KK=PC('Khon Kaen'),UD=PC('Udon Thani'),UB=PC('Ubon Ratchathani');
const MO=[40,40]; // map offset inside c4
let s4=`<g transform="translate(${MO[0]},${MO[1]})">`;
let ext="",ptop="";const kd=MAP.prov.find(p=>p.n==='Nakhon Ratchasima').d;
for(const p of MAP.prov){const is=ISAN.has(p.n);if(is)ext+=`<path d="${p.d}"/>`;
  ptop+=`<path d="${p.d}" fill="${p.n==='Nakhon Ratchasima'?COL.amber:is?'#8A5A30':'#5A3A20'}" fill-opacity="${is?1:.75}" stroke="#2A1608" stroke-width="1.6" stroke-linejoin="round"/>`;}
s4+=`<g transform="translate(0,10)" fill="#1A0C04" opacity=".7">${ext}</g><g transform="translate(0,5)" fill="#2A1608">${ext}</g>`+ptop;
s4+=`<path d="${kd}" fill="url(#pplpat)" id="c4pp" opacity="0"/>`;
s4+=`<path d="${kd}" fill="none" stroke="#FFE3A6" stroke-width="3" id="c4kline"/>`;
s4+=`<g id="c4cols"></g>`;
const LBL=(id,x,y,s,col)=>G(id,`<text x="${x}" y="${y}" font-size="28" font-weight="700" fill="${col}" text-anchor="middle" stroke="#1A0C04" stroke-width="7" paint-order="stroke" class="key">${s}</text>`);
s4+=LBL('c4lKK',KK[0],KK[1]+36,'ขอนแก่น','#fff')+LBL('c4lUD',UD[0],UD[1]+36,'อุดร','#fff')+LBL('c4lUB',UB[0]-80,UB[1]+10,'อุบล','#fff');
s4+=`</g>`;
// ===== c5: Korat crowd =====
let s5=`<g id="c5crowd"></g><rect x="-400" y="520" width="1880" height="330" fill="url(#fade5)"/>`;
s5+=G('c5booth',booth(540,800,150,220,70,'#E9F4F2','#9FC3BF','#FFFFFF','#103629')+`<g>${ballot(540,520,74,-6,COL.teal,1)}</g>`);
s5+=G('c5h1',TX(110,340,'ส่วนใหญ่',64,'#fff')+TX(110,470,'ไม่ได้นั่งออฟฟิศ',100,COL.amber,{w:800}));
s5+=G('c5h2',TX(110,340,'ปีนี้ เดินเข้าคูหา',72,'#fff',{w:800})+TX(110,440,'แบบเดียวกับพนักงานบริษัท',58,'#BFF2DA',{w:600}));
s5+=G('c5card',`<rect x="110" y="960" width="460" height="200" rx="26" fill="${COL.amber}" filter="url(#sh)"/>`+TX(340,1072,'7 ใน 10',110,COL.ink,{a:'middle',w:800})+TX(340,1132,'ทำงานอิสระ มาตรา 40',40,COL.ink,{a:'middle'}));
s5+=G('c5off',PILL(650,860,220,66,'ออฟฟิศ',40,'#fff',COL.navy,{sh:1}));
s5+=G('c5kinds',PILL(110,1180,460,62,'ทำไร่ ค้าขาย รับจ้าง',40,'#103629','#FFE3A6'));
// ===== c6: sealed box waiting + fund jar =====
let s6=floorSVG(1200,-110,2490);
s6+=`<ellipse cx="560" cy="1210" rx="300" ry="30" fill="#000" opacity=".4"/>`;
s6+=`<g filter="url(#sh)">`+ballotBox(540,1200,400,340,140,'url(#bigface)','#127A72','#5FD6CB')+`</g>`;
s6+=`<path d="M${540-120+38} ${1200-340-31} L${540+120+38} ${1200-340-31}" stroke="${COL.amber}" stroke-width="22" opacity=".95"/>`;
s6+=G('c6clock',`<circle cx="540" cy="680" r="96" fill="#fff" filter="url(#sh)"/><circle cx="540" cy="680" r="80" fill="none" stroke="#D5DCE5" stroke-width="6"/>`+
  [0,1,2,3,4,5,6,7,8,9,10,11].map(i=>`<rect x="537" y="606" width="6" height="${i%3?10:18}" fill="#1A2050" transform="rotate(${i*30} 540 680)"/>`).join('')+
  `<rect id="c6hh" x="535" y="630" width="10" height="56" rx="5" fill="#1A2050"/><rect id="c6mh" x="537" y="612" width="6" height="74" rx="3" fill="${COL.amber}"/><circle cx="540" cy="680" r="9" fill="#1A2050"/>`);
s6+=G('c6stamp',`<g transform="rotate(-10 540 1030)"><rect x="330" y="975" width="420" height="112" rx="14" fill="#fff" fill-opacity=".92" stroke="${COL.amber}" stroke-width="8"/><rect x="342" y="987" width="396" height="88" rx="8" fill="none" stroke="${COL.amber}" stroke-width="3"/>`+
  TX(540,1052,'รอผลทางการ',62,'#B5651D',{a:'middle',w:800})+`</g>`);
s6+=G('c6h1',TX(110,340,'ผลอย่างเป็นทางการ',64,'#fff')+TX(110,470,'ยังไม่ประกาศ',110,COL.amber,{w:800}));
// part 2 at local x+1300
const JX=1300+540;
s6+=`<circle id="c6glow" cx="${JX}" cy="940" r="380" fill="url(#glowT)" opacity="0"/>`;
s6+=`<path id="c6line" d="M1390 760 C1600 745 1800 735 1980 700 C2080 680 2150 640 2200 560 L2230 470" fill="none" stroke="${COL.amber}" stroke-width="12" stroke-linecap="round" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"/>`;
s6+=`<circle id="c6dot" r="16" fill="${COL.amber}" cx="1390" cy="760"/>`;
s6+=G('c6lineL',TX(2195,500,'ความสนใจ',42,COL.amber,{a:'end'}));
s6+=`<ellipse cx="${JX}" cy="1138" rx="220" ry="26" fill="#000" opacity=".4"/>`;
s6+=`<g id="c6coins" transform="translate(0,-70)"></g>`;
s6+=`<g filter="url(#sh)" transform="translate(0,-70)"><rect x="${JX-170}" y="880" width="340" height="320" rx="48" fill="#fff" fill-opacity=".10" stroke="#fff" stroke-opacity=".75" stroke-width="6"/>`+
  `<rect x="${JX-120}" y="850" width="240" height="40" rx="10" fill="${COL.teal}"/><rect x="${JX-140}" y="830" width="280" height="30" rx="10" fill="#5FD6CB"/>`+
  `<rect x="${JX-40}" y="836" width="80" height="12" rx="6" fill="#0b1426"/><path d="M${JX-140} 940 Q${JX-150} 1060 ${JX-140} 1150" stroke="#fff" stroke-opacity=".5" stroke-width="10" fill="none" stroke-linecap="round"/></g>`;
s6+=G('c6pill',PILL(JX-290,1225,580,0.01,'',1,'none','none')+PILL(JX-300,1236,600,0.01,'',1,'none','none'));
s6+=G('c6jarL',PILL(1300+120,700,600,0.01,'',1,'none','none'));
s6+=G('c6h2',TX(1410,365,'คนสนใจกองทุน',80,'#fff',{w:800})+TX(1410,442,'ที่ตัวเองส่งเงินทุกเดือน',52,'#C9D0FF',{w:600}));
s6+=G('c6more',PILL(1410,472,420,80,'มากกว่าที่เคย',50,COL.amber,COL.ink,{sh:1}));
// ===== c7: question + end card =====
let s7=floorSVG(1210);
s7+=G('c7q',SHADOWTX(540,450,'แล้วคุณล่ะ',150,COL.amber,{a:'middle'})+TX(540,570,'ไปเลือกมาหรือเปล่า?',76,'#fff',{a:'middle',w:800})+
  `<g filter="url(#sh)">${idCard(380,1010,240,-12,COL.teal)}</g>`+
  `<g transform="translate(640 900) rotate(6)" filter="url(#sh)"><rect x="-150" y="-200" width="300" height="400" rx="16" fill="#fff"/>`+
  `<rect x="-110" y="-150" width="70" height="70" rx="10" fill="none" stroke="#B9B2A3" stroke-width="7"/><rect x="-20" y="-128" width="120" height="20" rx="10" fill="#D8D2C4"/>`+
  `<rect x="-110" y="-40" width="70" height="70" rx="10" fill="none" stroke="#B9B2A3" stroke-width="7"/><rect x="-20" y="-18" width="120" height="20" rx="10" fill="#D8D2C4"/>`+
  `<path id="c7tick" d="M-100 -118 l22 26 l46 -60" fill="none" stroke="${COL.teal}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"/>`+
  `<rect x="-110" y="80" width="210" height="16" rx="8" fill="#E3DED4"/></g>`);
s7+=G('c7next',PILL(240,1150,600,84,'รอบหน้าจะไปไหม?',52,COL.teal,'#fff',{sh:1}));
s7+=G('c7end',TX(110,370,'คนมาเลือก 4 เท่า',100,'#fff',{w:800})+
  `<rect x="110" y="410" width="370" height="78" rx="39" fill="none" stroke="${COL.amber}" stroke-width="4"/>`+TX(295,464,'แล้วโคราชล่ะ?',46,COL.amber,{a:'middle'})+
  `<g transform="translate(560 900) scale(.62)"><ellipse cx="-170" cy="10" rx="120" ry="18" fill="#000" opacity=".4"/><g filter="url(#sh)">${ballotBox(-180,0,190,170,80,'#5B6B85','#3E4C64','#76869F')}</g>`+
  `<text x="-180" y="-54" font-size="58" font-weight="700" fill="#DCE3EE" text-anchor="middle">2566</text>`+
  `<g filter="url(#sh)">${ballotBox(250,0,440,380,150,'url(#bigface)','#127A72','#5FD6CB')}</g><text x="250" y="-230" font-size="128" font-weight="800" fill="#fff" text-anchor="middle">2569</text></g>`);
s2=CLIPBG("cb2",BG2())+s2;s3=CLIPBG("cb3",BG3())+s3;s4=CLIPBG("cb4",BG4())+s4;s5=CLIPBG("cb5",BG5())+s5;s6=CLIPBG("cb6",BG6(),2600)+s6;s7=CLIPBG("cb7",BG7())+s7;
world.innerHTML=[['c1',s1],['c2',s2],['c3',s3],['c4',s4],['c5',s5],['c6',s6],['c7',s7]].map(([c,s])=>`<g id="${c}" transform="translate(${CELL[c][0]},${CELL[c][1]})">${s}</g>`).join('');
// jar label + pill as real pills (placeholders above kept ids simple)
$('c6pill').innerHTML=PILL(JX-300,1150,600,72,'กองทุนที่ส่งเงินทุกเดือน',42,COL.teal,'#fff',{sh:1});
$('c6jarL').innerHTML='';

// ---------------- HUD (screen space) ----------------
hud.innerHTML=
 G('h4q',SHADOWTX(540,400,'แล้วโคราชล่ะ?',120,COL.amber,{a:'middle'}))+
 G('h4hero',SHADOWTX(540,530,'1 ล้าน',230,COL.amber,{a:'middle'})+TX(540,615,'ผู้ประกันตนโคราช',56,'#fff',{a:'middle'}))+
 G('h4most',PILL(310,645,460,78,'มากที่สุดในอีสาน',46,'#fff','#43260F',{sh:1}))+
 G('h4ko',PILL(130,560,300,84,'โคราช 1 ล้าน',46,COL.amber,COL.ink,{sh:1}))+
 G('h4mg',`<rect x="470" y="690" width="500" height="136" rx="30" fill="#fff" filter="url(#sh)"/>`+TX(720,748,'ขอนแก่น + อุดร + อุบล',42,'#43260F',{a:'middle'})+TX(720,804,'รวมกันยังน้อยกว่า',42,'#B8741F',{a:'middle'}))+
 G('h4cr',TX(110,1255,'แผนที่ geoBoundaries ADM1 (CC BY 3.0 IGO)',22,'#F4E6D6',{w:500,extra:'stroke="#1E0D04" stroke-width="5" paint-order="stroke"'}))+
 G('hsweep',`<g transform="translate(540 0) rotate(-8)">${ballot(0,0,1500,0,COL.teal,1)}</g>`)+
 `<rect id="hflash" x="0" y="0" width="1080" height="1920" fill="#BFFFF6" opacity="0"/>`;

// ---------------- animation registry ----------------
const AN={};
function reg(id){return AN[id]||(AN[id]={el:$(id),list:[]});}
function IN(id,t,kind='pop',d=.5,o={}){reg(id).list.push({t,d,kind,o,io:1});}
function OUT(id,t,kind='fade',d=.4,o={}){reg(id).list.push({t,d,kind,o,io:0});}
function PULSE(id,t,amp=.12,d=.5){reg(id).list.push({t,d,kind:'pulse',o:{amp},io:2});}
function applyAnims(t){for(const id in AN){const a=AN[id];if(!a.piv){const b=a.el.getBBox();a.piv=[b.x+b.width/2,b.y+b.height/2];}
  let op=1,dx=0,dy=0,s=1,rot=0;const hasIn=a.list.some(e=>e.io===1);if(hasIn&&t<Math.min(...a.list.filter(e=>e.io===1).map(e=>e.t)))op=0;
  for(const e of a.list){if(t<e.t)continue;const u=C01((t-e.t)/e.d),o=e.o;
    if(e.io===1){op*=1;switch(e.kind){
      case'pop':s*=L(.3,1,eBack(u));op*=C01(u*3);break;
      case'slideU':dy+=(1-eOut(u))*(o.dy||90);op*=C01(u*2.5);break;
      case'slideD':dy-=(1-eOut(u))*(o.dy||90);op*=C01(u*2.5);break;
      case'slideL':dx+=(1-eOut(u))*(o.dx||160);op*=C01(u*2.5);break;
      case'slideR':dx-=(1-eOut(u))*(o.dx||160);op*=C01(u*2.5);break;
      case'drop':dy-=(1-eBounce(u))*(o.h||260);op*=C01(u*4);break;
      case'stamp':s*=L(2.6,1,eIn(u));op*=C01(u*2);break;
      case'fade':op*=u;break;}}
    else if(e.io===0){switch(e.kind){
      case'fade':op*=1-u;break;
      case'up':dy-=eIO(u)*(o.dy||120);op*=1-u;break;
      case'shrink':s*=L(1,.4,eIO(u));op*=1-u;break;
      case'move':{const v=eIO(u);dx+=(o.dx||0)*v;dy+=(o.dy||0)*v;s*=L(1,o.s||1,v);if(o.op!=null)op*=L(1,o.op,v);break;}}}
    else{if(u<1)s*=1+o.amp*Math.sin(Math.PI*u);}}
  const [px,py]=a.piv;a.el.setAttribute('opacity',op.toFixed(3));a.el.style.display=op<=0.001?'none':'';
  a.el.setAttribute('transform',`translate(${(px+dx).toFixed(1)} ${(py+dy).toFixed(1)}) scale(${s.toFixed(4)}) translate(${-px} ${-py})`);}}

// ---- c1 ----
OUT('c1kor',1.9,'fade',.4);OUT('c1pill',1.9,'fade',.4);
OUT('c1lab',3.1,'fade',.35);
[0,1,2,3].forEach(i=>IN('c1q'+i,3.45+i*.25,'drop',.55,{h:220}));
PULSE('c1x4',4.55,.14,.6);
// ---- c2 ----
IN('c2h1',5.95,'slideL',.55);IN('c2formL',6.25,'drop',.6,{h:300});IN('c2formR',6.25,'drop',.6,{h:300});
IN('c2gate',6.8,'slideU',.5,{dy:160});
OUT('c2h1',10.2,'up',.35);IN('c2h2',10.4,'slideU',.5);OUT('c2cal',10.25,'shrink',.4);
IN('c2id',10.95,'pop',.55);
// ---- c3 ----
IN('c3h',15.15,'slideL',.55);
[0,1,2].forEach(i=>{IN('c3d'+i,15.25+i*.22,'slideU',.55,{dy:200});IN('c3p'+i,15.6+i*.22,'pop',.45);});
OUT('c3h',17.75,'up',.4);IN('c3free',18.2,'pop',.5);
OUT('c3d0',17.9,'move',.5,{op:.4});OUT('c3d1',17.9,'move',.5,{op:.4});OUT('c3p0',17.9,'move',.5,{op:.4});OUT('c3p1',17.9,'move',.5,{op:.4});
// ---- c4 / HUD ----
IN('h4q',23.15,'pop',.45);OUT('h4q',24.15,'up',.35);
IN('h4hero',24.4,'slideU',.55);IN('h4most',25.7,'pop',.45);
OUT('h4hero',28.35,'up',.4);OUT('h4most',28.35,'up',.4);
IN('h4ko',29.0,'pop',.45);IN('h4mg',31.25,'slideL',.5);
IN('h4cr',23.3,'fade',.4);OUT('h4cr',32.65,'fade',.3);OUT('h4ko',32.65,'fade',.3);OUT('h4mg',32.65,'fade',.3);
['c4lKK','c4lUD','c4lUB'].forEach((id,i)=>{IN(id,28.9+i*.2,'fade',.4);OUT(id,30.4,'fade',.3);});
// ---- c5 ----
IN('c5h1',33.4,'slideL',.55);IN('c5card',35.55,'pop',.55);IN('c5off',35.9,'pop',.45);IN('c5kinds',36.4,'slideU',.5);
OUT('c5h1',38.75,'up',.35);IN('c5h2',38.95,'slideU',.5);IN('c5booth',38.6,'drop',.6,{h:300});
OUT('c5card',39.0,'move',.6,{dx:-30,dy:-10,s:.82});OUT('c5kinds',39.0,'fade',.4);OUT('c5off',39.0,'fade',.4);
// ---- c6 ----
IN('c6h1',44.0,'slideL',.55);IN('c6clock',44.0,'pop',.5);IN('c6stamp',44.4,'stamp',.3);
IN('c6h2',46.35,'slideL',.55);IN('c6pill',47.3,'slideU',.5);IN('c6lineL',50.75,'fade',.4);IN('c6more',50.4,'pop',.5);
// ---- c7 ----
IN('c7q',52.85,'pop',.55);IN('c7next',55.0,'slideU',.45);
OUT('c7q',56.25,'move',.5,{dy:-200,s:.6,op:0});OUT('c7next',56.25,'fade',.3);
IN('c7end',56.55,'slideU',.6,{dy:120});

// ---------------- camera ----------------
const R=c=>restOf(c);
const MW=(x,y)=>[CELL.c4[0]+MO[0]+x,CELL.c4[1]+MO[1]+y]; // map -> world
const KZ=2.6,IZ=1.55;
const KORc=MW(KOR[0],KOR[1]);const ISc=MW(690,545);
const KEYS=[ // [t,cx,cy,z,rot,ease]
 [0,540,960,1,0],[1.9,540,955,1.008,0,'lin'],[3.2,540,978,1.0,0,'io'],[5.3,540,978,1.006,0,'lin'],
 [5.9,...R('c2'),1,0,'whip'],[7.9,R('c2')[0]-8,R('c2')[1]+6,1.008,0,'lin'],[9.9,R('c2')[0]+10,R('c2')[1],1.0,0.5,'io'],
 [10.25,R('c2')[0]-20,R('c2')[1]-60,1.07,0,'out'],[10.9,...R('c2'),1,0,'io'],[12.6,R('c2')[0]+14,R('c2')[1],1.008,0,'lin'],[14.55,R('c2')[0]+14,R('c2')[1]+4,1.0,0,'io'],
 [15.15,...R('c3'),1,0,'out'],[16.6,R('c3')[0],R('c3')[1]-6,1.008,0,'lin'],[17.75,R('c3')[0],R('c3')[1],1,0,'io'],
 [18.4,R('c3')[0]+20,R('c3')[1]+20,1.025,0,'io'],[20.4,R('c3')[0]+22,R('c3')[1]+20,1.035,0,'lin'],[22.3,R('c3')[0]+30,R('c3')[1]+10,1.02,0,'io'],
 [22.9,R('c3')[0]+280,R('c3')[1]+40,7,0,'in'],
 [22.91,CELL.c4[0]+540,CELL.c4[1]+960,1.35,6,'cut'],[23.35,CELL.c4[0]+540,CELL.c4[1]+960,1.0,0,'out'],[23.95,CELL.c4[0]+540,CELL.c4[1]+980,1.03,0,'lin'],
 [24.6,KORc[0],KORc[1]-38,KZ,0,'io'],[26.4,KORc[0]+6,KORc[1]-40,KZ*1.03,0,'lin'],[27.8,KORc[0]-4,KORc[1]-34,KZ*1.0,0,'io'],
 [28.75,ISc[0],ISc[1],IZ,0,'io'],[30.3,ISc[0]+4,ISc[1]+4,IZ*1.02,0,'lin'],[31.3,ISc[0]-6,ISc[1]-6,IZ*1.04,0,'io'],[32.7,ISc[0]-6,ISc[1]-6,IZ*1.06,0,'lin'],
 [33.05,(ISc[0]+R('c5')[0])/2,R('c5')[1]-200,.7,8,'io'],[33.45,...R('c5'),1,0,'out'],[35.3,R('c5')[0],R('c5')[1]+6,1.008,0,'lin'],
 [36.0,R('c5')[0]+10,R('c5')[1],1.0,-0.5,'io'],[38.6,R('c5')[0]+10,R('c5')[1]-6,1.008,-0.5,'lin'],[39.4,R('c5')[0],R('c5')[1]-20,1.0,0,'io'],[41.4,R('c5')[0],R('c5')[1]-24,1.008,0,'lin'],[43.45,R('c5')[0],R('c5')[1]-24,1.0,0,'io'],
 [43.85,R('c5')[0],R('c6')[1]-200,.6,0,'io'],[44.25,...R('c6'),1,0,'out'],[45.9,R('c6')[0],R('c6')[1]-6,1.015,0,'lin'],
 [46.55,R('c6')[0]+1300,R('c6')[1],1,0,'io'],[48.4,R('c6')[0]+1300,R('c6')[1]+8,1.008,0,'lin'],[50.3,R('c6')[0]+1300,R('c6')[1],1.0,0,'io'],[50.6,R('c6')[0]+1300,R('c6')[1]-10,1.03,0,'out'],[52.3,R('c6')[0]+1300,R('c6')[1]-10,1.035,0,'lin'],
 [52.85,...R('c7'),1,0,'io'],[54.6,R('c7')[0],R('c7')[1]+6,1.008,0,'lin'],[56.2,R('c7')[0],R('c7')[1],1,0,'io'],[59.76,R('c7')[0],R('c7')[1],1.008,0,'lin'],
];
function camAt(t){const K=KEYS;if(t<=K[0][0])return{x:K[0][1],y:K[0][2],z:K[0][3],r:K[0][4]};
  for(let i=1;i<K.length;i++){const a=K[i-1],b=K[i];if(t<=b[0]){let u=(t-a[0])/(b[0]-a[0]);const e=b[5]||'io';
    u=e==='lin'?u:e==='out'?eQuint(u):e==='in'?eIn(u):e==='cut'?1:e==='whip'?eIO(Math.pow(u,1.2)):eIO(u);
    return{x:L(a[1],b[1],u),y:L(a[2],b[2],u),z:Math.exp(L(Math.log(a[3]),Math.log(b[3]),u)),r:L(a[4],b[4],u)};}}
  const l=K[K.length-1];return{x:l[1],y:l[2],z:l[3],r:l[4]};}

// ---------------- background family ----------------
const BG={navy:['#22406B','#13233F','#0B172B'],teal:['#1C6B6B','#0F4446','#062426'],plum:['#4D3478','#2B1D4A','#150D29'],
 dusk:['#7A4A22','#43260F','#1E0D04'],forest:['#1F5E48','#103629','#061A12'],indigo:['#323F86','#1A2050','#0B0E2A']};
const BGK=[[0,'navy'],[5.35,'navy'],[5.95,'teal'],[14.62,'teal'],[15.05,'plum'],[22.88,'plum'],[22.95,'dusk'],[32.8,'dusk'],[33.4,'forest'],[43.55,'forest'],[44.1,'indigo'],[52.45,'indigo'],[52.95,'navy']];
const RAYC=[[0,700,820],[5.3,700,820],[5.95,820,900],[14.6,820,900],[15.2,835,900],[22.8,835,900],[23.0,540,1000],[32.8,300,900],[33.4,540,640],[43.5,540,640],[44.2,540,700],[46.0,540,700],[46.6,540,1000],[52.4,540,1000],[52.9,640,900]];
function lerpK(K,t,f){if(t<=K[0][0])return f(K[0],K[0],0);for(let i=1;i<K.length;i++)if(t<=K[i][0])return f(K[i-1],K[i],eIO((t-K[i-1][0])/(K[i][0]-K[i-1][0])));return f(K[K.length-1],K[K.length-1],0);}
function bgAt(t){return lerpK(BGK,t,(a,b,u)=>BG[a[1]].map((c,i)=>mix(c,BG[b[1]][i],u)));}
{let rays='';for(let i=0;i<36;i++){const a=(i*10)*Math.PI/180,a2=a+4*Math.PI/180;rays+=`<path d="M0 0 L${2600*Math.cos(a)} ${2600*Math.sin(a)} L${2600*Math.cos(a2)} ${2600*Math.sin(a2)} Z"/>`;}$('rays').innerHTML=rays;}

// ---------------- dynamic drawers ----------------
function drawC1(t){let s='';for(const b of ERUPT){const y=b.y-b.v*t;const op=C01((y-470)/60);if(op<=0)continue;s+=ballot(b.x+Math.sin(t*1.3+b.v)*4*Math.min(t,1),y,b.w,b.rot+b.vr*t,b.tk,op);}
  $('c1erupt').innerHTML=`<g filter="url(#sh)">${s}</g>`;}
const WALK=[];{const r=rng(2);const kinds=['office','farmer','vendor','labour','plain'],cols=[COL.amber,'#E9EEF4','#2BC0B3','#F6C451','#C9D0FF'];
  for(let i=0;i<11;i++)WALK.push({x0:460-i*92,k:kinds[i%5],c:cols[(i*3)%5],ph:r()*6});}
function drawC2(t){ // tear + gate + walkers
  const tu=eIO(P(t,10.2,10.9));
  $('c2formL').firstElementChild.setAttribute('transform',`translate(${300-tu*360} ${700+tu*260}) rotate(${-6-tu*38})`);
  $('c2formR').firstElementChild.setAttribute('transform',`translate(${300+tu*240} ${700+tu*320}) rotate(${-6+tu*44})`);
  $('c2formL').style.visibility=$('c2formR').style.visibility=tu>=1?'hidden':'visible';
  $('c2formL').firstElementChild.setAttribute('opacity',1-P(t,10.6,10.9));$('c2formR').firstElementChild.setAttribute('opacity',1-P(t,10.6,10.9));
  const ga=eBack(P(t,10.35,10.9),1.2)*-82;$('c2arm').setAttribute('transform',`rotate(${ga} 533 977)`);
  let s='';const go=P(t,10.55,10.56)>0;
  for(const p of WALK){let x=p.x0;let col='#7E9A9A',k='plain';
    if(t>10.55){col=p.c;k=p.k;x=p.x0+Math.max(0,t-10.6)*190;}
    if(x>790)continue;const op=C01((x+40)/80)*(x>720?C01((790-x)/70):1);if(op<=0)continue;
    const bob=t>10.6?Math.abs(Math.sin((t+p.ph)*7))*-8:0;
    s+=`<g opacity="${op.toFixed(2)}">`+person(x,1215+bob,1.7,k,col,k==='office'?COL.teal:'#FFE3A6')+(t>10.6?idCard(x+30,1215-90*1.7*.62+bob,34,-10,COL.amber):'')+`</g>`;}
  $('c2walk').innerHTML=s;
  // before the tear people pile up at the gate
}
function drawC3(t){for(let i=0;i<3;i++){const on=i===2?eIO(P(t,17.8,18.4)):0;
  $('c3leaf'+i).setAttribute('transform',`translate(${DOORX[i]-70} 0) scale(${(1-on*.82).toFixed(3)} 1) translate(${-(DOORX[i]-70)} 0)`);
  $('c3lt'+i).setAttribute('opacity',on.toFixed(3));}
  $('c3spill').setAttribute('opacity',(eIO(P(t,17.8,18.5))*.8).toFixed(3));$('c3glow').setAttribute('opacity',(eIO(P(t,17.8,18.5))*.9).toFixed(3));}
function col3d(x,y,w,h,face,side,top){if(h<=0.5)return'';const d=w*.62;let s=ballotBox(x,y,w,h,d,face,side,top);
  for(let k=1;k*30<h;k++){s+=`<path d="M${x-w/2} ${y-k*30} L${x+w/2} ${y-k*30} L${x+w/2+d*.55} ${y-k*30-d*.45}" stroke="#000" stroke-opacity=".22" stroke-width="2" fill="none"/>`;}return `<g filter="url(#sh)">${s}</g>`;}
const HK=300,HO={KK:HK*250705/1026982,UD:HK*165570/1026982,UB:HK*159712/1026982};
function drawC4(t){$('c4pp').setAttribute('opacity',(eIO(P(t,24.4,25.2))*(1-P(t,28.4,28.9)*.6)).toFixed(3));
  const g=eOut(P(t,28.7,29.6));let s='';
  const kx=KOR[0]-24,ky=KOR[1];
  const m=eIO(P(t,30.45,31.3));const mx=kx+92;
  // targets: Ubon bottom, Udon middle, KK top
  const items=[['UB',UB,0,'#5FD6CB'],['UD',UD,HO.UB,'#2BC0B3'],['KK',KK,HO.UB+HO.UD,COL.teal]];
  const grow=k=>eOut(P(t,29.0+k*.18,29.7+k*.18));
  // Korat column
  s+=col3d(kx,ky,58,HK*g,COL.amber,'#B8741F','#FFD08A');
  const draws=items.map(([n,p,off,c],k)=>{const x=L(p[0],mx,m),y=L(p[1],ky-off,m);return{y,svg:col3d(x,y,50,HO[n]*grow(k),c,'#0F6A63','#8FE8DF')};});
  if(m>0.5)draws.sort((a,b)=>b.y-a.y);
  s+=draws.map(d=>d.svg).join('');$('c4cols').innerHTML=s;}
const CROWD=[];{const r=rng(40);const kinds=['farmer','vendor','labour'];
  for(let z=8.0;z>=0.95;z-=0.42){for(let c=0;c<10;c++){const self=c<7;CROWD.push({c,z0:z+(r()-.5)*.12,jx:(r()-.5)*.1,k:self?kinds[Math.floor(r()*3)]:'office',
    col:self?(r()<.5?COL.amber:'#E8962A'):(r()<.5?'#E9EEF4':'#CFD8E3'),acc:self?'#FFE3A6':COL.teal,d:r()});}}}
function drawC5(t){const VX=540,VY=640,F=520,YH=1200;const gap=eIO(P(t,35.4,36.2))*.22;const walk=Math.max(0,t-38.95)*0.9;
  const ppl=[];for(const p of CROWD){let z=p.z0+walk;const span=7.6;if(walk>0){z=((z-0.95)%span)+0.95;}
    const X=(p.c-4.5)*0.44+(p.c>=7?gap:0)+p.jx;const cv=P(t,35.4+p.c*.06+p.d*.25,35.75+p.c*.06+p.d*.25);
    ppl.push({z,X,p,cv});}
  ppl.sort((a,b)=>b.z-a.z);let s='';
  for(const q of ppl){const x=VX+q.X*F/q.z,y=VY+YH/q.z,sc=1.55/q.z;if(y>2050||x<-80||x>1160)continue;
    const fadeFar=C01((8.4-q.z)/1.0);if(fadeFar<=0)continue;const bob=t>38.95?Math.abs(Math.sin(t*6+q.p.d*9))*-6*sc:0;
    const col=q.cv<1?mix('#8FB3A6',q.p.col,q.cv):q.p.col;const k=q.cv>.5?q.p.k:'plain';
    s+=`<g opacity="${fadeFar.toFixed(2)}">${person(x,y+bob,sc,k,col,q.p.acc)}</g>`;}
  $('c5crowd').innerHTML=s;}
function drawC6(t){const u=t-43.5;$('c6mh').setAttribute('transform',`rotate(${u*240} 540 680)`);$('c6hh').setAttribute('transform',`rotate(${u*20} 540 680)`);
  // coins
  let s='';const piles=[JX-90,JX,JX+90];
  for(let n=0;n<27;n++){const tn=46.5+n*0.2;if(t<tn)break;const pile=n%3,lvl=Math.floor(n/3);const yT=1170-lvl*26;const f=eIn(P(t,tn,tn+.32));const y=L(780,yT,f);
    s+=`<g><ellipse cx="${piles[pile]+(lvl%2)*6}" cy="${y+6}" rx="40" ry="13" fill="#B8741F"/><ellipse cx="${piles[pile]+(lvl%2)*6}" cy="${y}" rx="40" ry="13" fill="${COL.amber}"/><ellipse cx="${piles[pile]+(lvl%2)*6}" cy="${y}" rx="26" ry="8" fill="none" stroke="#FFD08A" stroke-width="3"/></g>`;}
  $('c6coins').innerHTML=s;
  $('c6glow').setAttribute('opacity',(eIO(P(t,46.6,48))*(.6+.25*Math.sin(t*3))).toFixed(3));
  const lp=eIO(P(t,47.0,50.0))*.72+eOut(P(t,50.35,51.0))*.28;const line=$('c6line');line.setAttribute('stroke-dashoffset',(1-lp).toFixed(4));
  const pt=line.getPointAtLength(line.getTotalLength()*lp);const dot=$('c6dot');dot.setAttribute('cx',pt.x);dot.setAttribute('cy',pt.y);dot.setAttribute('opacity',lp>0.001?1:0);}
function drawC7(t){$('c7bg').setAttribute('opacity',(1-eIO(P(t,56.2,56.9))).toFixed(3));$('c7tick').setAttribute('stroke-dashoffset',(1-eOut(P(t,55.3,55.75))).toFixed(3));}

// ---------------- SFX ----------------
const SFX=[[1.9,'whoosh'],[3.45,'pop'],[3.7,'pop'],[3.95,'pop'],[4.2,'pop'],[4.55,'highlight'],[5.45,'whoosh'],[5.95,'pop'],[6.3,'pop'],[6.8,'pop'],
 [10.2,'burst'],[10.4,'whoosh'],[10.95,'pop'],[14.6,'whoosh'],[15.25,'pop'],[15.47,'pop'],[15.69,'pop'],[17.8,'highlight'],[18.2,'pop'],
 [22.6,'whoosh'],[22.91,'burst'],[23.15,'pop'],[23.95,'whoosh'],[24.4,'highlight'],[25.7,'pop'],[27.9,'whoosh'],[29.0,'pop'],[29.18,'pop'],[29.36,'pop'],
 [30.45,'whoosh'],[31.25,'highlight'],[32.75,'whoosh'],[33.4,'pop'],[35.55,'highlight'],[35.9,'pop'],[38.6,'pop'],[38.95,'whoosh'],
 [43.5,'whoosh'],[44.4,'burst'],[45.95,'whoosh'],[47.3,'pop'],[50.4,'highlight'],[52.4,'whoosh'],[52.85,'pop'],[55.0,'pop'],[55.35,'highlight'],
 [56.25,'whoosh'],[56.55,'pop'],[59.3,'end']];
window.SFX_CUES=SFX.map(([t,kind])=>({t,kind}));

// ---------------- frame ----------------
const pill=$('pill');let lastCap=null;
const near=(t,a,b)=>t>=a-1.2&&t<=b+1.2;
function draw(t){
  const cam=camAt(t);
  world.setAttribute('transform',`translate(540 960) rotate(${cam.r.toFixed(3)}) scale(${cam.z.toFixed(5)}) translate(${(-cam.x).toFixed(2)} ${(-cam.y).toFixed(2)})`);
  const [c0,c1,c2]=bgAt(t);$('bg0').setAttribute('stop-color',c0);$('bg1').setAttribute('stop-color',c1);$('bg2').setAttribute('stop-color',c2);
  const rc=lerpK(RAYC,t,(a,b,u)=>[L(a[1],b[1],u),L(a[2],b[2],u)]);
  $('rays').setAttribute('opacity',(.045*Math.max(1-P(t,5.35,5.9),P(t,56.2,56.9))).toFixed(4));$('rays').setAttribute('transform',`translate(${rc[0].toFixed(1)} ${rc[1].toFixed(1)}) rotate(${(t*2.2).toFixed(2)})`);
  $('glowc').setAttribute('cx',rc[0]);$('glowc').setAttribute('cy',rc[1]-120);
  if(near(t,0,5.6))drawC1(t);if(near(t,5.5,14.7))drawC2(t);if(near(t,14.6,23))drawC3(t);if(near(t,22.6,33.2))drawC4(t);
  if(near(t,32.7,43.9))drawC5(t);if(near(t,43.4,52.6))drawC6(t);if(near(t,52.3,59.8))drawC7(t);
  applyAnims(t);
  // ballot sweep wipe (teal -> plum)
  const sw=P(t,14.45,15.15);$('hsweep').setAttribute('transform',`translate(0 ${L(2900,-1100,eIO(sw)).toFixed(1)})`);$('hsweep').style.display=sw>0&&sw<1?'':'none';
  // flash through door 40 into the map
  const fl=Math.max(P(t,22.6,22.9)*(t<22.91?1:0),t>=22.91?1-P(t,22.91,23.4):0);$('hflash').setAttribute('opacity',(fl*.95).toFixed(3));
  // captions
  const cap=NAR.find(n=>t>=n.a&&t<n.b);
  if(!cap){pill.style.opacity=0;}else{
    if(cap!==lastCap){pill.textContent=cap.t;pill.style.fontSize='46px';if(pill.scrollWidth>710)pill.style.fontSize=Math.floor(46*700/pill.scrollWidth)+'px';lastCap=cap;}
    const u=C01((t-cap.a)/.16);pill.style.opacity=C01(u*2);pill.style.transform=`translateY(${((1-eOut(u))*14).toFixed(1)}px)`;}
  const sv=P(t,56.55,57.15);$('src').style.opacity=sv.toFixed(3);$('src').style.transform=`translateY(${((1-eOut(sv))*30).toFixed(1)}px)`;
}
const tl=gsap.timeline({paused:true});const clock={t:0};
tl.to(clock,{t:DURATION,duration:DURATION,ease:'none',onUpdate:()=>draw(clock.t)});
window.render=t=>{tl.seek(t,false);draw(t);};window.tl=tl;
draw(0);
