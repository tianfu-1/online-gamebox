# KPOP Games Go — Codex Final Task Document (EN)

This document combines:
1) **Codex Final Task Instructions** (Next.js + Tailwind implementation)
2) **/play/[slug] Final Specification** (layout & behavior)

Hand this whole file to Codex/Copilot/Cursor to generate the codebase.

---

## PART 1 — Codex Final Task Instructions (Next.js + Tailwind)

### GOAL
Implement:
1. A **data normalization script** that reads `/data/game.json` and outputs `/data/games.normalized.json`.
2. Two pages:
   - **Game Detail**: `/game/[slug]` — shows `description`, `how_to_play`, `editors_review` (total 500–600 words), includes a **Play Now** button that links to `/play/[slug]`, and a right sidebar of **20 recommended games**.
   - **Play Page**: `/play/[slug]` — shows title + rating + **iframe** player + short description + **20 recommended games**.
3. **HotPool recommendation logic** (Top by `play_count` ∪ Latest by `created_at`, with same-category priority).
4. Basic **SEO**: per-page meta, JSON-LD (VideoGame), and `sitemap`.
5. Use **Tailwind CSS** only (no separate CSS files).

Site brand: **KPOP Games Go**  
Canonical base: `https://kpopgamesgo.com`

---

### Data Normalization Requirements
- Convert field names to **snake_case**.
- Convert `category` to an **array** and normalize via a mapping table.
- Keep v1.2.1 fields **unchanged**: `play_count`, `created_at`, `updated_at`.
- **Add derived display fields** (not used for logic other than rendering):
  - `rating_value`: stable pseudo-random in **[4.0, 5.0]** (1 decimal) based on a hash of `slug`.
  - `content_rating`: constant **"Everyone 3+"** for all games.

#### Target Schema (after normalization)
```json
{
  "id": 1,
  "title": "",
  "slug": "",
  "thumbnail_url": "",
  "category": [],
  "description": "",
  "how_to_play": "",
  "editors_review": "",
  "file_url": "",
  "play_count": 0,
  "created_at": "2025-10-01T00:00:00Z",
  "updated_at": "2025-10-05T00:00:00Z",
  "rating_value": 4.6,
  "content_rating": "Everyone 3+"
}

Category Normalization Rules (examples)

Fix spelling & merge synonyms:

ACTION GMAES → ACTION GAMES

HIDDEN OBJECT(S) → HIDDEN OBJECT GAMES

ROBOT(S) → ROBOT GAMES

GAMES FOR GIRLS → GIRLS GAMES

GAMES FOR BOYS → BOYS GAMES

CAR RACING GAMES → RACING GAMES

OLYMPICS GAMES → OLYMPIC GAMES

Filter distribution/tech labels (e.g., HTML5, APP STORE, MOBILE, NEW, POPULAR).

If a name doesn’t end with "GAMES", append it (e.g., PUZZLE → PUZZLE GAMES).

Deduplicate via a Set → Array.


Pages
/game/[slug] (Detail)

Header: title + rating_value + content_rating + Play Now (links to /play/[slug]).

Main content: three sections with subheads

Description (100–150 words)

How to Play (150–200 words)

Editor’s Review (200–250 words)

Right sidebar: Recommended 20 using HotPool (at least 5 from same categories + global fill).

/play/[slug] (Play)

Top: title + rating (no extra Play Now on this page).

Middle: iframe using file_url.

Below: short description + How to Play.

Bottom: Recommended 20.

Iframe attributes:\allowFullScreen
allow="fullscreen; gamepad; autoplay; encrypted-media; clipboard-read; clipboard-write; screen-wake-lock; xr-spatial-tracking"
sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-popups allow-top-navigation-by-user-activation"

Recommendation — HotPool

Build HotPool = Top N by play_count (e.g., 200) ∪ Latest N by created_at (e.g., 200), unique by slug.

recommendFor(slug, count=20):

Sample ≥5 from HotPool sharing any category with the current game (exclude current).

Fill remaining from HotPool (exclude duplicates/current).

If still not enough, fill from all games randomly.

Shuffle results.

SEO

<title>: ${game.title} | KPOP Games Go (≤ 60 chars)

<meta name="description">: from description (≤ 160 chars)

Canonical: https://kpopgamesgo.com/game/${slug}

JSON-LD (VideoGame):
{
  "@context": "https://schema.org",
  "@type": "VideoGame",
  "name": "${game.title}",
  "applicationCategory": "Game",
  "operatingSystem": "Web Browser",
  "url": "https://kpopgamesgo.com/game/${game.slug}",
  "image": "${game.thumbnail_url}",
  "contentRating": "${game.content_rating}",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "${game.rating_value}",
    "reviewCount": "1000"
  }
}

Sitemap

Include: /, /game/[slug], /play/[slug].

Use updated_at for lastmod.

Files to Create/Update

scripts/normalize-games.ts
types.ts
lib/data.ts
lib/reco.ts
components/GameTile.tsx
components/Recommended.tsx
app/game/[slug]/page.tsx
app/play/[slug]/page.tsx
app/sitemap.ts

Implementation Order

Run normalization to generate games.normalized.json.

Implement recommendation + data-access helpers.

Build /game and /play pages.

Add SEO + sitemap.

Notes

content_rating is always "Everyone 3+".

rating_value is a stable slug-based pseudo-random 4.0–5.0.

Cloudflare R2 currently without Workers; add unified headers/CSP later if needed.

Third-party iframe whitelist can be added later.

PART 2 — /play/[slug] Final Specification
Behavior

Entering /play/[slug] immediately loads the game in an iframe using file_url.
No "Play Now" button on this page.

Optional: floating Fullscreen button at the top-right of the iframe container.

If embedding is blocked by the source (e.g., X-Frame-Options / frame-ancestors), show a fallback "Open in new tab" link to file_url.

Layout (match your reference mock)

Desktop (≥1280px): Three-column grid
Left Ad (300px) | Center Game column (max ~1100px) | Right Ad (300px)

Tablet (≥768px & <1280px): Hide left ad, keep right ad or stack it below center content.

Mobile (<768px): Only center content; ads collapse into a single ad slot below the iframe.

Style

Background: #0b0b0e

Panel: #111217

Border: #2a2c33

Radius: 16px

Built with Tailwind (no standalone CSS files).

Iframe Container

Tailwind: w-full aspect-[16/9] rounded-2xl border border-[#2a2c33] bg-black overflow-hidden

Attributes:
allowFullScreen
allow="fullscreen; gamepad; autoplay; encrypted-media; clipboard-read; clipboard-write; screen-wake-lock; xr-spatial-tracking"
sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-popups allow-top-navigation-by-user-activation"


Section Order

Title + Rating + content_rating

Iframe (auto-load)

Short Description + How to Play (optional on MVP)

Recommended 20

Ad Slots

Desktop: .ad-left and .ad-right (300×600 or 300×250 placeholders)

Mobile: .ad-mobile below the iframe