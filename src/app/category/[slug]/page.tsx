import Link from "next/link";
import type { Metadata } from "next";
import { getCategoryBySlug } from "@/data/categories";
import { CategoryInfiniteList } from "./category-stream";
import { getGamesByTag } from "@/lib/games";
import { SITE_DESCRIPTION, SITE_NAME, absoluteUrl } from "@/lib/site";

const BATCH_SIZE = 20;
const MAX_BATCHES = 8;

export const revalidate = 300;

interface Params {
  slug: string;
}

const titleCaseSlug = (slug: string) =>
  slug
    .split("-")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");

const fallbackDescription = (name: string, count: number) =>
  `Browse ${count}+ ${name.toLowerCase()} games ready to play instantly on ${SITE_NAME}.`;

const resolveCategoryInfo = (slug: string, count: number) => {
  const category = getCategoryBySlug(slug);
  const name = category?.name ?? titleCaseSlug(slug);
  const description = category?.description ?? fallbackDescription(name, count);
  const totalCount = category?.count ?? count;
  return { name, description, count: totalCount };
};

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;

  const games = getGamesByTag(slug);

  if (!games.length) {
    return {
      title: "Collection Not Found",
      description: SITE_DESCRIPTION,
      alternates: {
        canonical: absoluteUrl(),
      },
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const categoryInfo = resolveCategoryInfo(slug, games.length);

  const title = `${categoryInfo.name} | ${SITE_NAME}`;
  const baseDescription = `${categoryInfo.description}`;
  const description =
    baseDescription.length > 155 ? `${baseDescription.slice(0, 152)}...` : baseDescription;

  const canonical = absoluteUrl(`/category/${slug}`);

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
    },
    twitter: {
      title,
      description,
      card: "summary_large_image",
    },
  };
}

export default async function CategoryPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;

  const games = getGamesByTag(slug);

  const categoryInfo = resolveCategoryInfo(slug, games.length);
  const initialRenderCount = Math.min(BATCH_SIZE, games.length);

  return (
    <div className="relative isolate">
      <div className="pointer-events-none absolute inset-x-0 top-[-180px] z-0 h-[380px] bg-[radial-gradient(ellipse_at_top,_rgba(37,99,235,0.12),_transparent_60%)] blur-3xl" />
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-12">
        <Link
          href="/#categories"
          className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.35em] text-blue-600 hover:text-blue-500"
        >
          &larr; Back to featured tags
        </Link>
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <span className="text-xs uppercase tracking-[0.4em] text-blue-600">Tag Collection</span>
          <h1 className="mt-4 text-4xl font-black text-slate-900">{categoryInfo.name}</h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-600">
            {categoryInfo.description}
          </p>
          <div className="mt-6 grid gap-6 text-sm text-slate-600 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-blue-600">Initial SSR</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{initialRenderCount} games</p>
              <p className="mt-1 text-xs text-slate-500">
                First batch ships server-rendered so crawlers can index without JavaScript.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-blue-600">Total in tag</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{categoryInfo.count}</p>
              <p className="mt-1 text-xs text-slate-500">Counts refresh whenever new games join this taxonomy.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-blue-600">Load strategy</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">20 per batch - up to 8 batches</p>
              <p className="mt-1 text-xs text-slate-500">
                IntersectionObserver streams additional cards smoothly with placeholder states.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10">
          {games.length ? (
            <CategoryInfiniteList games={games} batchSize={BATCH_SIZE} maxBatches={MAX_BATCHES} />
          ) : (
            <p className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-slate-600">
              We are preparing new games for this tag. Check back soon for fresh uploads.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
