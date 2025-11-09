import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RecommendationPanel } from "@/components/recommendation-panel";
import { getGameBySlug, getRatingForGame, getRecommendations } from "@/lib/games";
import { SITE_NAME, absoluteUrl } from "@/lib/site";
import Image from "next/image";

interface Params {
  slug: string;
}

const truncate = (value: string, limit = 150) => {
  if (value.length <= limit) return value;
  return `${value.slice(0, limit - 3)}...`;
};

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const game = getGameBySlug(slug);
  if (!game) {
    return { title: "Game not found" };
  }

  const { ratingValue } = getRatingForGame(game);
  const title = `Play ${game.title} | ${SITE_NAME}`;
  const url = absoluteUrl(`/play/${game.slug}`);
  const description = truncate(game.description);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      images: [
        {
          url: game.thumbnail_url,
          width: 640,
          height: 480,
          alt: game.title,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [game.thumbnail_url],
    },
    other: {
      "rating:value": ratingValue.toString(),
    },
  };
}

export default async function PlayPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const game = getGameBySlug(slug);
  if (!game) {
    notFound();
  }

  const recommendations = getRecommendations(game, 40);

  return (
    <div className="bg-white text-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-4">
        <main className="space-y-4">
          <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-4">
              <div className="space-y-0 rounded-none border-0 bg-transparent shadow-none md:rounded-none md:border md:border-slate-200 md:bg-white md:shadow-sm">
                <div className="relative overflow-hidden bg-black md:border-b md:border-slate-200">
                  <iframe
                    src={game.file_url}
                    title={game.title}
                    className="h-[75vh] w-full md:h-auto md:aspect-[16/9]"
                    allowFullScreen
                    allow="fullscreen; gamepad; autoplay; encrypted-media; clipboard-read; clipboard-write; screen-wake-lock; xr-spatial-tracking"
                    sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-popups allow-top-navigation-by-user-activation"
                  />
                </div>
                <div className="flex items-center justify-between px-3 py-1 md:border-t md:border-slate-200">
                  <h1 className="text-xl font-black text-slate-900 md:text-2xl">{game.title}</h1>
                  <a
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500 text-white shadow-md transition hover:bg-blue-400"
                    href={game.file_url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Open in new tab"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 3H5a2 2 0 0 0-2 2v4" />
                      <path d="M15 3h4a2 2 0 0 1 2 2v4" />
                      <path d="M9 21H5a2 2 0 0 1-2-2v-4" />
                      <path d="M15 21h4a2 2 0 0 0 2-2v-4" />
                    </svg>
                  </a>
                </div>
              </div>
              <div className="rounded-none border-0 bg-transparent shadow-none md:rounded-none md:border md:border-slate-200 md:bg-white md:shadow-sm">
                <div className="px-4 py-2 md:border-b md:border-slate-200 md:px-6 md:py-3">
                  <h2 className="text-xl font-semibold text-slate-900">How to Play</h2>
                </div>
                <p className="px-4 pb-4 text-base leading-relaxed text-slate-600 md:px-6 md:pb-6">
                  {game.how_to_play}
                </p>
              </div>
            </div>
            <RecommendationPanel games={recommendations.slice(0, 12)} mobileColumns={3} />
          </section>

          <section className="space-y-4 rounded-none border-0 bg-transparent p-0 shadow-none md:border md:border-slate-200 md:bg-white md:p-6 md:shadow-sm">
            <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-7">
              {recommendations.slice(12, 33).map((rec) => (
                <Link
                  key={rec.id}
                  href={`/game/${rec.slug}`}
                  className="relative aspect-square overflow-hidden rounded-2xl transition md:rounded-[32px] md:border md:border-slate-100 md:bg-slate-50 md:shadow-inner md:hover:border-blue-200"
                >
                  <Image
                    src={rec.thumbnail_url}
                    alt={rec.title}
                    fill
                    sizes="(max-width: 768px) 45vw, 140px"
                    className="object-cover"
                    loading="lazy"
                  />
                </Link>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
