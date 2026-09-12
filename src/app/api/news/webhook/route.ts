import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/news/webhook — receives Exa Monitor results
 *
 * When an Exa Monitor triggers, it POSTs search results here.
 * In production, verify the x-exa-signature header using the
 * webhookSecret stored when you created the monitor.
 *
 * For now this logs the results. Extend it to:
 *  - Store in your database
 *  - Push notifications to the dashboard via WebSocket
 *  - Trigger alerts for critical emergency news
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // TODO: Verify webhook signature with stored webhookSecret
    // const signature = req.headers.get("x-exa-signature");
    // if (!verifySignature(signature, body, webhookSecret)) {
    //   return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    // }

    const { monitorId, runId, results } = body;

    console.log(
      `[Exa Webhook] Monitor ${monitorId} · Run ${runId} · ${results?.length ?? 0} results`
    );

    // Process results — e.g., check for disaster keywords and escalate
    if (Array.isArray(results)) {
      const criticalKeywords = [
        "flood",
        "earthquake",
        "cyclone",
        "landslide",
        "tsunami",
        "rescue",
        "evacuation",
        "emergency",
        "NDRF",
        "disaster",
      ];

      const criticalArticles = results.filter((r: { title?: string }) =>
        criticalKeywords.some((kw) =>
          (r.title ?? "").toLowerCase().includes(kw)
        )
      );

      if (criticalArticles.length > 0) {
        console.log(
          `[Exa Webhook] 🚨 ${criticalArticles.length} critical articles detected`
        );
        // TODO: Push to dashboard, send alerts, etc.
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Exa Webhook] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
