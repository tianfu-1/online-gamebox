import type { Category } from "@/types/category";
import { tagSummaries, getTagBySlug as resolveTag } from "@/lib/tags";

export const categories: Category[] = tagSummaries;

export const getCategoryBySlug = (slug: string): Category | undefined => resolveTag(slug);
