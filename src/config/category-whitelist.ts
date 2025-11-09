import gamesData from "@/data/games.json";
import type { Game } from "@/types/game";

export const CATEGORY_SLUG_WHITELIST = [
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
  "idle-games",
  "roblox-games",
  "brain-games",
  "music-games",
  "cooking-games",
  "crafting-games",
  "tycoon-games",
  "basketball-games",
  "car-racing-games",
  "survival-games",
  "parkour-games",
];

export const CATEGORY_CURATED_SET = new Set(CATEGORY_SLUG_WHITELIST);

const games = gamesData as Game[];

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

const derivedSlugs = Array.from(
  new Set(
    games.flatMap((game) => (game.category ?? []).map((tag) => slugify(tag)).filter(Boolean))
  )
);

export const CATEGORY_SLUG_SET = new Set([...CATEGORY_CURATED_SET, ...derivedSlugs]);
