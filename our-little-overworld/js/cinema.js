// Cinematic intro timeline — Hatsuki & Van walk into the same world.
const LINES = [
  "Every generated world starts empty…",
  "…until two players spawn in it.",
  "Hatsuki. Van. Same world. Same story.",
  "Some worlds are generated. This one was built — for you, Baby.",
];
export function startIntro() {
  const intro = document.getElementById('intro'); if (!intro) return;
  const line = document.getElementById('intro-line'); const heart = document.getElementById('intro-heart');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let i = 0; line.textContent = LINES[0];
  const iv = setInterval(() => { i++; if (i < LINES.length) line.textContent = LINES[i]; if (i === 2) heart.classList.add('show'); }, reduced ? 300 : 2100);
  const end = () => { clearInterval(iv); intro.classList.add('gone'); setTimeout(() => intro.remove(), 1100); };
  document.getElementById('skip-intro').addEventListener('click', end);
  setTimeout(end, reduced ? 1400 : 8800);
}
