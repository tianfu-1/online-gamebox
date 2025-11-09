export interface Game {
  id: number;
  title: string;
  slug: string;
  thumbnail_url: string;
  category: string[];
  description: string;
  how_to_play: string;
  editors_review: string;
  file_url: string;
  play_count: number;
  created_at: string;
  updated_at: string;
  rating_value?: number;
  content_rating?: string;
}
