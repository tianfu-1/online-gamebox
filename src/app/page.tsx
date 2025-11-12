import Link from "next/link";
import { HomeGameTile } from "@/components/home-game-tile";
import { categories } from "@/data/categories";
import { featuredTagSummaries } from "@/lib/tags";
import { getGamesByTag, getNewGames, getPopularGames } from "@/lib/games";
import { SITE_NAME } from "@/lib/site";
import { CATEGORY_CURATED_SET } from "@/config/category-whitelist";

const allowedCategories = categories.filter((category) => CATEGORY_CURATED_SET.has(category.slug));
const categoryShowcaseSources = allowedCategories.slice(0, 4);
const categoryIconList = allowedCategories.slice(0, 16);
const homeGridClass =
  "grid w-full grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-7";
const sectionWidth = "mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10";

const iconPalette = [
  "bg-blue-100 text-blue-700",
  "bg-indigo-100 text-indigo-700",
  "bg-sky-100 text-sky-700",
  "bg-cyan-100 text-cyan-700",
  "bg-emerald-100 text-emerald-700",
  "bg-teal-100 text-teal-700",
  "bg-purple-100 text-purple-700",
  "bg-pink-100 text-pink-700",
  "bg-amber-100 text-amber-700",
  "bg-lime-100 text-lime-700",
];

const getCategoryAccent = (slug: string) => {
  let hash = 0;
  for (let i = 0; i < slug.length; i += 1) {
    hash = (hash << 5) - hash + slug.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % iconPalette.length;
  return iconPalette[index];
};

export default function HomePage() {
  const recommendedGames = getPopularGames(21);
  const hotPoolGames = recommendedGames.slice(0, 6);
  const newest = getNewGames(12);
  const primaryTag = allowedCategories[0] ?? categories[0];
  const categoryShowcases = categoryShowcaseSources
    .map((category) => {
      const allGames = getGamesByTag(category.slug);
      const limit = allGames.length >= 14 ? 14 : Math.min(7, allGames.length);
      return {
        category,
        games: allGames.slice(0, limit),
      };
    })
    .filter((entry) => entry.games.length > 0);

  return (
    <div className="relative isolate bg-white">
      <div className="pointer-events-none absolute inset-x-0 top-[-240px] z-0 h-[480px] bg-[radial-gradient(ellipse_at_top,_rgba(37,99,235,0.15),_transparent_55%)] blur-3xl" />

      <section id="recommended" className={`${sectionWidth} mt-2`}>
        <div className={homeGridClass}>
          {recommendedGames.map((game) => (
            <HomeGameTile key={game.id} game={game} />
          ))}
        </div>
      </section>

      {categoryShowcases.length ? (
        <section id="category-collections" className={`mt-8 ${sectionWidth}`}>
          <div className="mt-8 space-y-8">
            {categoryShowcases.map(({ category, games }) => (
              <article key={category.slug} className="rounded-3xl border border-slate-200 bg-white/80 p-5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-5">
                  <h3 className="text-lg font-bold text-slate-900">{category.name}</h3>
                  <Link
                    href={`/category/${category.slug}`}
                    className="inline-flex items-center rounded-xl bg-blue-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-sm transition hover:bg-blue-400"
                  >
                    View More
                  </Link>
                </div>
                <div className={`mt-5 ${homeGridClass}`}>
                  {games.map((game) => (
                    <HomeGameTile key={game.id} game={game} />
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section
        id="popular"
        className={`relative z-10 mt-6 ${sectionWidth} rounded-3xl border border-slate-200 bg-white/70 px-5 py-8 shadow-sm md:mt-10`}
      >
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">HotPool Spotlight</h2>
            <p className="mt-2 hidden max-w-2xl text-xs text-slate-500 md:block">
              Daily HotPool refresh surfaces the six must-play HTML5 games in browsers worldwide.
            </p>
          </div>
          {primaryTag ? (
            <Link href={`/category/${primaryTag.slug}`} className="text-sm font-semibold text-blue-600 hover:text-blue-500">
              See all {primaryTag.name} &rarr;
            </Link>
          ) : null}
        </div>
        <div className={`mt-5 ${homeGridClass}`}>
          {hotPoolGames.map((game) => (
            <HomeGameTile key={game.id} game={game} />
          ))}
        </div>
      </section>

      <section
        id="new"
        className={`mt-8 ${sectionWidth} rounded-3xl border border-blue-100 bg-blue-50/70 px-5 py-8`}
      >
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Fresh Uploads</h2>
            <p className="mt-2 hidden max-w-2xl text-xs text-slate-500 md:block">
              Latest R2 drops, already optimized for instant play and clean SEO previews.
            </p>
          </div>
          <Link href="/#contact" className="text-sm font-semibold text-blue-600 hover:text-blue-500">
            Pitch your game &rarr;
          </Link>
        </div>
        <div className={`mt-5 ${homeGridClass}`}>
          {newest.map((game) => (
            <HomeGameTile key={game.id} game={game} />
          ))}
        </div>
      </section>
      <section
        id="categories"
        className={`mt-8 ${sectionWidth} rounded-3xl border border-slate-200 bg-slate-50 py-8`}
      >
        <div className="flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-[0.5em] text-blue-500">Categories</p>
          <Link href="/#recommended" className="text-xs font-semibold text-blue-600 hover:text-blue-500">
            Back to top &uarr;
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
          {categoryIconList.map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-blue-200 hover:bg-blue-50"
            >
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-bold ${getCategoryAccent(
                  category.slug
                )}`}
              >
                {category.name.slice(0, 2).toUpperCase()}
              </span>
              <span className="text-sm font-semibold text-slate-900">{category.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section
        id="about"
        className={`${sectionWidth} mt-12 rounded-3xl border border-slate-200 bg-white px-6 py-10 text-slate-700`}
      >
        <div className="grid gap-6 md:grid-cols-[1.2fr_1fr] md:items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Why {SITE_NAME}</h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              Built with Next.js App Router and Tailwind CSS, the platform server-renders twenty entries per tag, layers in infinite scroll, and auto-publishes JSON-LD, Open Graph, and Twitter metadata. Cloudflare Pages plus R2 keep assets cached globally while HotPool refreshes daily to spotlight the titles audiences love.
            </p>
          </div>
          <ul className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
              Static hosting on Cloudflare Pages + R2 keeps load times under three seconds worldwide.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
              Sandboxed iframes with fullscreen controls ensure third-party portals stay secure and creator-ready.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
              A portable JSON data layer makes future migrations to a database or CMS effortless.
            </li>
          </ul>
        </div>
      </section>

    </div>
  );
}
