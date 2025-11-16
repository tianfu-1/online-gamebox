import type { Game } from "@/types/game";

export interface OnlineGamesSearchParams {
  game?: string | string[];
  variant?: string | string[];
}

const toSingleValue = (value?: string | string[]) => {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
};

const normalizeSlug = (slug?: string | null) => slug?.trim().toLowerCase() ?? "";

const uniqueSlugs = (slugs: string[]) => {
  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const raw of slugs) {
    const slug = normalizeSlug(raw);
    if (slug && !seen.has(slug)) {
      seen.add(slug);
      ordered.push(slug);
    }
  }
  return ordered;
};

export const getOnlineGamesForRequest = (
  allGames: Game[],
  defaultSlugs: string[],
  variants: Record<string, string[]>,
  searchParams: OnlineGamesSearchParams = {}
) => {
  const slugMap = new Map(allGames.map((game) => [normalizeSlug(game.slug), game]));

  const variantKey = normalizeSlug(toSingleValue(searchParams.variant));
  const targetSlug = normalizeSlug(toSingleValue(searchParams.game));

  const baseSlugs = variantKey && variants[variantKey]?.length ? variants[variantKey] : defaultSlugs;

  let orderedSlugs = uniqueSlugs(baseSlugs).filter((slug) => slugMap.has(slug));

  if (!orderedSlugs.length) {
    orderedSlugs = allGames.map((game) => normalizeSlug(game.slug));
  }

  if (targetSlug && slugMap.has(targetSlug)) {
    orderedSlugs = orderedSlugs.filter((slug) => slug !== targetSlug);
    orderedSlugs = [targetSlug, ...orderedSlugs];
  }

  const seen = new Set(orderedSlugs);
  for (const game of allGames) {
    const normalized = normalizeSlug(game.slug);
    if (!seen.has(normalized)) {
      orderedSlugs.push(normalized);
      seen.add(normalized);
    }
  }

  return orderedSlugs
    .map((slug) => slugMap.get(slug))
    .filter((game): game is Game => Boolean(game));
};
