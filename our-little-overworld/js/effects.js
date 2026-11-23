let lastFocus = null;
export function popup(title, body, extra = '') {
  closePopup(); lastFocus = document.activeElement;
  const d = document.createElement('div'); d.className = 'popup'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-label', title);
  d.innerHTML = `<div class="box"><h3 class="pixel" style="color:#FFC96B">${title}</h3><p>${body}</p>${extra}<button class="mc-btn green" style="width:100%">✔ CLOSE</button></div>`;
  document.body.appendChild(d);
  const btn = d.querySelector('button'); btn.focus();
  btn.onclick = closePopup; d.addEventListener('click', e => { if (e.target === d) closePopup(); });
  d.addEventListener('keydown', e => { if (e.key === 'Escape') closePopup(); });
}
export function closePopup() { document.querySelector('.popup')?.remove(); lastFocus?.focus?.(); }
export function toast(msg, ms = 4200) { const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), ms); }
