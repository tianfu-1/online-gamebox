import { writeFileSync } from "node:fs";

const baseGames = [
  { title: "Subway Surfer Dash", category: "action" },
  { title: "Galaxy Defender Squad", category: "action" },
  { title: "Mystic Match Garden", category: "puzzle" },
  { title: "Pirate Merge Fleet", category: "strategy" },
  { title: "Streetball Legends", category: "sports" },
  { title: "Pixel Chef Story", category: "casual" },
  { title: "Cyber Drift Kings", category: "racing" },
  { title: "Jungle Temple Escape", category: "adventure" },
  { title: "Neon Rhythm Runner", category: "music" },
  { title: "Bubble Reactor Lab", category: "puzzle" },
  { title: "Robot Siege Defense", category: "strategy" },
  { title: "Skyline Parkour Rush", category: "action" },
  { title: "Crystal Quest Builder", category: "simulation" },
  { title: "Desert Rally Rally", category: "racing" },
  { title: "Arcane Archer Trials", category: "action" },
  { title: "Solar Farm Tycoon", category: "simulation" },
  { title: "Retro Pinball Remix", category: "casual" },
  { title: "Ocean Cleanup Patrol", category: "adventure" },
  { title: "Mech Arena Brawl", category: "action" },
  { title: "Cloud City Puzzler", category: "puzzle" }
];

const baseFileUrl = "https://r2.example.com/games";

const descriptionSentences = [
  "{title} drops players into a fully browser-based experience that keeps sessions lean while still feeling polished.",
  "It is tuned for quick play bursts, but a longer run reveals layered objectives and dynamic pacing.",
  "Designed for mobile and desktop, the canvas scales smoothly with touch-friendly inputs and responsive key mapping.",
  "Each run feeds the HotPool metric so the title can surface inside category hubs whenever engagement spikes.",
  "Upgraded art and subtle shader passes keep the presentation crisp even on lower bandwidth connections.",
  "Players can hop in without download friction, making it perfect for organic SEO traffic looking for instant fun.",
  "Session checkpoints create natural breakpoints for ads while respecting gameplay momentum.",
  "The audio bed leans on short loops that stay catchy without bloating load times.",
  "Lightweight save data is stored in localStorage so returning visitors can resume progress instantly."
];

const howToPlaySentences = [
  "Start by learning the core control scheme which is highlighted in the onboarding overlay and also documented in the pause menu.",
  "Focus on the early objectives listed on the left rail; finishing them unlocks multipliers that make high scores easier.",
  "Collect power-ups that sync with your play style, whether that means extra shields, combo timers, or resource bursts.",
  "Watch for environmental tells: subtle color shifts foreshadow traps while audio cues foreshadow rare spawns.",
  "Keyboard and touch bindings mirror each other, so swapping devices mid-session feels natural.",
  "Mini tutorial cards appear after each failure to explain the mechanic that caused the run to end.",
  "When a level feels overwhelming, jump into practice mode where enemies move slower but rewards still count.",
  "A share button copies the play URL with current seed data, letting creators challenge friends or viewers.",
  "Global leaderboards refresh hourly, so checking back often can help you reclaim a top slot before reset.",
  "If performance dips, toggle low-fidelity mode to disable weather particles and depth-of-field effects."
];

const editorsReviewSentences = [
  "{title} nails the MVP balance we target: it loads fast, teaches itself quickly, and leaves room for mastery.",
  "Category alignment is strong, and the art kit lands in a sweet spot between nostalgia and modern polish.",
  "The progression loop encourages repeat sessions without forcing daily chores, which should play nicely with SEO-driven traffic.",
  "We appreciate how monetization hooks are hinted but not forced, so design can grow toward rewarded video later without refactoring.",
  "Accessibility settings like high-contrast UI and reduced motion are simple yet effective.",
  "It also behaves well inside sandboxed iframes, respecting focus traps and pausing audio when unfocused.",
  "Controller support is a plus, letting living room players treat it like a micro console release.",
  "There are still edges to sand down, but as a launch title it gives us confident benchmarks for pacing and retention.",
  "Missing analytics can be added via page-level events since the game posts structured status messages to the parent frame.",
  "Between its scalable UI and snackable rounds, this is the sort of evergreen entry that fills the Recommended rail on busy days.",
  "Live ops hooks such as rotating challenges and seasonal palettes make weekly refreshes cheap yet noticeable.",
  "The soundtrack and haptics never overpower the action, keeping attention on the core dodge-and-react gameplay." 
];

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildParagraph(sentences, minWords, maxWords, replacements = {}) {
  const output = [];
  let wordCount = 0;
  let index = 0;
  while (wordCount < minWords) {
    const sentence = sentences[index % sentences.length]
      .replaceAll("{title}", replacements.title ?? "the game")
      .replaceAll("{category}", replacements.category ?? "the category");
    output.push(sentence);
    wordCount += sentence.split(/\s+/).length;
    index += 1;
  }
  if (wordCount > maxWords) {
    const words = output.join(" ").split(/\s+/);
    const trimmed = words.slice(0, maxWords).join(" ");
    return trimmed.endsWith(".") ? trimmed : `${trimmed}.`;
  }
  return output.join(" ");
}

const now = new Date();
const games = baseGames.map((game, index) => {
  const slug = slugify(game.title);
  const created = new Date(now.getTime() - (index + 1) * 86400000);
  const updated = new Date(created.getTime() + 43200000);
  const playCount = 5000 + (baseGames.length - index) * 1000;
  const replacements = { title: game.title, category: game.category };
  return {
    id: index + 1,
    title: game.title,
    slug,
    thumbnail_url: `https://placehold.co/600x400/png?text=${encodeURIComponent(game.title)}`,
    category: game.category,
    description: buildParagraph(descriptionSentences, 110, 140, replacements),
    how_to_play: buildParagraph(howToPlaySentences, 150, 200, replacements),
    editors_review: buildParagraph(editorsReviewSentences, 200, 250, replacements),
    file_url: `${baseFileUrl}/${slug}/index.html`,
    play_count: playCount,
    created_at: created.toISOString(),
    updated_at: updated.toISOString()
  };
});

writeFileSync("src/data/games.json", JSON.stringify(games, null, 2));
console.log(`Generated ${games.length} games at src/data/games.json`);
