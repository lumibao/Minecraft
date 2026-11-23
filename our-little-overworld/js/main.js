import { CONFIG } from './config.js';
import { initWorld, runLoader } from './world.js';
import { initPetals } from './particles.js';
import { initReveals, animateCounter, typewriter } from './animations.js';
import { initMobs } from './mobs.js';
import { initGrove, initHome, initLetter, initPortalAndBeacon, initMaximize } from './interactions.js';
import { startIntro } from './cinema.js';
import { initBeacon3D } from './cinema3d.js';

document.title = `${CONFIG.project} — ${CONFIG.milestone}`;
window.__siteBooted = true;

// Loader FIRST: even if a later init ever fails, she will never be
// stuck staring at "GENERATING OUR WORLD..." again.
runLoader(() => { try { startIntro(); } catch (e) { document.getElementById('intro')?.remove(); } });

try { initWorld(); } catch (e) { console.warn(e); }
try { initPetals(); initMobs(); initGrove(); initHome(); initLetter(); initPortalAndBeacon(); initMaximize(); } catch (e) { console.warn(e); }
try { initBeacon3D(); } catch (e) { console.warn(e); }
try {
  initReveals(() => { animateCounter(document.getElementById('count33'), CONFIG.months); typewriter(document.getElementById('spawn-type'), 'Thirty-three months of learning, growing, understanding, and choosing each other.'); });
} catch (e) { console.warn(e); }

// ENTER = hard-coded MAXIMIZE (fullscreen + cinema bars) THEN scroll.
// This is a website: scroll + tap only. No movement, no gameplay controls.
document.getElementById('enter-btn').addEventListener('click', async e => {
  import('./particles.js').then(m => m.burst(e.clientX, e.clientY));
  await window.__hardMaximize(true);
  document.getElementById('spawn').scrollIntoView({ behavior: 'smooth' });
});
