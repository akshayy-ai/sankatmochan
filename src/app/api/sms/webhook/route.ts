import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { addCase, analyzeEmergency, nextCaseId } from "@/lib/caseStore";

/**
 * SMS ingest via SMS Gateway for Android (sms-gate.app).
 *
 * An Android handset with the gateway app installed relays inbound SMS here,
 * which reaches people on feature phones and in areas with no data coverage —
 * the callers least able to use Telegram and most likely to need 112.
 *
 * Register with the gateway:
 *   curl -X POST -u USER:PASS -H 'Content-Type: application/json' \
 *     -d '{"url":"https://<host>/api/sms/webhook","event":"sms:received"}' \
 *     https://api.sms-gate.app/3rdparty/v1/webhooks
 *
 * Env:
 *   SMS_GATEWAY_USERNAME, SMS_GATEWAY_PASSWORD  — for sending replies
 *   SMS_GATEWAY_SIGNING_KEY                     — optional, enables HMAC checks
 */

const SMS_USER = process.env.SMS_GATEWAY_USERNAME || "";
const SMS_PASS = process.env.SMS_GATEWAY_PASSWORD || "";
const SIGNING_KEY = process.env.SMS_GATEWAY_SIGNING_KEY || "";
const SMS_API = process.env.SMS_GATEWAY_API_URL || "https://api.sms-gate.app/3rdparty/v1";

/** Replies must fit an SMS; long model output gets truncated on the network. */
const SMS_MAX_CHARS = 300;

type SmsWebhook = {
  deviceId?: string;
  event?: string;
  id?: string;
  payload?: {
    messageId?: string;
    message?: string;
    sender?: string;
    recipient?: string | null;
    simNumber?: number;
    receivedAt?: string;
  };
  webhookId?: string;
};

/**
 * Verify the gateway's HMAC over `rawBody + timestamp`.
 *
 * Skipped when no signing key is configured — the gateway only sends one when
 * you set it, and refusing every request in that case would silently drop SMS.
 */
function signatureValid(rawBody: string, req: NextRequest): boolean {
  if (!SIGNING_KEY) return true;

  const signature = req.headers.get("x-signature") || "";
  const timestamp = req.headers.get("x-timestamp") || "";
  if (!signature || !timestamp) return false;

  // Reject stale payloads so a captured request can't be replayed later.
  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > 300) return false;

  const expected = crypto
    .createHmac("sha256", SIGNING_KEY)
    .update(rawBody + timestamp)
    .digest("hex");

  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature.toLowerCase(), "utf8");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Send an SMS back through the gateway. */
async function sendSms(to: string, text: string): Promise<boolean> {
  if (!SMS_USER || !SMS_PASS) {
    console.warn("[sms] gateway credentials not set; skipping reply");
    return false;
  }

  const body = text.length > SMS_MAX_CHARS
    ? text.slice(0, SMS_MAX_CHARS - 1) + "…"
    : text;
  const auth = Buffer.from(`${SMS_USER}:${SMS_PASS}`).toString("base64");

  // The documented shape is {textMessage:{text}}; newer builds accept a flat
  // {message}. Try the documented one, fall back rather than lose the reply.
  const shapes = [
    { textMessage: { text: body }, phoneNumbers: [to] },
    { message: body, phoneNumbers: [to] },
  ];

  for (const payload of shapes) {
    try {
      const res = await fetch(`${SMS_API}/message`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) return true;
      if (res.status !== 400 && res.status !== 422) {
        console.error(`[sms] send failed ${res.status}: ${await res.text()}`);
        return false;
      }
      // 400/422 — shape rejected, try the next one
    } catch (err) {
      console.error("[sms] send error:", err);
      return false;
    }
  }
  return false;
}

export async function POST(req: NextRequest) {
  // Read the body as text so the HMAC is computed over the exact bytes sent.
  const rawBody = await req.text();

  if (!signatureValid(rawBody, req)) {
    console.warn("[sms] rejected webhook with bad signature");
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let body: SmsWebhook;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  if (body.event && body.event !== "sms:received") {
    return NextResponse.json({ ok: true, ignored: body.event });
  }

  const text = (body.payload?.message || "").trim();
  const sender = body.payload?.sender || "Unknown";

  if (!text) {
    return NextResponse.json({ ok: true, ignored: "empty message" });
  }

  const analysis = await analyzeEmergency(text, { spokenReply: true });

  // Casual messages get a short pointer back, not a case in the queue.
  if (!analysis.is_emergency) {
    await sendSms(
      sender,
      "Sankatmochan 112: Reply with your emergency in any language. For immediate help call 112."
    );
    return NextResponse.json({ ok: true, is_emergency: false });
  }

  const caseId = nextCaseId("SMS");

  addCase({
    id: caseId,
    chatId: 0,
    senderName: sender,
    message: text,
    language: analysis.language,
    englishTranslation: analysis.translation,
    severity: analysis.severity,
    category: analysis.category,
    timestamp: body.payload?.receivedAt || new Date().toISOString(),
    location: analysis.location || "Location not shared",
    channel: "SMS",
    callerNumber: sender,
  });

  console.log(
    `[sms] ${caseId} ${analysis.severity}/${analysis.category} ` +
      `lang=${analysis.language} from=${sender}`
  );

  await sendSms(
    sender,
    `${analysis.response || "Aapki suchna darj kar li gayi hai."} Case: ${caseId}`
  );

  return NextResponse.json({ ok: true, caseId, channel: "sms" });
}

/** Lets you confirm the endpoint is reachable before registering the webhook. */
export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: "sms:received webhook",
    signatureVerification: SIGNING_KEY ? "enabled" : "disabled (no signing key set)",
    replyConfigured: Boolean(SMS_USER && SMS_PASS),
  });
}
