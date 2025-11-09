import Image from "next/image";
import Link from "next/link";
import type { Game } from "@/types/game";

interface RecommendationPanelProps {
  games: Game[];
  mobileColumns?: 2 | 3;
}

export function RecommendationPanel({ games, mobileColumns = 2 }: RecommendationPanelProps) {
  const mobileColsClass = mobileColumns === 3 ? "grid-cols-3" : "grid-cols-2";

  return (
    <aside
      className={`grid ${mobileColsClass} gap-4 md:grid-cols-2 md:rounded-3xl md:border md:border-slate-200 md:bg-white md:p-6 md:shadow-sm`}
    >
      {games.map((game) => (
        <Link
          key={game.id}
          href={`/game/${game.slug}`}
          className="relative aspect-square overflow-hidden rounded-2xl transition md:rounded-[32px] md:border md:border-slate-100 md:bg-slate-50 md:shadow-inner md:hover:border-blue-200"
        >
          <Image
            src={game.thumbnail_url}
            alt={game.title}
            fill
            sizes="(max-width: 768px) 45vw, 160px"
            className="object-cover"
            loading="lazy"
          />
        </Link>
      ))}
    </aside>
  );
}
