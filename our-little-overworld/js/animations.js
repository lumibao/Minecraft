export function initReveals(onSpawnVisible) {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); if (e.target.id === 'spawn-card') onSpawnVisible?.(); io.unobserve(e.target); } }), { threshold: .18 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  // nav progress
  const bar = document.getElementById('progress');
  addEventListener('scroll', () => { const h = document.documentElement; bar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + '%'; highlightNav(); }, { passive: true });
  function highlightNav() { let cur = 'home'; document.querySelectorAll('section[id]').forEach(s => { if (s.getBoundingClientRect().top < innerHeight / 2) cur = s.id; }); document.querySelectorAll('nav a').forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + cur)); }
}
export function animateCounter(el, to = 33, dur = 1600) {
  if (el.dataset.done) return; el.dataset.done = 1; const t0 = performance.now();
  (function tick(t) { const p = Math.min(1, (t - t0) / dur); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(tick); })(t0);
}
export function typewriter(el, text, speed = 26) {
  if (!el || el.dataset.done) return; el.dataset.done = 1; let i = 0;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = text; return; }
  (function next() { el.textContent = text.slice(0, ++i); if (i < text.length) setTimeout(next, speed); })();
}
