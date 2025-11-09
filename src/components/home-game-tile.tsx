import Image from "next/image";
import Link from "next/link";
import type { Game } from "@/types/game";

interface HomeGameTileProps {
  game: Game;
}

export function HomeGameTile({ game }: HomeGameTileProps) {
  return (
    <Link
      href={`/game/${game.slug}`}
      className="group flex w-full flex-col text-center text-sm"
      aria-label={`View ${game.title}`}
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-lg transition duration-300 group-hover:-translate-y-1 group-hover:border-blue-200 group-hover:shadow-2xl">
        <Image
          src={game.thumbnail_url}
          alt={game.title}
          fill
          sizes="(max-width: 640px) 28vw, (max-width: 1024px) 18vw, 12vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <span className="mt-2 truncate text-sm font-semibold text-slate-900 transition group-hover:text-blue-600">
        {game.title}
      </span>
    </Link>
  );
}
