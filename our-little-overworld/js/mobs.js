import { MOB_MESSAGES } from './memories.js';
import { burst } from './particles.js';
import { popup } from './effects.js';
const NAMES = { allay: 'Allay', bee: 'Bee', wolf: 'Wolf', slime: 'Slime', enderman: 'Tall Friend', creeper: 'Friendly Creeper' };
export function initMobs() {
  document.querySelectorAll('.mob').forEach(m => {
    const act = e => { const k = m.dataset.mob; const r = m.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + 40, k === 'enderman' ? ['#c77dff', '#503A79', '#fff'] : undefined); popup(`${m.querySelector('h3').textContent}`, MOB_MESSAGES[k]); };
    m.addEventListener('click', act);
    m.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(e); } });
  });
}
export { NAMES };
