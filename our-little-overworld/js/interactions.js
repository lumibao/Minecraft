import { MESSAGES, CHAPTERS } from './memories.js';
import { LETTER_PAGES, HOME_MESSAGES } from './letter.js';
import { CONFIG } from './config.js';
import { popup, toast } from './effects.js';
import { burst } from './particles.js';

export function initGrove() {
  const grid = document.getElementById('grove-grid'); const found = new Set();
  CHAPTERS.forEach(ch => {
    const h = document.createElement('h3'); h.className = 'chapter pixel'; h.textContent = `${ch.title} · ${ch.range}`; h.style.gridColumn = '1/-1'; grid.appendChild(h);
    MESSAGES.forEach((m, i) => { if (Math.ceil((i + 1) / 11) !== ch.id) return;
      const b = document.createElement('button'); b.className = 'blk c' + ch.id; b.textContent = i + 1; b.setAttribute('aria-label', `Open month ${i + 1} message`);
      b.onclick = e => { found.add(i + 1); b.classList.add('found'); burst(e.clientX, e.clientY); popup(`🌸 MONTH ${i + 1} / 33`, m, `<p style="opacity:.8">Month ${i + 1} of our 33 — tap another blossom block whenever you're ready 🌸</p>`); const bf=document.getElementById('blossom-fill'), bt=document.getElementById('blossom-text'); if(bf) bf.style.width=(found.size/33*100)+'%'; if(bt) bt.textContent=found.size+' / 33 blossoms opened';
        if (found.size === 33) setTimeout(() => { document.getElementById('grove-heart').classList.add('show'); toast('💛 33 BLOCKS. 33 CHAPTERS. AND STILL, MY FAVORITE PERSON.'); }, 600); }; // scroll-and-tap only — no gameplay
      grid.appendChild(b); });
  });
}
export function initHome() {
  document.getElementById('hs-sign').onclick = e => { burst(e.clientX, e.clientY); popup('🪧 THE WOODEN SIGN', HOME_MESSAGES.sign); };
  document.getElementById('hs-book').onclick = e => { burst(e.clientX, e.clientY, ['#c77dff', '#FFC96B', '#fff']); popup('✨ THE ENCHANTED BOOK', HOME_MESSAGES.book); };
  document.getElementById('hs-lantern').onclick = e => { document.body.classList.add('lantern-glow'); burst(e.clientX, e.clientY, ['#FFC96B', '#fff2b0', '#fff']); popup('🏮 THE LANTERN', HOME_MESSAGES.lantern); setTimeout(() => document.body.classList.remove('lantern-glow'), 3800); };
}
export function initRooms() {
  const lines = {
    Kitchen: '🍳 THE KITCHEN — Nothing fancy. Just the promise that in this home, you will always be fed, listened to, and laughed with. Kahit instant noodles pa yan, basta magkasama.',
    Bedroom: '🛏️ THE BEDROOM — Our respawn point. Kahit anong mangyari sa labas, dito tayo bumabalik, dito tayo nagre-restart nang magkasama.',
    Balcony: '☕ THE BALCONY — For slow mornings and honest talks about the future. Lahat ng plano, dito nagsisimula — kasama ka sa bawat isa.',
  };
  document.querySelectorAll('.room-card').forEach(c => c.addEventListener('click', e => { burst(e.clientX, e.clientY, ['#FFC96B', '#ffb7d1', '#fff']); popup(c.querySelector('b').textContent.toUpperCase(), lines[c.dataset.room] || ''); }));
}
export function initLetter() {
  let page = 0; const el = document.getElementById('letter-pages');
  window.__openLetter = () => { page = 0; render(); document.getElementById('letter-reader').scrollIntoView({ behavior: 'smooth', block: 'center' }); };
  function render() { el.innerHTML = `<div class="book-page"><p>${LETTER_PAGES[page].replace(/\n/g, '<br>')}</p></div><div class="pager"><button class="mc-btn" id="pg-prev" ${page === 0 ? 'disabled style="opacity:.4"' : ''}>◀ PREV PAGE</button><span style="align-self:center">Page ${page + 1} / ${LETTER_PAGES.length}</span><button class="mc-btn green" id="pg-next">${page === LETTER_PAGES.length - 1 ? '💛 FIN ♥' : 'NEXT PAGE ▶'}</button></div>`;
    const pv = document.getElementById('pg-prev'), nx = document.getElementById('pg-next');
    if (pv) pv.onclick = () => { page--; render(); };
    nx.onclick = () => { if (page < LETTER_PAGES.length - 1) { page++; render(); } else toast('💛 End of letter. Happy 33rd, Baby.'); };
  }
  const bk = document.getElementById('book-open');
  bk.addEventListener('click', () => window.__openLetter());
  bk.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); window.__openLetter(); } });
  const pt = document.getElementById('portal'), bc = document.getElementById('beacon');
  [pt, bc].forEach(el => el && el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click(); } }));
  el.innerHTML = `<p class="lead">Tap the enchanted book above to open your letter. Take your time — walang timer dito. 💛</p>`;
}
export function initPortalAndBeacon() {
  document.getElementById('portal').addEventListener('click', e => { burst(e.clientX, e.clientY, ['#c77dff', '#7b4dff', '#fff']); toast('🌀 Through the hard chapters… and out the other side, together.'); setTimeout(() => document.getElementById('end').scrollIntoView({ behavior: 'smooth' }), 900); });
  document.getElementById('beacon').addEventListener('click', e => { burst(innerWidth / 2, innerHeight / 3, ['#FFC96B', '#ffd97a', '#fff']); document.getElementById('final-msg').classList.add('in'); popup('💛 THE GOLDEN BEACON', `<b class="pixel" style="color:#FFC96B;font-size:19px">33 MONTHS, AND I'M STILL CHOOSING YOU.</b><br><br>Thank you for being my favorite part of this world. I hope we get to build countless more chapters together.<br><br><span class="pixel" style="font-size:20px">${CONFIG.finalGreeting}</span><br><i>ONE WORLD. TWO HEARTS. THIRTY-THREE MONTHS.</i>`); });
  document.getElementById('secret-star').addEventListener('click', e => { burst(e.clientX, e.clientY, ['#ffd97a', '#fff', '#F4B7CB']); popup('⭐ A SECRET BLOCK', CONFIG.secretMessage); });
}
export function initMaximize() {
  const btn = document.getElementById('max-btn');
  // HARD-CODED MAXIMIZE — forces fullscreen + cinema letterbox in code, not just a label.
  window.__hardMaximize = async (on = true) => {
    document.body.classList.toggle('cinema', on);
    btn.textContent = on ? '⛶ EXIT CINEMA' : '⛶ MAXIMIZE';
    try {
      if (on && !document.fullscreenElement) await document.documentElement.requestFullscreen();
      if (!on && document.fullscreenElement) await document.exitFullscreen();
    } catch (e) { /* browsers require a tap/click first; cinema bars still apply */ }
    if (on) toast('🎬 Maximize ON — scroll lang, tap-tap lang, enjoy Baby 💛');
  };
  btn.onclick = () => window.__hardMaximize(!document.body.classList.contains('cinema'));
  document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement) { document.body.classList.remove('cinema'); btn.textContent = '⛶ MAXIMIZE'; } });
}
