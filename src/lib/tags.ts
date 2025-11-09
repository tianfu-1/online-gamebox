import gamesData from "@/data/games.json";
import type { Category } from "@/types/category";
import type { Game } from "@/types/game";

const games = gamesData as Game[];

const SMALL_WORDS = new Set(["and", "or", "for", "the", "of", "a", "an", "to", "vs", "in"]);

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

const toTitleCase = (tag: string) =>
  tag
    .toLowerCase()
    .split(" ")
    .map((word, index) => {
      if (index !== 0 && SMALL_WORDS.has(word)) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");

const TAG_FOCUS: Record<string, string> = {
  "action-games": "high-tempo combat loops, evasive rolls, and boss rush pacing that reward aggressive play",
  "adventure-games": "story-rich exploration, branching conversations, and collectible hunts that uncover lore",
  "puzzle-games": "clever logic layouts, score-chasing combos, and satisfying aha moments",
  "strategy-games": "smart resource juggling, tactical formations, and adaptive AI encounters",
  "sports-games": "timed shots, trick executions, and league-style progression that fuels rematches",
  "racing-games": "precision cornering, nitro management, and rival takeovers without loading screens",
  "simulation-games": "deep systems design, resource dashboards, and progression arcs fit for sandbox fans",
  "casual-games": "snackable goals, cozy aesthetics, and relaxing loops perfect for short sessions",
  "mobile-games": "thumb-friendly controls, quick resets, and UI tuned for portrait and landscape play",
  "multiplayer-games": "matchmaking speed, party-friendly lobbies, and replay hooks for squads",
  "new-games": "fresh drops, seasonal twists, and HotPool visibility boosters for emerging hits",
  "popular-games": "community favorites, evergreen retention loops, and constantly climbing leaderboards",
  "idle-games": "hands-off progression, generous offline rewards, and automation routes for meta optimizers",
  "roblox-games": "parkour obbies, tycoon templates, and creator-friendly systems inspired by Roblox trends",
  "brain-games": "memory exercises, pattern spotting, and difficulty options that sharpen focus",
  "music-games": "beat-perfect note charts, combo-driven scoring, and toggles for practice mode",
  "cooking-games": "fast order queues, recipe juggling, and kitchen upgrades with visual flair",
  "crafting-games": "resource gathering, blueprint unlocking, and builder progression for planners",
  "tycoon-games": "scalable revenue streams, staffing upgrades, and KPI dashboards for long-term runs",
  "basketball-games": "perfect release windows, highlight-reel dunks, and leaderboard-driven seasons",
  "car-racing-games": "gear tuning, drift chains, and multi-lap championships optimized for browser play",
  "survival-games": "day-night cycles, crafting trees, and risk-versus-reward expeditions",
  "parkour-games": "momentum-based movement, tight checkpoint placement, and shareable speedrun lines",
};

const buildDescription = (name: string, count: number, focus: string): string => {
  const sentences = [
    `Explore ${count}+ browser-ready titles in our ${name} collection on KPOP Games GO, available worldwide in seconds.`,
    "Every release streams directly from Cloudflare R2, so you can launch runs instantly with no downloads, captchas, or pop-ups.",
    `We spotlight mechanics that lean into ${focus}, keeping sessions approachable for new visitors yet rewarding for skill chasers.`,
    "Structured data, Open Graph cards, and clean CLS scores help this tag surface quickly inside Google and Bing results.",
    "Bookmark the page for weekly HotPool refreshes, seasonal drops, and creator-friendly gameplay loops ready for embeds and watch parties.",
  ];
  return sentences.join(" ");
};

interface TagAggregate {
  slug: string;
  name: string;
  description: string;
  count: number;
}

const tagCountMap = new Map<string, number>();

for (const game of games) {
  for (const tag of game.category ?? []) {
    const normalized = tag.trim().toLowerCase();
    if (!normalized) continue;
    const current = tagCountMap.get(normalized) ?? 0;
    tagCountMap.set(normalized, current + 1);
  }
}

const tagAggregates: TagAggregate[] = Array.from(tagCountMap.entries())
  .map(([tagName, count]) => {
    const slug = slugify(tagName);
    const name = toTitleCase(tagName);
    const focus = TAG_FOCUS[slug] ?? "high replayability, fast loading, and satisfying browser-first design";
    const description = buildDescription(name, count, focus);
    return {
      slug,
      name,
      description,
      count,
    };
  })
  .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

export const tagSummaries: Category[] = tagAggregates;

const PRIMARY_SLUGS = [
  "action-games",
  "adventure-games",
  "puzzle-games",
  "strategy-games",
  "sports-games",
  "racing-games",
  "simulation-games",
  "casual-games",
  "mobile-games",
  "multiplayer-games",
  "popular-games",
  "new-games",
];

export const primaryNavigationTags = PRIMARY_SLUGS.map((slug) =>
  tagSummaries.find((tag) => tag.slug === slug)
).filter(Boolean) as Category[];

export const featuredTagSummaries = tagSummaries.slice(0, 8);

export const getTagBySlug = (slug: string) => tagSummaries.find((tag) => tag.slug === slug);

export const getTagSlug = (tag: string) => slugify(tag);
