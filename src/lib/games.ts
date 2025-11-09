import gamesData from "@/data/games.json";
import type { Game } from "@/types/game";

const games: Game[] = gamesData as Game[];

const HOT_POOL_LIMIT = 50;

const byPlayCount = [...games].sort((a, b) => b.play_count - a.play_count);
const byCreatedAt = [...games].sort(
  (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
);

const shuffle = (source: Game[]) => [...source].sort(() => Math.random() - 0.5);

const normalizeTag = (value?: string | null) => {
  if (!value) return "";
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const getTagSet = (game?: Game) => {
  const values = new Set<string>();
  if (!game) return values;
  for (const tag of game.category ?? []) {
    values.add(normalizeTag(tag));
  }
  return values;
};

const gameHasTagSlug = (game: Game, tagSlug: string) => {
  const normalized = normalizeTag(tagSlug);
  return (game.category ?? []).some((tag) => normalizeTag(tag) === normalized);
};

const HOT_POOL_BASE = Array.from(
  new Map<number, Game>(
    [...byPlayCount.slice(0, HOT_POOL_LIMIT), ...byCreatedAt.slice(0, HOT_POOL_LIMIT)].map(
      (game) => [game.id, game]
    )
  ).values()
);

const sortByAffinity = (list: Game[], tagSet: Set<string>) => {
  if (!tagSet.size) return shuffle(list);
  return [...list]
    .map((game) => ({
      game,
      score: game.category?.reduce(
        (total, tag) => (tagSet.has(normalizeTag(tag)) ? total + 1 : total),
        0
      ) ?? 0,
      tiebreaker: Math.random(),
    }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.game.play_count !== a.game.play_count) return b.game.play_count - a.game.play_count;
      return a.tiebreaker - b.tiebreaker;
    })
    .map((entry) => entry.game);
};

const pickUnique = (source: Game[], limit: number, excludedIds: Set<number>) => {
  const picked: Game[] = [];
  for (const game of source) {
    if (picked.length >= limit) break;
    if (excludedIds.has(game.id)) continue;
    picked.push(game);
    excludedIds.add(game.id);
  }
  return picked;
};

export const getAllGames = () => [...games];

export const getGameBySlug = (slug: string) => games.find((game) => game.slug === slug);

export const getGamesByTag = (tagSlug: string) =>
  games.filter((game) => gameHasTagSlug(game, tagSlug));

export const getPopularGames = (limit = 12) => byPlayCount.slice(0, limit);

export const getNewGames = (limit = 12) => byCreatedAt.slice(0, limit);

export const getCategoryCounts = () => {
  return games.reduce<Record<string, number>>((acc, game) => {
    for (const tag of game.category ?? []) {
      const slug = normalizeTag(tag);
      acc[slug] = (acc[slug] ?? 0) + 1;
    }
    return acc;
  }, {});
};

export const getRatingForGame = (game: Game) => {
  return {
    ratingValue: Number((game.rating_value ?? 4.5).toFixed(1)),
    contentRating: game.content_rating ?? "Everyone 3+",
  };
};

export const getHotPool = (tagSlug?: string) => {
  if (!tagSlug) {
    return [...HOT_POOL_BASE];
  }
  return HOT_POOL_BASE.filter((game) => gameHasTagSlug(game, tagSlug));
};

export const getRecommendations = (currentGame: Game, limit = 20) => {
  const excluded = new Set<number>([currentGame.id]);
  const tagSet = getTagSet(currentGame);

  const recommendations: Game[] = [];

  if (tagSet.size) {
    const tagPools = Array.from(tagSet).flatMap((slug) => getHotPool(slug));
    const uniqueTagPool = Array.from(new Map(tagPools.map((game) => [game.id, game])).values());
    const sameTagSorted = sortByAffinity(uniqueTagPool, tagSet);
    recommendations.push(...pickUnique(sameTagSorted, Math.min(5, limit), excluded));
  }

  if (recommendations.length < limit) {
    const globalPool = sortByAffinity(getHotPool(), tagSet);
    recommendations.push(...pickUnique(globalPool, limit - recommendations.length, excluded));
  }

  if (recommendations.length < limit) {
    recommendations.push(...pickUnique(shuffle(games), limit - recommendations.length, excluded));
  }

  return recommendations;
};
