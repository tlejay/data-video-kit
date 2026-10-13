// ===== per-scene backgrounds (world space, carried by the camera) =====
const BX0=-110,BX1=1190,BY0=-240,BY1=2160;
const wa=(o)=>`rgba(255,255,255,${o})`;
// s2: oversized ledger page + calendar grid on a desk, slightly isometric
function BG2(){let s=`<rect x="${BX0}" y="${BY0}" width="${BX1-BX0}" height="${BY1-BY0}" fill="#0A2E30"/>`;
  s+=`<g transform="translate(540 700) rotate(-7) skewX(-10) translate(-540 -700)">`;
  s+=`<rect x="-60" y="120" width="860" height="1200" rx="18" fill="#174F52"/><rect x="-60" y="120" width="860" height="1200" rx="18" fill="none" stroke="${wa(.18)}" stroke-width="4"/>`;
  for(let y=230;y<1300;y+=54)s+=`<path d="M-40 ${y} L780 ${y}" stroke="${wa(.11)}" stroke-width="3"/>`;
  s+=`<path d="M70 130 L70 1310" stroke="${COL.amber}" stroke-opacity=".35" stroke-width="4"/>`;
  for(let i=0;i<9;i++){const y=284+i*108;s+=`<rect x="100" y="${y-30}" width="30" height="30" rx="5" fill="none" stroke="${wa(.16)}" stroke-width="3"/><rect x="150" y="${y-22}" width="${260+((i*97)%240)}" height="12" rx="6" fill="${wa(.08)}"/>`;}
  // calendar sheet
  s+=`<rect x="640" y="380" width="620" height="640" rx="18" fill="#0F3E41" stroke="${wa(.16)}" stroke-width="4"/><rect x="640" y="380" width="620" height="96" rx="18" fill="#E2574C" fill-opacity=".45"/>`;
  for(let r=0;r<5;r++)for(let c=0;c<7;c++){s+=`<rect x="${662+c*84}" y="${500+r*100}" width="70" height="84" rx="8" fill="${(r*7+c)%9===4?'rgba(242,163,58,.28)':wa(.06)}"/>`;}
  s+=`</g>`;
  // desk edge shadow
  s+=`<rect x="${BX0}" y="${BY0}" width="${BX1-BX0}" height="${BY1-BY0}" fill="url(#vig)"/>`;return s;}
// s3: hall / corridor with floor tiles and tall columns, door light spilling on the floor
function BG3(){const VX=540,VY=760;let s=`<rect x="${BX0}" y="${BY0}" width="${BX1-BX0}" height="${BY1-BY0}" fill="#1A1033"/>`;
  s+=`<rect x="160" y="300" width="760" height="860" fill="#2B1D4A"/>`; // back wall
  for(let i=0;i<9;i++){const x=160+i*95;s+=`<path d="M${x} 300 L${x} 1160" stroke="${wa(.05)}" stroke-width="3"/>`;}
  // ceiling beams
  for(let k=0;k<6;k++){const f=Math.pow(k/6,1.6);const y=L(300,BY0,f);s+=`<path d="M${L(160,BX0,f)} ${y} L${L(920,BX1,f)} ${y}" stroke="${wa(.06)}" stroke-width="${2+k}"/>`;}
  // floor tiles
  s+=`<path d="M160 1160 L920 1160 L${BX1+400} ${BY1} L${BX0-400} ${BY1} Z" fill="#120A26"/>`;
  for(let i=-12;i<=12;i++){const xb=540+i*150;s+=`<path d="M${L(160,920,(i+12)/24)} 1160 L${VX+(xb-VX)*3.2} ${BY1}" stroke="${wa(.09)}" stroke-width="2.5"/>`;}
  for(let k=1;k<14;k++){const y=1160+Math.pow(k,1.75)*9;s+=`<path d="M${BX0-400} ${y} L${BX1+400} ${y}" stroke="${wa(.08)}" stroke-width="2.5"/>`;}
  // columns (left + right, receding)
  [[-60,1.0],[60,0.78],[118,0.62]].forEach(([x,sc])=>{const w=110*sc,top=300-260*sc,bot=1160+300*sc;
    s+=`<rect x="${x}" y="${top}" width="${w}" height="${bot-top}" fill="#3A2868"/><rect x="${x+w*.68}" y="${top}" width="${w*.32}" height="${bot-top}" fill="#24184A"/>`;
    const xr=1080-x-w;s+=`<rect x="${xr}" y="${top}" width="${w}" height="${bot-top}" fill="#3A2868"/><rect x="${xr}" y="${top}" width="${w*.32}" height="${bot-top}" fill="#24184A"/>`;});
  s+=`<path id="c3spill" d="M745 1160 L895 1160 L1100 1700 L560 1700 Z" fill="url(#spill)" opacity="0"/>`;
  return s;}
// s4: topographic contours + map grid around the map
function BG4(){let s=`<rect x="${BX0}" y="${BY0}" width="${BX1-BX0}" height="${BY1-BY0}" fill="#2A170A"/>`;
  for(let x=-100;x<=1200;x+=90)s+=`<path d="M${x} ${BY0} L${x} ${BY1}" stroke="${wa(.06)}" stroke-width="2"/>`;
  for(let y=-200;y<=2150;y+=90)s+=`<path d="M${BX0} ${y} L${BX1} ${y}" stroke="${wa(.06)}" stroke-width="2"/>`;
  const cx=MO[0]+KOR[0],cy=MO[1]+KOR[1];const r=rng(7);const ph=[r()*6,r()*6,r()*6];
  for(let k=1;k<26;k++){const R0=k*58;let d='';for(let a=0;a<=72;a++){const th=a/72*Math.PI*2;const rr=R0*(1+.09*Math.sin(3*th+ph[0]+k*.3)+.06*Math.sin(5*th+ph[1])+.04*Math.sin(7*th+ph[2]-k*.2));
    d+=(a?'L':'M')+(cx+rr*Math.cos(th)).toFixed(1)+' '+(cy+rr*Math.sin(th)*1.1).toFixed(1);}
    s+=`<path d="${d}Z" fill="none" stroke="${k%5?wa(.13):'rgba(242,163,58,.38)'}" stroke-width="${k%5?2:3}"/>`;}
  s+=`<rect x="${BX0}" y="${BY0}" width="${BX1-BX0}" height="${BY1-BY0}" fill="url(#vig)"/>`;
  return s;}
// s5: halftone dot field + giant soft 7/10 behind the crowd, horizon line
function BG5(){let s=`<rect x="${BX0}" y="${BY0}" width="${BX1-BX0}" height="${BY1-BY0}" fill="#0B2A1F"/>`;
  for(let y=-200;y<640;y+=34)for(let x=-100;x<1200;x+=34){const dd=Math.hypot(x-540,(y-640)*1.6);const rr=Math.max(0,9-dd/80);if(rr<.7)continue;
    s+=`<circle cx="${x+((y/34)%2?17:0)}" cy="${y}" r="${rr.toFixed(1)}" fill="${COL.amber}" opacity=".42"/>`;}
  s+=`<rect x="${BX0}" y="640" width="${BX1-BX0}" height="${BY1-640}" fill="#0E3527"/>`;
  for(let y=660;y<2150;y+=38)for(let x=-100;x<1200;x+=38){const dd=Math.hypot(x-540,(y-640)*1.2);const rr=Math.max(0,8-dd/200);if(rr<.6)continue;s+=`<circle cx="${x+((y/38)%2?19:0)}" cy="${y}" r="${rr.toFixed(1)}" fill="#fff" opacity=".09"/>`;}
  s+=`<text x="540" y="636" font-size="520" font-weight="800" fill="${COL.amber}" opacity=".16" text-anchor="middle" filter="url(#blur8)">7/10</text>`;
  s+=`<path d="M${BX0} 640 L${BX1} 640" stroke="${COL.amber}" stroke-opacity=".6" stroke-width="3"/>`;return s;}
// s6: blueprint / graph paper, clock tick ring, faint chart
function BG6(){const W=2600;let s=`<rect x="${BX0}" y="${BY0}" width="${W}" height="${BY1-BY0}" fill="#141A46"/>`;
  for(let x=-100;x<W;x+=30)s+=`<path d="M${x} ${BY0} L${x} ${BY1}" stroke="${wa(x%150===50?.10:.04)}" stroke-width="${x%150===50?2.5:1.5}"/>`;
  for(let y=-230;y<BY1;y+=30)s+=`<path d="M${BX0} ${y} L${W} ${y}" stroke="${wa(y%150===70?.10:.04)}" stroke-width="${y%150===70?2.5:1.5}"/>`;
  for(let i=0;i<60;i++){const a=i*6;s+=`<rect x="537" y="${900-560}" width="${i%5?6:12}" height="${i%5?30:70}" fill="${wa(i%5?.12:.22)}" transform="rotate(${a} 540 900)"/>`;}
  s+=`<circle cx="540" cy="900" r="470" fill="none" stroke="${wa(.08)}" stroke-width="3"/>`;
  let d='M-100 1450';for(let x=-100;x<=W;x+=60){d+=` L${x} ${1450-x*.12-40*Math.sin(x/170)}`;}s+=`<path d="${d}" fill="none" stroke="${wa(.12)}" stroke-width="4" stroke-dasharray="14 10"/>`;
  return s;}
// s7: bold diagonal stripes + tiled tilted ballots
function BG7(){let s=`<g id="c7bg"><rect x="${BX0}" y="${BY0}" width="${BX1-BX0}" height="${BY1-BY0}" fill="#0E1A33"/>`;
  s+=`<g transform="rotate(-28 540 960)">`;for(let i=-14;i<16;i++)s+=`<rect x="${i*160}" y="-900" width="80" height="3800" fill="#1A2C52"/>`;s+=`</g>`;
  for(let r=0;r<8;r++)for(let c=0;c<5;c++){const x=-40+c*270+(r%2)*135,y=-120+r*300;s+=ballot(x,y,110,-28,COL.amber,.10);}
  return s+`</g>`;}
function CLIPBG(id,svg,w){w=w||(BX1-BX0);return `<clipPath id="${id}"><rect x="${BX0}" y="${BY0}" width="${w}" height="${BY1-BY0}"/></clipPath><g clip-path="url(#${id})">${svg}</g>`;}
