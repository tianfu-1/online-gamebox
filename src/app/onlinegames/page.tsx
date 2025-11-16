import type { Metadata } from "next";
import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";
import { getAllGames } from "@/lib/games";
import { ONLINEGAMES_DEFAULT, ONLINEGAMES_VARIANTS } from "@/lib/onlinegames.config";
import { getOnlineGamesForRequest } from "@/lib/onlinegames.sort";
import { OnlineGamesGrid } from "@/components/onlinegames-grid";

export const dynamic = "force-dynamic";

interface SearchParams {
  [key: string]: string | string[] | undefined;
  game?: string | string[];
  variant?: string | string[];
}

export const metadata: Metadata = {
  title: `Play Free Online Games | ${SITE_NAME}`,
  description: `${SITE_DESCRIPTION} Discover curated grids of browser games ready to launch instantly.`,
  alternates: {
    canonical: absoluteUrl("/onlinegames"),
  },
};

export const revalidate = 0;

type SearchParamsInput = SearchParams | Promise<SearchParams> | undefined;

const isPromise = (value: SearchParamsInput): value is Promise<SearchParams> =>
  typeof value === "object" && value !== null && "then" in value;

export default async function OnlineGamesPage({ searchParams }: { searchParams?: SearchParamsInput }) {
  const games = getAllGames();
  const resolvedParams = isPromise(searchParams) ? await searchParams : searchParams ?? {};
  const orderedGames = getOnlineGamesForRequest(
    games,
    ONLINEGAMES_DEFAULT,
    ONLINEGAMES_VARIANTS,
    resolvedParams
  );

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="px-3 py-4 sm:px-4 lg:px-3">
        <OnlineGamesGrid games={orderedGames} />
      </div>
    </div>
  );
}
