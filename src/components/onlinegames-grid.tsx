import Image from "next/image";
import Link from "next/link";
import type { Game } from "@/types/game";

interface OnlineGamesGridProps {
  games: Game[];
}

export function OnlineGamesGrid({ games }: OnlineGamesGridProps) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-10 sm:gap-3 lg:grid-cols-10 lg:gap-3 px-1 sm:px-0">
      {games.map((game, index) => {
        const isFeatured = index === 0;
        return (
          <Link
            key={game.id}
            href={`/game/${game.slug}`}
            className={`group relative focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${
              isFeatured ? "col-span-2 row-span-2" : ""
            }`}
          >
            <div className="relative w-full pb-[100%] overflow-hidden rounded-3xl bg-[#1a1b23]">
              <Image
                src={game.thumbnail_url}
                alt={game.title}
                fill
                sizes="(max-width: 768px) 33vw, (max-width: 1024px) 20vw, 9vw"
                className="object-cover transition-transform duration-200 ease-out group-hover:scale-110"
                loading={index < 12 ? "eager" : "lazy"}
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-2 pb-2 pt-4 text-[11px] font-semibold tracking-tight text-white opacity-0 sm:px-3 sm:text-xs sm:group-hover:opacity-100">
                {game.title}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
