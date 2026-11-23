// ============================================================
//  OUR LITTLE WORLD — PERSONALIZATION CONFIG
//  Edit this ONE file to make the game yours.
//  Every name, date, letter and message lives here / in memories.js
// ============================================================

export const CONFIG = {
  gameTitle: "MINECRAFT: OUR LITTLE WORLD",
  subtitle: "33 MONTHS TOGETHER",
  anniversaryLabel: "33 MONTHS • A WORLD BUILT FOR TWO",

  // --- Characters (edit names + colors) ---
  playerName: "Hatsuki",      // the player (her avatar)
  partnerName: "Van",         // the builder / person being celebrated
  playerSkin: 0xf2c9a4,       // skin tone
  playerHair: 0x3a2a1a,
  playerShirt: 0xff8fb3,      // cherry pink
  playerPants: 0x4a6fa5,
  partnerSkin: 0xf2c9a4,
  partnerHair: 0x1a1a2e,
  partnerShirt: 0x7ec8e3,     // sky blue
  partnerPants: 0x2e4057,

  // --- Anniversary ---
  anniversaryDate: "2026-11-23", // YYYY-MM-DD — shown in menus
  monthsTogether: 33,

  // --- Story ---
  mainQuote:
    "Every world has its own story. This one was built for you, because somehow, out of all the worlds I could have explored, you're still the one I want to build with.",
  introText:
    "Every adventure has a starting point. Ours became something I never wanted to lose.",
  finalMessage:
    "Thirty-three months have passed, but I still want to build more worlds with you. Thank you for being part of my story. If I could choose a player to stand beside me in every adventure, it would always be you.",
  finalTitle: "HAPPY 33RD MONTHSARY, BABY.",
  finalSubtitle: "YOU ARE MY FAVORITE WORLD.",

  // --- The 33rd-monthsary love letter (Taglish, long-form) ---
  // Replace with your real letter. Supports \n for line breaks.
  loveLetter: `Mahal kong Hatsuki,

Kung nababasa mo ito, ibig sabihin narating mo na ang tuktok ng bundok — at sana, naramdaman mo kung gaano kita kamahal sa bawat hakbang ng paglalakbay na ito.

Hindi ko alam kung paano ko ipapaliwanag ang 33 buwan na kasama ka. Sa simula, parang ordinaryong mundo lang ang lahat. Pero simula nung dumating ka, bawat araw ay naging parang bagong biome — may mga araw na puno ng cherry blossoms, may mga araw na umuulan, pero lagi akong bumabalik sa iisang spawn point: ikaw.

Salamat sa lahat ng tawanan, sa lahat ng puyat, sa lahat ng "ingat ka lagi" at sa lahat ng maliliit na bagay na ginawa mong malaki para sa akin. Ikaw ang paborito kong player sa bawat adventure, at ikaw ang bahay na lagi kong gusto balikan.

Hindi ito ang huling mundo na bubuuin natin. Marami pa tayong paglalakbay na naghihintay — at sa bawat isa, pipiliin pa rin kita. Paulit-ulit. Sa bawat mundo. Sa bawat buhay.

Mahal na mahal kita, Baby. Happy 33rd monthsary.

— Van`,

  // --- Promises shown at the final beacon ---
  promises: [
    "I will choose you in every world.",
    "I will build a home with you, wherever we are.",
    "I will keep exploring, as long as you're beside me.",
  ],

  // --- World / performance ---
  worldSize: 220,          // blocks (x/z extent)
  renderDistance: 120,
  graphicsQuality: "high", // "high" | "medium" | "low"
  dayLengthSeconds: 240,   // full day-night cycle
  startTimeOfDay: 0.32,    // 0 = dawn, 0.5 = noon... (0..1)

  // --- Audio (place files in assets/audio/ to override synth) ---
  audio: {
    musicEnabled: true,
    sfxEnabled: true,
    ambientEnabled: true,
    // filenames (optional — synth fallback is used if missing)
    files: {
      music: "assets/audio/music.mp3",
      forest: "assets/audio/forest.mp3",
      water: "assets/audio/water.mp3",
    },
  },
};
