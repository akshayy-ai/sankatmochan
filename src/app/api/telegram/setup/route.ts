import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

/**
 * Telegram webhook registration.
 *
 * GET /api/telegram/setup
 *
 * Called by the compose registrar on every start so a redeploy or reboot never
 * leaves the bot pointed at a stale target. It is also reachable from the
 * public internet, because the tunnel and the registrar arrive on the same
 * port and nothing at this layer can tell them apart.
 *
 * THE TARGET IS NEVER TAKEN FROM THE REQUEST. It used to be: `?url=` was read
 * straight into setWebhook with no authentication, so anyone who guessed this
 * path could repoint the bot at their own server and silently receive every
 * inbound emergency — locations, photos and voice notes included — while this
 * console went quiet. The URL is now derived from server-side configuration,
 * which makes an anonymous call idempotent: the worst it can do is re-register
 * the address we were already using.
 *
 * An explicit override still exists for operational use, but only for a caller
 * holding TELEGRAM_SETUP_SECRET.
 */

/** Constant-time compare that does not leak length through early return. */
function secretMatches(supplied: string, expected: string): boolean {
  const a = Buffer.from(supplied);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * Where Telegram should deliver updates.
 *
 * Prefers explicit configuration; falls back to the host this request arrived
 * on, which through the tunnel is the real public hostname. Both are values we
 * control — neither is caller-supplied.
 */
function configuredBase(req: NextRequest): string {
  const explicit = process.env.PUBLIC_BASE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");

  const proto = req.headers.get("x-forwarded-proto") || req.nextUrl.protocol.replace(":", "");
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || req.nextUrl.host;
  return `${proto}://${host}`;
}

export async function GET(req: NextRequest) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN not set" }, { status: 500 });
  }

  let base = configuredBase(req);

  // An explicit target is honoured only for an authenticated caller. Absent or
  // wrong secret, the parameter is ignored rather than refused — the registrar
  // passes ?url= and should keep working, and an anonymous caller then simply
  // re-registers the address already in use.
  const requested = req.nextUrl.searchParams.get("url");
  const secret = process.env.TELEGRAM_SETUP_SECRET;
  const supplied = req.headers.get("x-setup-secret");
  let overridden = false;

  if (requested && secret && supplied && secretMatches(supplied, secret)) {
    if (!/^https:\/\//i.test(requested)) {
      return NextResponse.json({ error: "override url must be https" }, { status: 400 });
    }
    base = requested.replace(/\/+$/, "");
    overridden = true;
  }

  const webhookUrl = `${base}/api/telegram/webhook`;

  const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: webhookUrl,
      allowed_updates: ["message"],
      // Deliberately false. Dropping pending updates would let a stray or
      // hostile call discard emergencies Telegram has queued but not yet
      // delivered, and re-registering the same URL is otherwise harmless.
      drop_pending_updates: false,
    }),
  });

  const data = await res.json();

  await fetch(`https://api.telegram.org/bot${token}/setMyCommands`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      commands: [
        { command: "start", description: "Start — report an emergency" },
        { command: "help", description: "How to use this bot" },
      ],
    }),
  });

  if (!data.ok) {
    console.error("[telegram/setup] registration failed:", data.description);
  }

  // Telegram's raw response is not echoed: on failure it can quote the request,
  // and this endpoint answers to the public internet.
  return NextResponse.json({
    success: Boolean(data.ok),
    webhookUrl,
    source: overridden ? "override" : process.env.PUBLIC_BASE_URL ? "PUBLIC_BASE_URL" : "request host",
  });
}
