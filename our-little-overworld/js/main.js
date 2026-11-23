import { CONFIG } from './config.js';
import { initWorld, runLoader } from './world.js';
import { initPetals } from './particles.js';
import { initReveals, animateCounter, typewriter } from './animations.js';
import { initMobs } from './mobs.js';
import { initGrove, initHome, initLetter, initPortalAndBeacon, initMaximize } from './interactions.js';
import { startIntro } from './cinema.js';

document.title = `${CONFIG.project} — ${CONFIG.milestone}`;
initWorld(); initPetals(); initMobs(); initGrove(); initHome(); initLetter(); initPortalAndBeacon(); initMaximize(); initBeacon3D();
initReveals(() => { animateCounter(document.getElementById('count33'), CONFIG.months); typewriter(document.getElementById('spawn-type'), 'Thirty-three months of learning, growing, understanding, and choosing each other.'); });
// ENTER = hard-coded MAXIMIZE (fullscreen + cinema bars) THEN scroll.
// This is a website: scroll + tap only. No movement, no gameplay controls.
document.getElementById('enter-btn').addEventListener('click', async e => {
  import('./particles.js').then(m => m.burst(e.clientX, e.clientY));
  await window.__hardMaximize(true);
  document.getElementById('spawn').scrollIntoView({ behavior: 'smooth' });
});
runLoader();
