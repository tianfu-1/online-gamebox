export const SITE_NAME = "KPOP Games GO";
export const SITE_DESCRIPTION =
  "Play 100+ KPOP Games GO browser titles instantly. Discover action, puzzle, racing, sports, and cozy casual hits curated for SEO-driven traffic.";

const defaultBaseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kpopgamesgo.com";

export const absoluteUrl = (path = "/") => new URL(path, defaultBaseUrl).toString();
