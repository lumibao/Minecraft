// Cinematic intro director — captions + lifecycle around the real 3D film.
import { startCinema3D } from './cinema3d.js';
const LINES = [
  "Every generated world starts empty…",
  "…until two players spawn in it.",
  "Hatsuki. Van. Same world. Same story.",
  "Some worlds are generated. This one was built — for you, Baby.",
  "Side by side. That will always be my favorite coordinate.",
  "33 months in… and I would still press START on us, every single time.",
];
export function startIntro() {
  const intro = document.getElementById('intro'); if (!intro) return;
  if (intro.dataset.played) return; intro.dataset.played = 1;
  document.body.classList.add('cinema-playing');
  const line = document.getElementById('intro-line');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let stop3D = () => {};
  try { stop3D = startCinema3D(p => { if (LINES[p + 1]) line.textContent = LINES[p + 1]; }) || (() => {}); }
  catch (e) { /* WebGL unavailable → captions still tell the story */ }
  let i = 0; line.textContent = LINES[0];
  const iv = setInterval(() => { i = Math.min(LINES.length - 1, i + 1); line.textContent = LINES[i]; }, reduced ? 400 : 2300);
  const end = () => { clearInterval(iv); stop3D(); document.body.classList.remove('cinema-playing'); intro.classList.add('gone'); setTimeout(() => intro.remove(), 1100); };
  document.getElementById('skip-intro').addEventListener('click', end);
  setTimeout(end, reduced ? 1800 : 14200);
}
