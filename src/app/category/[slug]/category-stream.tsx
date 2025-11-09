"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { GameCard } from "@/components/game-card";
import type { Game } from "@/types/game";

interface CategoryInfiniteListProps {
  games: Game[];
  batchSize: number;
  maxBatches: number;
}

export function CategoryInfiniteList({ games, batchSize, maxBatches }: CategoryInfiniteListProps) {
  const limit = useMemo(() => Math.min(games.length, batchSize * maxBatches), [games.length, batchSize, maxBatches]);
  const initialVisible = Math.min(batchSize, games.length);
  const [visibleCount, setVisibleCount] = useState(initialVisible);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sentinelRef.current) return;
    if (visibleCount >= limit) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setVisibleCount((current) => Math.min(current + batchSize, limit));
        }
      },
      { threshold: 1 }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [batchSize, limit, visibleCount]);

  const hasMore = visibleCount < limit;

  return (
    <div className="mt-8 space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {games.slice(0, visibleCount).map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
      <div className="text-center text-sm text-slate-500" aria-live="polite">
        {hasMore ? "Loading more games..." : "You've reached the end."}
      </div>
      <div ref={sentinelRef} aria-hidden="true" className="h-1 w-full" />
      <noscript>
        <p className="text-center text-sm text-slate-500">Enable JavaScript to load more games.</p>
      </noscript>
    </div>
  );
}
