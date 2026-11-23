# 🌸 OUR LITTLE OVERWORLD — 33 Months, A Love Story Built Block by Block

A cinematic, scrolling, Minecraft-inspired anniversary **website** (not a game) for **Hatsuki & Van**.
**Zero images, zero photos, zero external assets** — every visual is HTML/CSS/JS voxel art. Pure vanilla, no frameworks, no backend.

## ▶️ Run it
Just open `index.html` in any browser — or:
```bash
cd our-little-overworld
python3 -m http.server 8000   # then open http://localhost:8000
```

## 🎬 Maximize / Cinema Mode (the best way to give it)
Press **⛶ MAXIMIZE** in the top nav (or give it to her already fullscreen). It enters real fullscreen + cinematic letterbox bars. Same button (or exiting fullscreen) leaves cinema mode. Mobile-friendly — she'll mostly open this on her phone, and the layout, mobs, cottage, beacon and popups are all intentionally designed for small screens, not shrunk desktop.

## 🗺️ What's inside
Loading screen ("Generating Our World…" with a real progress sequence) → sunset Overworld hero → **Spawn Point** with animated 0→33 counter → **Cherry Grove**: exactly **33 tappable month-blocks** in 3 chapters (1–11 / 12–22 / 23–33), heart reveal at 33/33 → **Our Little Mobs**: 6 hand-built CSS voxel mobs (Allay, Bee, Wolf, Slime, friendly Enderman & Creeper), each animated differently, each with its own tap message → **🎬 Scenes I'd Replay**: three honest, cinematic Taglish vignettes (Morning / Rainy Day / Sunset) about her — written human, not a highlight reel → **Our Little Home**: CSS cottage (smoke, glowing windows) with sign/book/lantern interactions → **Enchanted Book**: 4-page letter with page-turning → **Portal** transition → **End dimension golden beacon** finale: *33 MONTHS, AND I'M STILL CHOOSING YOU.* Plus: floating nav + scroll progress, cherry-petal particles, secret ★ (bottom-right), `prefers-reduced-motion` support, full keyboard access (Tab/Enter/Space/Esc).

## ✏️ Personalization (edit these, nothing else needs touching)
| What | File |
|---|---|
| Names, date, hero line, secret message, final greeting | `js/config.js` |
| **All 33 month messages** | `js/memories.js` → `MESSAGES` (keep 33 entries! grouped in 3 chapters automatically) |
| Mob tap-messages | `js/memories.js` → `MOB_MESSAGES` |
| **The love letter (4 pages)** | `js/letter.js` → `LETTER_PAGES` |
| Home sign / book / lantern texts | `js/letter.js` → `HOME_MESSAGES` |
| The 3 cinematic scenes | `index.html` — search `SCENE 01` |

Placeholders say `[EDIT ME]`. Never invent real memories — replace placeholders with true, small, specific things. That's what makes it not sound like AI.

## 📁 Structure
```
index.html
css/ main.css world.css mobs.css animations.css sections.css interactions.css responsive.css
js/  config.js memories.js letter.js main.js world.js particles.js animations.js mobs.js interactions.js effects.js
```

*Original fan-made tribute aesthetic. Not affiliated with Mojang/Microsoft; no copyrighted assets used.*
**ONE WORLD. TWO HEARTS. THIRTY-THREE MONTHS. 💛**

## Update — scroll & tap ONLY + hard-coded Maximize
This is a website, not a game: there are **no movement controls, no joystick, no WASD, nothing to "play"** — you scroll, and you tap/click things (blossom blocks, mobs, cottage, book, portal, beacon). The repo root `index.html` now opens THIS website directly (the old 3D prototype moved to `game.html` so it can't be opened by accident).
**Maximize is hard-coded, not just a word:** the `window.__hardMaximize()` function in `js/interactions.js` forces real fullscreen + cinema letterbox bars in code, and pressing **ENTER OUR WORLD** calls it automatically before scrolling (`js/main.js`). The ⛶ MAXIMIZE nav button calls the same function. (Browsers require one tap/click before fullscreen is allowed — that's why it triggers on ENTER.)

## Update — cinematic intro, tap-jump fix, no placeholders
- **Cinematic intro (hard-coded CSS 3D):** after the loader, Hatsuki and Van voxel players (cube heads with front/side/top faces, swinging arms/legs, nametags) walk in from opposite sides of a sunset stage, meet in the middle, a heart appears, and four caption lines play. Skippable, reduced-motion aware. Code: `css/cinema.css` + `js/cinema.js`.
- **Tap-jump fixed:** popups no longer steal scroll position — focus uses `preventScroll` and closing a popup restores focus without moving the page (`js/effects.js`); hover lifts are disabled on touch devices.
- **No "EDIT ME" text anywhere on the visible site** — all copy reads as finished writing.
- Professional polish pass in `css/cinema.css`: softer shadows, balanced headings, touch-safe active states.
