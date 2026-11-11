/** Who reads a chapter of the chronicle (workspace spec 102): every member of the campaign, or only its masters. */
export const CHAPTER_VISIBILITIES = ['public', 'master'] as const;
export type ChapterVisibility = (typeof CHAPTER_VISIBILITIES)[number];

/** Most chapters a campaign holds, and longest Markdown of one (spec 102, decision 2). */
export const MAX_CHRONICLE_CHAPTERS = 200;
export const MAX_CHAPTER_CONTENT_LENGTH = 200_000;
export const MAX_CHAPTER_TITLE_LENGTH = 200;

/** A chapter of the chronicle of a campaign: a Markdown document (workspace spec 102). */
export interface ChronicleChapter {
  id: string;
  gameId: string;
  title: string;
  /** Markdown; absent in the list, which only carries the summaries. */
  content?: string;
  visibility: ChapterVisibility;
  order: number;
  /** The day of the campaign calendar when it happens (1 = the start date), if any. */
  campaignDate?: number | null;
  owner: string;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
  version: number;
}

export interface CreateChronicleChapterDto {
  gameId: string;
  title: string;
  content?: string;
  visibility?: ChapterVisibility;
  campaignDate?: number | null;
}

export interface UpdateChronicleChapterDto {
  title?: string;
  content?: string;
  visibility?: ChapterVisibility;
  campaignDate?: number | null;
  /** The version the change was made from: a stale one is a 409 `version-conflict`. */
  version?: number;
}
