import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RecommendationPanel } from "@/components/recommendation-panel";
import { getGameBySlug, getRatingForGame, getRecommendations } from "@/lib/games";
import { getCategoryBySlug } from "@/data/categories";
import { SITE_NAME, absoluteUrl } from "@/lib/site";

interface Params {
  slug: string;
}

const truncate = (value: string, limit = 155) => {
  if (value.length <= limit) return value;
  return `${value.slice(0, limit - 3)}...`;
};

const renderStars = (rating: number) => {
  const stars = [];
  for (let i = 1; i <= 5; i += 1) {
    const diff = rating - (i - 1);
    let fill = "text-slate-300";
    if (diff >= 1) {
      fill = "text-amber-400";
    } else if (diff >= 0.5) {
      fill = "text-amber-300";
    }
    stars.push(
      <svg
        key={i}
        viewBox="0 0 24 24"
        className={`h-5 w-5 ${fill}`}
        aria-hidden="true"
        role="presentation"
      >
        <path
          fill="currentColor"
          d="M12 17.3 6.18 20.7l1.58-6.77L2.5 9.24l7-.61L12 2.5l2.5 6.13 7 .61-5.26 4.69 1.58 6.77Z"
        />
      </svg>
    );
  }
  return stars;
};

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const game = getGameBySlug(slug);
  if (!game) {
    return { title: "Game not found" };
  }

  const { ratingValue } = getRatingForGame(game);
  const title = `${game.title} | ${SITE_NAME}`;
  const url = absoluteUrl(`/game/${game.slug}`);
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
      type: "article",
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

export default async function GamePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const game = getGameBySlug(slug);

  if (!game) {
    notFound();
  }

  const { ratingValue, contentRating } = getRatingForGame(game);
  const recommendations = getRecommendations(game, 30);

  const primaryCategoryName = game.category?.[0];
  const primaryCategorySlug = primaryCategoryName
    ? primaryCategoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "")
    : undefined;
  const primaryCategory = primaryCategorySlug ? getCategoryBySlug(primaryCategorySlug) : undefined;
  const primaryTagLabel = primaryCategory?.name ?? primaryCategoryName ?? "Featured";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: game.title,
    description: truncate(game.description, 180),
    applicationCategory: "Game",
    operatingSystem: "Web Browser",
    url: absoluteUrl(`/game/${game.slug}`),
    image: game.thumbnail_url,
    contentRating,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: ratingValue.toFixed(1),
      reviewCount: "1000",
    },
  };

  const published = new Date(game.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const updated = new Date(game.updated_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="bg-white text-slate-900">
      <div className="relative isolate">
        <div className="pointer-events-none absolute inset-x-0 top-[-220px] z-0 h-[420px] bg-[radial-gradient(ellipse_at_top,_rgba(37,99,235,0.12),_transparent_60%)] blur-3xl" />
        <div className="relative z-10 mx-auto max-w-6xl px-6 py-6">
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <article className="space-y-4">
              <div className="space-y-4 md:rounded-3xl md:border md:border-slate-200 md:bg-white md:p-6 md:shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-1 items-start gap-4">
                    <div className="relative h-24 w-24 overflow-hidden rounded-2xl border border-white shadow sm:h-32 sm:w-32">
                      <Image
                        src={game.thumbnail_url}
                        alt={game.title}
                        fill
                        sizes="(min-width: 1024px) 220px, 50vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex min-h-[6rem] flex-1 flex-col">
                      <h1 className="text-lg font-bold text-slate-900 md:text-xl">{game.title}</h1>
                      <div className="mt-auto flex flex-wrap items-end gap-3 text-sm text-slate-600">
                        <span className="text-base font-semibold text-slate-900">{ratingValue.toFixed(1)}</span>
                        <span className="flex items-end gap-0.5" aria-label={`Rated ${ratingValue.toFixed(1)} out of 5`}>
                          {renderStars(ratingValue)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link
                    href={`/play/${game.slug}`}
                    className="inline-flex h-12 w-full items-center justify-center rounded-full bg-blue-500 px-6 text-lg font-semibold uppercase tracking-[0.4em] text-white shadow-lg transition hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 sm:w-auto sm:self-center sm:px-12"
                  >
                    PLAY
                  </Link>
                </div>
              </div>

              <div className="grid gap-4 text-sm text-slate-600 sm:grid-cols-2 md:rounded-3xl md:border md:border-slate-200 md:bg-white md:p-6 md:shadow-sm">
                <div className="flex flex-col gap-1">
                  <span className="text-xs uppercase tracking-[0.3em] text-blue-500">Published</span>
                  <span className="font-semibold text-slate-900">{published}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs uppercase tracking-[0.3em] text-blue-500">Updated</span>
                  <span className="font-semibold text-slate-900">{updated}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs uppercase tracking-[0.3em] text-blue-500">Category</span>
                  <span className="font-semibold text-slate-900">{primaryTagLabel}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs uppercase tracking-[0.3em] text-blue-500">Rating</span>
                  <span className="font-semibold text-slate-900">{contentRating}</span>
                </div>
              </div>

              <section className="space-y-6 md:rounded-3xl md:border md:border-slate-200 md:bg-white md:p-6 md:shadow-sm">
                <div className="space-y-3">
                  <h2 className="text-xl font-semibold text-slate-900">Description</h2>
                  <p className="text-base leading-relaxed text-slate-600">{game.description}</p>
                </div>
                <div className="space-y-3">
                  <h2 className="text-xl font-semibold text-slate-900">Editor&apos;s Review</h2>
                  <p className="text-base leading-relaxed text-slate-600">{game.editors_review}</p>
                </div>
              </section>
            </article>

            <aside className="space-y-6">
              <RecommendationPanel games={recommendations.slice(0, 14)} />
            </aside>
          </div>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}
