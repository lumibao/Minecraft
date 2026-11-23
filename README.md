# 🌸 MINECRAFT: OUR LITTLE WORLD — 33 Months Together

A playable browser-based 3D voxel anniversary adventure for **Hatsuki & Van**, built with Three.js.
Original voxel assets only — *not* affiliated with Mojang/Microsoft, and no copyrighted Minecraft textures/logos are used.

> "Every world has its own story. This one was built for you… you're still the one I want to build with."

## ▶️ Run it (no backend, no paid service)
Needs internet once (Three.js loads from CDN), then just a static server:

```bash
cd Minecraft
python3 -m http.server 8000
# open http://localhost:8000
```
Or `npx serve .` — or upload the whole folder to any static host (Netlify/GitHub Pages/Vercel).

## 🎮 Controls
| | Desktop | Mobile |
|---|---|---|
| Move | WASD / Arrows | Left joystick |
| Look | Mouse (click world = pointer lock) | Drag right side of screen |
| Interact | **E** | ✋ button |
| Jump / Sprint | Space / Shift | ⬆ button / — |
| Inventory / Achievements | I / 🏆 🎒 buttons | 🎒 button |
| Pause | Esc | ⏸ button |

## 🗺️ The 7 Locations
1. **Our First Spawn** — read the sign (unlocks *The Beginning*)
2. **Garden of 33 Memories** (-62,-58) — collect exactly **33 flowers** (33rd is golden)
3. **Our Little Home** (52,-42) — visit Kitchen, Bedroom, Living Room, Balcony + letter + photo frames
4. **Ocean of Memories** (62,48) — glass tunnel, coral, **5 treasure chests**
5. **Library of Us** (-54,50) — read **33 books**, one chapter per month
6. **Place Beyond the Stars** (0,-88, up the mountain) — the long Taglish love letter (Book & Quill)
7. **Our Forever Coordinates** (0,88) — golden beacon. **Locked** until you: read the Spawn sign, visited all locations, and read the letter. Then: cinematic + finale 💛

Quest tracker (top-left) always shows the next objective + counts. Achievements (8), inventory, and progress **auto-save to LocalStorage** (Continue / Reset in Settings ⚙️).

## ✏️ Personalization Guide (the important part!)
**One folder to edit: `data/`**
- `data/config.js` — names (Hatsuki/Van), skin/shirt colors, anniversary date, main quote, **the full love letter**, promises, day length, audio toggles.
- `data/memories.js` — **all 33 memories** (month, title, date, message). These power BOTH the 33 garden flowers and the 33 library books. Replace every `EDIT ME` placeholder — *never invent real memories; use placeholders until you fill them in.*
- `data/locations.js` — the 5 chest contents (photograph/memory/message/milestone/surprise letter).
- `data/achievements.js` — 8 achievement titles/descriptions.
- Room texts + home letter: search `EDIT ME` in `js/main.js`.

### 📷 Adding photographs
Put real photos in `assets/images/`, then in `js/world.js` search `photo-` (frames inside Our Little Home) and point a frame at your file / edit its caption in `js/main.js` (`it.type=='photo'`).

### 🎵 Replacing audio
Drop `music.mp3` into `assets/audio/` (original/licensed only) — see `assets/audio/README.txt`. Missing files fall back to the built-in gentle synth. Music never autoplays with sound before Start.

## 📁 Structure
```
index.html
css/  style.css · game-ui.css · menus.css
js/   main.js · world.js · player.js · controls.js · interactions.js
      inventory.js · achievements.js · dialogue.js · audio.js · save-system.js
data/ config.js · memories.js · locations.js · achievements.js
assets/ textures/ characters/ images/ audio/ fonts/  (original assets, READMEs inside)
```

## ✅ Verified
All JS syntax-checked; 33 flowers, 33 books, 5 chests, 7 locations, 8 achievements wired; save/load, day/night cycle, mobile joystick + look-drag, graphics quality setting, beacon gating + finale cinematic.

**Happy 33rd Monthsary, Baby. YOU ARE MY FAVORITE WORLD. 💛**

---

## 🎬 Also in this repo: OUR LITTLE OVERWORLD (new — cinematic website)
A separate, non-game anniversary website lives in [`our-little-overworld/`](our-little-overworld/) — CSS-voxel mobs, 33 tappable Cherry-Grove month blocks, a 4-page enchanted-book letter, three cinematic Taglish scenes about her, portal → golden beacon finale, and a ⛶ Maximize/Cinema mode. See `our-little-overworld/README.md`. The playable 3D game above remains untouched. Open `our-little-overworld/index.html` to view.
