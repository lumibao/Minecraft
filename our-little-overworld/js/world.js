// World dressing: clouds, stars in End, loader sequence (brief & controlled)
import { loaderStars } from './particles.js';
export function initWorld() {
  loaderStars();
  document.querySelectorAll('.clouds').forEach(w => { for (let i = 0; i < 5; i++) { const c = document.createElement('div'); c.className = 'cloud'; c.style.cssText = `top:${4 + Math.random() * 22}%;width:${60 + Math.random() * 70}px;animation-duration:${55 + Math.random() * 50}s;animation-delay:-${Math.random() * 60}s`; w.appendChild(c); } });
  const end = document.getElementById('end');
  for (let i = 0; i < 60; i++) { const s = document.createElement('span'); s.className = 'star'; const z = 2 + Math.random() * 3; s.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 60}%;width:${z}px;height:${z}px;animation-delay:${Math.random() * 2}s`; end.appendChild(s); }
}
const LOAD_LINES = ["Placing 33 months of memories...", "Growing a little garden...", "Preparing something special for you..."];
export function runLoader(onDone) {
  const fill = document.getElementById('loadfill'), txt = document.getElementById('loadtext'); let p = 0;
  const iv = setInterval(() => { p = Math.min(100, p + 4 + Math.random() * 7); fill.style.width = p + '%'; txt.textContent = LOAD_LINES[Math.min(2, Math.floor(p / 36))];
    if (p >= 100) { clearInterval(iv); setTimeout(() => { document.getElementById('loader').classList.add('done'); onDone?.(); }, 350); } }, 110);
}
