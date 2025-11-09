import gamesData from "@/data/games.json";
import type { Game } from "@/types/game";

const games: Game[] = gamesData as Game[];

export const getAllGames = () => [...games];

export const getGameBySlug = (slug: string) => games.find((game) => game.slug === slug);
