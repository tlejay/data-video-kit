// shared helpers for template cover samples (inlined by build.py)
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function add(parent,html){parent.insertAdjacentHTML('beforeend',html);return parent.lastElementChild;}
function fit(el,maxW){let fs=parseFloat(el.getAttribute('font-size'));for(let i=0;i<80&&el.getBBox().width>maxW;i++){fs*=0.97;el.setAttribute('font-size',fs.toFixed(1));}return el;}
const lerp=(a,b,t)=>a+(b-a)*t;
const f1=v=>(+v).toFixed(1);
// bilinear point in quad q=[TL,TR,BR,BL]
function qpt(q,u,v){const t=[lerp(q[0][0],q[1][0],u),lerp(q[0][1],q[1][1],u)],b=[lerp(q[3][0],q[2][0],u),lerp(q[3][1],q[2][1],u)];return [lerp(t[0],b[0],v),lerp(t[1],b[1],v)];}
function poly(pts,attrs){return `<path d="M${pts.map(p=>f1(p[0])+' '+f1(p[1])).join(' L')} Z" ${attrs||''}/>`;}
// cells of a quad, gap = fraction inset per cell
function quadCells(q,nx,ny,attrsFn,gap){gap=gap==null?.06:gap;let s='';for(let i=0;i<nx;i++)for(let j=0;j<ny;j++){const u0=(i+gap)/nx,u1=(i+1-gap)/nx,v0=(j+gap)/ny,v1=(j+1-gap)/ny;
  s+=poly([qpt(q,u0,v0),qpt(q,u1,v0),qpt(q,u1,v1),qpt(q,u0,v1)],attrsFn(i,j));}return s;}
// sticker strip: 2 rows, items [[label, fn]], cfg {bg, head, label, box}
function drawStrip(st,cfg){add(st,cfg.bg());add(st,cfg.head());const n=cfg.items.length,cols=Math.ceil(n/2),cw=1000/cols;
  cfg.items.forEach(([lab,fn],k)=>{const row=k<cols?0:1,col=row?k-cols:k;const nr=row?n-cols:cols;const off=(1000-nr*cw)/2;
    const cx=40+off+cw*col+cw/2,top=104+row*236,cy=top+92;
    if(cfg.cell)add(st,cfg.cell(cx,top,cw,k));
    const g=add(st,`<g>${fn()}</g>`);fixPills(g);const b=g.getBBox();const bw=cfg.box||[150,136];const kk=Math.min(bw[0]/b.width,bw[1]/b.height,2.2);
    g.setAttribute('transform',`translate(${f1(cx-(b.x+b.width/2)*kk)},${f1(cy-(b.y+b.height/2)*kk)}) scale(${kk.toFixed(4)})`);
    const L=add(st,cfg.label(cx,top+206,lab));});}
// resize every rect.pill to hug the text element right after it
function fixPills(root,padX){root.querySelectorAll('rect.pill').forEach(rc=>{const t=rc.nextElementSibling;if(!t||t.tagName!=='text')return;const b=t.getBBox();const p=padX||parseFloat(rc.getAttribute('height'))*.42;
  rc.setAttribute('x',f1(b.x-p));rc.setAttribute('width',f1(b.width+2*p));});}
