import Exa from "exa-js";

/**
 * Exa client singleton for news monitoring.
 * Reads EXA_API_KEY from environment (set in .env.local).
 */
export function getExaClient(): Exa {
  const apiKey = process.env.EXA_API_KEY;
  if (!apiKey || apiKey === "your_exa_api_key_here") {
    throw new Error(
      "EXA_API_KEY is not configured. Set it in .env.local — get your key from https://dashboard.exa.ai"
    );
  }
  return new Exa(apiKey);
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface NewsArticle {
  title: string;
  url: string;
  publishedDate: string | null;
  author: string | null;
  highlights: string[];
  score: number;
}

export interface NewsSearchResult {
  query: string;
  articles: NewsArticle[];
  searchedAt: string;
}

/* ------------------------------------------------------------------ */
/*  Search: emergency / disaster news for a region                     */
/* ------------------------------------------------------------------ */

export async function searchEmergencyNews(
  query: string,
  opts: {
    numResults?: number;
    hoursBack?: number;
    includeDomains?: string[];
  } = {}
): Promise<NewsSearchResult> {
  const exa = getExaClient();
  const { numResults = 10, hoursBack = 24 } = opts;

  const startDate = new Date(
    Date.now() - hoursBack * 60 * 60 * 1000
  ).toISOString();

  const result = await exa.search(query, {
    type: "auto",
    numResults,
    startPublishedDate: startDate,
    contents: {
      highlights: true,
    },
    ...(opts.includeDomains?.length
      ? { includeDomains: opts.includeDomains }
      : {}),
  });

  const articles: NewsArticle[] = (result.results ?? []).map((r) => ({
    title: r.title ?? "Untitled",
    url: r.url,
    publishedDate: r.publishedDate ?? null,
    author: r.author ?? null,
    highlights: r.highlights ?? [],
    score: r.score ?? 0,
  }));

  return {
    query,
    articles,
    searchedAt: new Date().toISOString(),
  };
}

/* ------------------------------------------------------------------ */
/*  Predefined monitoring queries for Sankatmochan                     */
/* ------------------------------------------------------------------ */

export const MONITOR_QUERIES = {
  maharashtraFloods: "Maharashtra flood disaster emergency rescue latest",
  puneWeather: "Pune heavy rain flood warning weather alert",
  indiaDisaster: "India natural disaster emergency response NDRF latest",
  cycloneAlert: "India cyclone alert warning Bay of Bengal Arabian Sea",
  earthquakeIndia: "India earthquake tremor seismic activity latest",
} as const;

export type MonitorQueryKey = keyof typeof MONITOR_QUERIES;
