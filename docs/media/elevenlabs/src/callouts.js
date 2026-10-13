// Draw a ring around each [data-for] target and an arrow from its callout to it.
// <div class="co" data-for="target-id" style="left:..;top:..">...</div>
window.addEventListener('load', async () => {
  await document.fonts.ready;
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.id = 'arrows'; svg.setAttribute('width', document.body.scrollWidth); svg.setAttribute('height', document.body.scrollHeight);
  svg.innerHTML = '<defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#F2A33A"/></marker></defs>';
  document.body.appendChild(svg);
  const box = el => { const r = el.getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height }; };
  for (const co of document.querySelectorAll('.co[data-for]')) {
    const t = document.getElementById(co.dataset.for); if (!t) continue;
    const b = box(t), pad = 5;
    const ring = document.createElement('div'); ring.className = 'ring';
    Object.assign(ring.style, { left: (b.x - pad) + 'px', top: (b.y - pad) + 'px', width: (b.w + 2 * pad) + 'px', height: (b.h + 2 * pad) + 'px' });
    document.body.appendChild(ring);
    const c = box(co);
    const cx = c.x + c.w / 2, cy = c.y + c.h / 2, tx = b.x + b.w / 2, ty = b.y + b.h / 2;
    // start on the callout edge facing the target, end just outside the ring
    const sx = Math.abs(tx - cx) > Math.abs(ty - cy) * (c.w / c.h) ? (tx > cx ? c.x + c.w : c.x) : cx;
    const sy = sx === cx ? (ty > cy ? c.y + c.h : c.y) : cy;
    const ex = tx > b.x + b.w + pad ? tx : (sx < b.x ? b.x - pad - 4 : sx > b.x + b.w ? b.x + b.w + pad + 4 : tx);
    const ey = (ex === tx) ? (sy < b.y ? b.y - pad - 4 : b.y + b.h + pad + 4) : ty;
    const mx = (sx + ex) / 2, my = (sy + ey) / 2 - 18;
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', `M${sx} ${sy} Q${mx} ${my} ${ex} ${ey}`);
    p.setAttribute('fill', 'none'); p.setAttribute('stroke', '#F2A33A'); p.setAttribute('stroke-width', '3.5');
    p.setAttribute('stroke-linecap', 'round'); p.setAttribute('marker-end', 'url(#ah)');
    svg.appendChild(p);
  }
  window.READY = 1;
});
