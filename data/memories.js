// ============================================================
//  33 MEMORIES — one per month of your relationship.
//  EDIT THIS FILE: replace every placeholder with your real
//  memory (title, date, message). The game reads this file
//  for BOTH the 33 garden flowers AND the 33 library books.
//  Month 33 is special: its flower + book reveal the finale hint.
// ============================================================

export const MEMORIES = [
  { month: 1,  title: "Month 1 — First Spawn",   date: "EDIT ME", message: "Placeholder memory for month 1. Replace this with your real story — how you met, your first conversation, or the day everything began." },
  { month: 2,  title: "Month 2", date: "EDIT ME", message: "Placeholder memory for month 2. Write the small moment that made you smile." },
  { month: 3,  title: "Month 3", date: "EDIT ME", message: "Placeholder memory for month 3. A challenge you faced together and overcame." },
  { month: 4,  title: "Month 4", date: "EDIT ME", message: "Placeholder memory for month 4. Your first adventure or trip together." },
  { month: 5,  title: "Month 5", date: "EDIT ME", message: "Placeholder memory for month 5. Something funny that still makes you laugh." },
  { month: 6,  title: "Month 6", date: "EDIT ME", message: "Placeholder memory for month 6. Half a year of choosing each other." },
  { month: 7,  title: "Month 7", date: "EDIT ME", message: "Placeholder memory for month 7. A quiet, ordinary day that felt special." },
  { month: 8,  title: "Month 8", date: "EDIT ME", message: "Placeholder memory for month 8. A dream you shared about the future." },
  { month: 9,  title: "Month 9", date: "EDIT ME", message: "Placeholder memory for month 9. A hard day you got through together." },
  { month: 10, title: "Month 10", date: "EDIT ME", message: "Placeholder memory for month 10. Double digits — look how far you've come." },
  { month: 11, title: "Month 11", date: "EDIT ME", message: "Placeholder memory for month 11. A surprise, a gift, or a sweet gesture." },
  { month: 12, title: "Month 12", date: "EDIT ME", message: "Placeholder memory for month 12. One full year. A whole world built together." },
  { month: 13, title: "Month 13", date: "EDIT ME", message: "Placeholder memory for month 13. The start of year two." },
  { month: 14, title: "Month 14", date: "EDIT ME", message: "Placeholder memory for month 14. Something you learned about each other." },
  { month: 15, title: "Month 15", date: "EDIT ME", message: "Placeholder memory for month 15. A place you both love." },
  { month: 16, title: "Month 16", date: "EDIT ME", message: "Placeholder memory for month 16. An inside joke only you two understand." },
  { month: 17, title: "Month 17", date: "EDIT ME", message: "Placeholder memory for month 17. A moment of pride — something she achieved." },
  { month: 18, title: "Month 18", date: "EDIT ME", message: "Placeholder memory for month 18. One and a half years of us." },
  { month: 19, title: "Month 19", date: "EDIT ME", message: "Placeholder memory for month 19. A storm you weathered together." },
  { month: 20, title: "Month 20", date: "EDIT ME", message: "Placeholder memory for month 20. Twenty months of choosing each other." },
  { month: 21, title: "Month 21", date: "EDIT ME", message: "Placeholder memory for month 21. A small thing she does that you adore." },
  { month: 22, title: "Month 22", date: "EDIT ME", message: "Placeholder memory for month 22. A plan you made for the future." },
  { month: 23, title: "Month 23", date: "EDIT ME", message: "Placeholder memory for month 23. A photo or moment you want to keep forever." },
  { month: 24, title: "Month 24", date: "EDIT ME", message: "Placeholder memory for month 24. Two years. Two whole years of us." },
  { month: 25, title: "Month 25", date: "EDIT ME", message: "Placeholder memory for month 25. The start of year three." },
  { month: 26, title: "Month 26", date: "EDIT ME", message: "Placeholder memory for month 26. A dream that came true." },
  { month: 27, title: "Month 27", date: "EDIT ME", message: "Placeholder memory for month 27. Something that made you fall in love all over again." },
  { month: 28, title: "Month 28", date: "EDIT ME", message: "Placeholder memory for month 28. A promise you made to each other." },
  { month: 29, title: "Month 29", date: "EDIT ME", message: "Placeholder memory for month 29. A quiet night, just the two of you." },
  { month: 30, title: "Month 30", date: "EDIT ME", message: "Placeholder memory for month 30. Thirty months — almost there." },
  { month: 31, title: "Month 31", date: "EDIT ME", message: "Placeholder memory for month 31. The calm before the celebration." },
  { month: 32, title: "Month 32", date: "EDIT ME", message: "Placeholder memory for month 32. The month before this world was built for her." },
  { month: 33, title: "Month 33 — This World", date: "EDIT ME", message: "This month, I built you an entire world. Every flower, every book, every chest — all of it exists for one reason: to say I still choose you. The final beacon is waiting at our forever coordinates. — Van" },
];

export const FLOWER_MESSAGES = MEMORIES.map((m) => ({
  month: m.month,
  title: m.title,
  message: m.message,
}));

export const BOOK_CHAPTERS = MEMORIES.map((m) => ({
  chapter: m.month,
  title: m.title,
  date: m.date,
  body: m.message,
}));
