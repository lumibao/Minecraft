const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
export function initPetals() {
  if (reduced) return;
  const w = document.getElementById('petals'); const n = innerWidth < 640 ? 14 : 26;
  for (let i = 0; i < n; i++) { const p = document.createElement('span'); p.className = 'petal'; p.style.left = Math.random() * 100 + 'vw'; p.style.animationDuration = 7 + Math.random() * 8 + 's'; p.style.animationDelay = -Math.random() * 10 + 's'; p.style.transform = `scale(${.6 + Math.random()})`; w.appendChild(p); }
}
export function burst(x, y, colors = ['#F4B7CB', '#FFC96B', '#fff']) {
  if (reduced) return;
  for (let i = 0; i < 16; i++) { const s = document.createElement('span'); s.className = 'spark'; s.style.background = colors[i % colors.length]; s.style.left = x + 'px'; s.style.top = y + 'px'; document.body.appendChild(s);
    const a = Math.random() * Math.PI * 2, d = 40 + Math.random() * 80;
    s.animate([{ transform: 'translate(0,0)', opacity: 1 }, { transform: `translate(${Math.cos(a) * d}px,${Math.sin(a) * d - 30}px) rotate(180deg)`, opacity: 0 }], { duration: 750, easing: 'cubic-bezier(.22,1,.36,1)' }).onfinish = () => s.remove(); }
}
export function loaderStars() { const l = document.getElementById('loader'); for (let i = 0; i < 40; i++) { const s = document.createElement('span'); s.className = 'star'; const z = 2 + Math.random() * 3; s.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 70}%;width:${z}px;height:${z}px;animation-delay:${Math.random() * 2}s`; l.appendChild(s); } }
