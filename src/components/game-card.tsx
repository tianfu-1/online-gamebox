import Image from "next/image";
import Link from "next/link";
import { getCategoryBySlug } from "@/data/categories";
import type { Game } from "@/types/game";

interface GameCardProps {
  game: Game;
  showCategory?: boolean;
  compact?: boolean;
}

const formatTagLabel = (label?: string) => {
  if (!label) return undefined;
  return label
    .split(" ")
    .filter(Boolean)
    .map((word) => {
      if (word.length <= 2) {
        return word.toUpperCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
};

export function GameCard({ game, showCategory = true, compact = false }: GameCardProps) {
  const summary =
    game.description.length > 160 && !compact
      ? `${game.description.slice(0, 157)}...`
      : game.description;

  const primaryCategory = game.category?.[0];
  const categorySlug = primaryCategory
    ? primaryCategory.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "")
    : undefined;
  const categoryInfo = categorySlug ? getCategoryBySlug(categorySlug) : undefined;
  const badgeLabel = categoryInfo?.name ?? formatTagLabel(primaryCategory);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg">
      <Link href={`/game/${game.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          <Image
            src={game.thumbnail_url}
            alt={game.title}
            width={640}
            height={480}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          {showCategory && badgeLabel && (
            <span className="absolute left-4 top-4 rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 shadow-sm">
              {badgeLabel}
            </span>
          )}
          <span className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        </div>
        <div className="space-y-2 px-5 pb-5 pt-4">
          <h3 className="text-lg font-semibold text-slate-900 transition group-hover:text-blue-600">
            {game.title}
          </h3>
          {!compact && <p className="text-sm leading-relaxed text-slate-600">{summary}</p>}
        </div>
      </Link>
      <div className="mt-auto flex flex-wrap items-center gap-3 border-t border-slate-200 px-5 py-4 text-sm">
        <Link
          href={`/play/${game.slug}`}
          className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          Play Now
        </Link>
        <Link
          href={`/game/${game.slug}`}
          className="text-slate-500 transition hover:text-slate-900"
          aria-label={`Read how to play ${game.title}`}
        >
          Details
        </Link>
      </div>
    </article>
  );
}
