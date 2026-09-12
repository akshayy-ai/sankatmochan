import { NextRequest, NextResponse } from "next/server";
import {
  searchEmergencyNews,
  MONITOR_QUERIES,
  type MonitorQueryKey,
} from "@/lib/exa";

/**
 * GET /api/news?topic=puneWeather&hours=24&limit=10
 *
 * Queries Exa for recent emergency / disaster news.
 *  - topic  — one of the predefined MonitorQueryKey names, or "custom"
 *  - q      — custom query string (required when topic=custom)
 *  - hours  — how far back to search (default 24)
 *  - limit  — max results (default 10, max 50)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const topic = (searchParams.get("topic") ?? "indiaDisaster") as
      | MonitorQueryKey
      | "custom";
    const customQuery = searchParams.get("q") ?? "";
    const hours = Math.min(
      Math.max(Number(searchParams.get("hours") ?? 24), 1),
      720 // max 30 days
    );
    const limit = Math.min(
      Math.max(Number(searchParams.get("limit") ?? 10), 1),
      50
    );

    let query: string;
    if (topic === "custom") {
      if (!customQuery) {
        return NextResponse.json(
          { error: "Query parameter 'q' is required when topic=custom" },
          { status: 400 }
        );
      }
      query = customQuery;
    } else {
      query = MONITOR_QUERIES[topic] ?? MONITOR_QUERIES.indiaDisaster;
    }

    const result = await searchEmergencyNews(query, {
      numResults: limit,
      hoursBack: hours,
    });

    return NextResponse.json(result);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown error";
    const status = message.includes("EXA_API_KEY") ? 500 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
