import type { MetadataRoute } from "next";
import { categories } from "@/data/categories";
import { getAllGames } from "@/lib/games";
import { absoluteUrl } from "@/lib/site";
import { CATEGORY_CURATED_SET } from "@/config/category-whitelist";

export default function sitemap(): MetadataRoute.Sitemap {
  const games = getAllGames();

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  const categoryEntries: MetadataRoute.Sitemap = categories
    .filter((category) => CATEGORY_CURATED_SET.has(category.slug))
    .map((category) => ({
      url: absoluteUrl(`/category/${category.slug}`),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    }));

  const gameEntries: MetadataRoute.Sitemap = games.flatMap((game) => [
    {
      url: absoluteUrl(`/game/${game.slug}`),
      lastModified: new Date(game.updated_at),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: absoluteUrl(`/play/${game.slug}`),
      lastModified: new Date(game.updated_at),
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ]);

  return [...staticEntries, ...categoryEntries, ...gameEntries];
}
