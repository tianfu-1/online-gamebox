import json
import re
from datetime import datetime, timedelta
from pathlib import Path
from typing import List

import pandas as pd

DATA_PATH = Path("folder_list.xlsx")
OUTPUT_PATH = Path("src/data/games.json")

CATEGORY_KEYWORDS = [
    ("action", {"action games", "platform games", "fighting games", "shooting games", "gun games", "battle games", "combat games", "parkour games", "runner games", "run games", "rpg games", "stealth games", "ninja games", "stickman games", "survival games", "roblox games", "brainrot games"}),
    ("adventure", {"adventure games", "story games", "quest games", "open world games", "point and click games", "escape games"}),
    ("puzzle", {"puzzle games", "brain games", "logic games", "number games", "word games", "math games", "match 3 games", "maze games", "tile games", "strategy puzzle games"}),
    ("sports", {"sports games", "basketball games", "soccer games", "football games", "golf games", "baseball games", "hockey games", "skate games", "racing sports games", "olympics games"}),
    ("racing", {"racing games", "car games", "driving games", "bike games", "kart games", "car racing games", "police games", "drift games"}),
    ("simulation", {"simulation games", "management games", "tycoon games", "restaurant games", "farming games", "cooking games", "crafting games", "builder games", "city building games", "dating games"}),
    ("strategy", {"strategy games", "tower defense games", "idle games", "tactical games", "card games", "board games", "management games", "defense games"}),
    ("music", {"music games", "rhythm games", "dance games", "kpop games"}),
    ("casual", {"casual games", "arcade games", "idle games", "clicker games", "relaxing games", "cozy games", "easy games", "hyper casual games", "kids games", "funny games", "io games", "arcade", "meme games", "ball games", "html5 games"}),
]

CATEGORY_SUMMARY = {
    "action": {
        "descriptor": "fast-paced action adventure",
        "moment": "chain together dodges, jumps, and quick strikes",
        "control": "Use WASD or the arrow keys to move, tap the space bar for context actions, and click or tap to trigger your abilities.",
    },
    "adventure": {
        "descriptor": "story-driven adventure",
        "moment": "explore curated stages, interact with quirky NPCs, and uncover hidden collectibles",
        "control": "Use WASD or the arrow keys to move, and click or tap highlighted objects to investigate or converse.",
    },
    "puzzle": {
        "descriptor": "thoughtful puzzle experience",
        "moment": "analyze clever layouts, rotate pieces, and line up solutions before the timer slips away",
        "control": "Click or tap tiles to rotate and drag elements, and use keyboard shortcuts for fast resets when chasing better times.",
    },
    "sports": {
        "descriptor": "competitive sports showcase",
        "moment": "time passes, shots, and trick moves to keep the scoreboard in your favor",
        "control": "Use WASD or the arrow keys to position your athlete, press space or enter for key plays, and swipe or tap on mobile for precise aim.",
    },
    "racing": {
        "descriptor": "arcade racing sprint",
        "moment": "nail apexes, manage boosts, and overtake rivals while dodging traffic",
        "control": "Steer with WASD or arrow keys, tap shift for nitro, and tilt or tap on mobile to keep your ride stable.",
    },
    "simulation": {
        "descriptor": "deep simulation sandbox",
        "moment": "balance resources, unlock stations, and keep every system humming",
        "control": "Navigate menus with the mouse or touch, drag-and-drop upgrades into place, and use hotkeys to speed or pause time.",
    },
    "strategy": {
        "descriptor": "tactical strategy build",
        "moment": "draft units, set smart formations, and respond to enemy patterns on the fly",
        "control": "Select with the mouse or touch, assign commands with number keys, and zoom the map to plan multiple fronts.",
    },
    "music": {
        "descriptor": "beat-perfect music challenge",
        "moment": "tap to every note, ride flawless streaks, and unlock new tracks",
        "control": "Use ASD or arrow key chords on desktop, or tap the on-screen pads in tempo-perfect patterns on mobile.",
    },
    "casual": {
        "descriptor": "relaxing casual session",
        "moment": "complete cozy goals, collect rewards, and chase surprising high scores",
        "control": "Play with simple mouse clicks or taps, using drag gestures for precise placement when needed.",
    },
}

TAG_FEATURES = {
    "multiplayer games": "Jump into quick matchmaking or private rooms; lobbies fill fast so friends can join without waiting.",
    "mobile games": "Every interface scales to touch, with generous hit boxes and haptic-ready feedback on supported devices.",
    "new games": "Fresh content drops regularly, so bookmark the page and return after each update to see what changed.",
    "popular games": "The community keeps pushing leaderboards, so you'll always have a new score or build to chase.",
    "idle games": "Progress continues in the background, letting you collect rewards the next time you log in.",
    "3d games": "Optimized WebGL ensures 3D scenes render smoothly even on lightweight laptops and Chromebooks.",
    "2 player games": "Local co-op controls let two players share a keyboard or play side-by-side on tablets.",
    "co-op games": "Communication is key—ping objectives or spam emotes to keep your squad synced.",
    "pve games": "Enemy waves scale gradually, rewarding careful upgrades over button mashing.",
    "pvp games": "Ranked matchmaking studies your performance and pairs you with similarly skilled opponents.",
    "parkour games": "Momentum matters, so plan each leap before committing to the jump line.",
    "tycoon games": "Layer upgrades thoughtfully so your revenue streams stay balanced for future expansions.",
    "crafting games": "Combine resources at the workbench to unlock new recipes and cosmetic upgrades.",
    "cooking games": "Queue recipes efficiently; multitasking is the secret to hitting peak star ratings.",
    "basketball games": "Master release timing on jump shots to trigger perfect swishes during clutch plays.",
    "car racing games": "Experiment with gear ratios and tire choices to dominate longer circuits.",
    "puzzle games": "Take a moment before each move; combos trigger generous score multipliers.",
    "brain games": "Adjust difficulty in the menu to keep challenges sharp without becoming frustrating.",
    "survival games": "Monitor stamina and hunger meters closely when planning deep expeditions.",
    "simulation games": "Use dashboards to track KPIs at a glance and react before bottlenecks appear.",
    "music games": "Toggle practice mode to rehearse tricky note charts before attempting a full combo.",
}

STOPWORDS = {
    "the", "and", "with", "from", "that", "your", "into", "game", "games", "this",
    "also", "over", "each", "you", "will", "easy", "very", "them", "have", "make",
    "more", "than", "ever", "about", "every", "while", "their", "just", "keep",
    "even", "when", "players", "level", "levels", "it's", "its", "feel", "feels",
    "where", "once", "there", "they", "some", "back", "work", "take", "made",
    "most", "play", "time", "like", "been", "also", "for", "into", "really", "little",
}

random_choices = [
    "Daily missions roll over on Pacific Time so American and European players share similar reset windows.",
    "Cloudflare caching keeps bandwidth tiny, which helps the title load fast on school-issued devices.",
    "Session summaries highlight progress milestones so it's easy to clip runs or share tips on social media.",
    "Audio sliders, colorblind-friendly palettes, and reduced-motion toggles make the experience accessible to more players.",
    "HotPool data feeds the homepage modules, so solid engagement can bump the title into the hero rail overnight.",
    "Save data lives in the browser, but export tools let advanced users back up progress before swapping machines.",
]

HOWTO_FILLERS = [
    "If you're on desktop, consider mapping alternate controls through the settings panel to suit your preferred layout.",
    "Mobile users can enable reduced effects in the pause menu to conserve battery during longer sessions.",
    "Weekly challenges rotate on Mondays, making it smart to bank resources over the weekend for new tasks.",
    "A short practice arena is available from the pause menu if you want to test mechanics without risking your streak.",
]

REVIEW_FILLERS = [
    "Live ops hooks like rotating cosmetics and seasonal playlists keep returning players invested without overwhelming newcomers.",
    "The monetization roadmap stays optional-friendly, signalling that design leads understand the SEO-first acquisition funnel.",
    "Telemetry-ready event calls fire on key milestones, making the game easy to plug into analytics once you scale marketing.",
    "We appreciate how keyboard, controller, and touch inputs all feel intentionally tuned instead of one-size-fits-all.",
    "Future sprints could explore creator codes or embeddable widgets, both natural fits for this type of gameplay.",
    "Because save files are lightweight, the team can safely experiment with limited-time modes without bloating storage.",
]


def slugify(value: str) -> str:
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", value.lower())).strip("-")


def split_tags(tag_str: str) -> List[str]:
    if not isinstance(tag_str, str):
        return []
    return [t.strip().lower() for t in tag_str.split(",") if t.strip()]


def choose_category(tags: List[str]) -> str:
    tag_set = set(tags)
    for category, keywords in CATEGORY_KEYWORDS:
        if tag_set & keywords:
            return category
    return "casual"


def extract_keywords(intro: str) -> List[str]:
    words = re.findall(r"[A-Za-z']+", intro.lower())
    keywords = []
    for word in words:
        if len(word) < 4 or word in STOPWORDS:
            continue
        if word not in keywords:
            keywords.append(word)
    return keywords[:5]


def keywords_to_phrase(keywords: List[str]) -> str:
    if not keywords:
        return "surprising twists and satisfying payoffs"
    if len(keywords) == 1:
        return keywords[0]
    return ", ".join(keywords[:-1]) + f" and {keywords[-1]}"


def collect_feature_sentences(tags: List[str]) -> List[str]:
    sentences = []
    for tag in tags:
        sentence = TAG_FEATURES.get(tag)
        if sentence and sentence not in sentences:
            sentences.append(sentence)
    return sentences


def ensure_bounds(text: str, min_words: int, max_words: int, fillers: List[str]) -> str:
    words = text.split()
    if len(words) > max_words:
        trimmed = " ".join(words[:max_words])
        if not trimmed.endswith("."):
            trimmed += "."
        return trimmed
    idx = 0
    while len(words) < min_words:
        if idx >= len(fillers):
            idx = 0
        text = f"{text} {fillers[idx]}"
        words = text.split()
        idx += 1
    if len(words) > max_words:
        return ensure_bounds(text, min_words, max_words, fillers)
    return text


def build_description(game_name: str, category: str, intro: str, tags: List[str]) -> str:
    keywords = extract_keywords(intro)
    phrase = keywords_to_phrase(keywords)
    cat = CATEGORY_SUMMARY[category]
    sentences = [
        f"{game_name} is a {cat['descriptor']} that loads instantly on KPOP Games GO with zero downloads required.",
        f"The core loop invites you to {cat['moment']} while chasing fresh rewards inspired by {phrase}.",
        f"Every arena is cached on Cloudflare R2, so you can restart, experiment, and share progress without leaving your browser.",
    ]
    feature_sentences = collect_feature_sentences(tags)
    if feature_sentences:
        sentences.append(feature_sentences[0])
    sentences.append("Whether you prefer quick sessions or longer marathons, the game scales smoothly across laptops, tablets, and phones.")
    text = " ".join(sentences)
    fillers = random_choices + feature_sentences[1:]
    return ensure_bounds(text, 100, 150, fillers)


def build_how_to_play(category: str, tags: List[str]) -> str:
    cat = CATEGORY_SUMMARY[category]
    sentences = [
        "Start from the Play button and let the edge cache stream the build—loading typically finishes in under three seconds even on school Wi-Fi.",
        cat["control"],
        "Follow the heads-up display for primary objectives, and watch the progress meters along the top bar to avoid missing bonus targets.",
        "Between stages, open the upgrade or wardrobe menu to equip boosts earned through daily missions and HotPool rewards.",
    ]
    feature_sentences = collect_feature_sentences(tags)
    if feature_sentences:
        sentences.append(feature_sentences[0])
    sentences.append("Finish each run by submitting your score so the global leaderboard and recommendation engine can surface your best performances.")
    text = " ".join(sentences)
    fillers = HOWTO_FILLERS + feature_sentences[1:]
    return ensure_bounds(text, 150, 200, fillers)


def build_editors_review(game_name: str, category: str, tags: List[str]) -> str:
    cat = CATEGORY_SUMMARY[category]
    sentences = [
        f"{game_name} nails our SEO-first checklist by pairing a {cat['descriptor']} with quick start times and clean bookmarking hooks.",
        "Visual polish remains consistent throughout, with readable UI layers, responsive typography, and a color palette that pops on both OLED phones and Chromebooks.",
        "The difficulty curve is well considered—early encounters feel welcoming, but later stages introduce modifiers that reward mastery without punishing newcomers.",
        "Audio feedback strikes a good balance between hype and clarity, and the mix never overpowers voice call coordination when you are in multiplayer sessions.",
    ]
    feature_sentences = collect_feature_sentences(tags)
    sentences.extend(feature_sentences[:2])
    sentences.append("We also appreciate the lightweight save format and export tools, which future-proof retention campaigns and make it easy to run influencer drops or classroom pilots.")
    text = " ".join(sentences)
    fillers = REVIEW_FILLERS + feature_sentences[2:]
    return ensure_bounds(text, 200, 250, fillers)


def main() -> None:
    df = pd.read_excel(DATA_PATH, engine="openpyxl")
    base_date = datetime(2025, 1, 1)
    games = []
    total = len(df)
    for index, row in df.iterrows():
        slug = slugify(str(row["name"]))
        game_name = str(row["game_name"]).strip()
        tags = split_tags(row.get("tag", ""))
        if not tags:
            tags = ["casual games"]
        primary_tag_name = tags[0]
        primary_tag_slug = slugify(primary_tag_name)
        summary_category = choose_category(tags)
        description = build_description(game_name, summary_category, str(row.get("intro", "")), tags)
        how_to_play = build_how_to_play(summary_category, tags)
        editors_review = build_editors_review(game_name, summary_category, tags)
        created_at = base_date + timedelta(days=index)
        updated_at = created_at + timedelta(days=7)
        play_count = 52000 - index * 320
        if play_count < 8000:
            play_count = 8000 + (total - index) * 120
        game = {
            "id": index + 1,
            "name": row.get("name"),
            "title": game_name,
            "slug": slug,
            "thumbnail_url": str(row.get("thumbnail_url")),
            "category": primary_tag_slug,
            "primary_tag": primary_tag_name,
            "tags": tags,
            "description": description,
            "how_to_play": how_to_play,
            "editors_review": editors_review,
            "file_url": str(row.get("game_link")),
            "play_count": int(play_count),
            "created_at": created_at.isoformat(),
            "updated_at": updated_at.isoformat(),
        }
        games.append(game)

    OUTPUT_PATH.write_text(json.dumps(games, indent=2), encoding="utf-8")
    print(f"Wrote {len(games)} games to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
