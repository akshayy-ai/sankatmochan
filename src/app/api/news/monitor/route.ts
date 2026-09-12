import { NextRequest, NextResponse } from "next/server";
import { getExaClient, MONITOR_QUERIES, type MonitorQueryKey } from "@/lib/exa";

/**
 * POST /api/news/monitor — create an Exa Monitor for recurring news alerts
 *
 * Body: {
 *   name: string,               // e.g. "Pune Flood Monitor"
 *   topic: MonitorQueryKey,      // predefined query key
 *   query?: string,              // override query text
 *   webhookUrl: string,          // your endpoint to receive results
 *   intervalDays?: number        // default 1 (daily)
 * }
 *
 * Returns the monitor id and the webhookSecret (store it — it's shown only once).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      topic,
      query: customQuery,
      webhookUrl,
      intervalDays = 1,
    } = body as {
      name: string;
      topic?: MonitorQueryKey;
      query?: string;
      webhookUrl: string;
      intervalDays?: number;
    };

    if (!name || !webhookUrl) {
      return NextResponse.json(
        { error: "name and webhookUrl are required" },
        { status: 400 }
      );
    }

    const searchQuery =
      customQuery ??
      (topic ? MONITOR_QUERIES[topic] : MONITOR_QUERIES.indiaDisaster);

    const exa = getExaClient();

    // Use raw fetch since exa-js monitors namespace may vary
    const response = await fetch("https://api.exa.ai/monitors", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.EXA_API_KEY!,
      },
      body: JSON.stringify({
        name,
        search: {
          query: searchQuery,
          contents: { highlights: true },
        },
        trigger: {
          type: "interval",
          period: `${intervalDays}d`,
        },
        webhook: {
          url: webhookUrl,
        },
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      return NextResponse.json(
        { error: `Exa API error: ${response.status}`, detail: errBody },
        { status: response.status }
      );
    }

    const monitor = await response.json();

    // IMPORTANT: webhookSecret is returned only on creation — store it!
    return NextResponse.json({
      id: monitor.id,
      name: monitor.name,
      status: monitor.status,
      webhookSecret: monitor.webhookSecret,
      message:
        "Monitor created. Store the webhookSecret — it cannot be retrieved again.",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * GET /api/news/monitor — list all monitors
 */
export async function GET() {
  try {
    const response = await fetch("https://api.exa.ai/monitors", {
      headers: {
        "x-api-key": process.env.EXA_API_KEY!,
      },
    });

    if (!response.ok) {
      const errBody = await response.text();
      return NextResponse.json(
        { error: `Exa API error: ${response.status}`, detail: errBody },
        { status: response.status }
      );
    }

    const monitors = await response.json();
    return NextResponse.json(monitors);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
