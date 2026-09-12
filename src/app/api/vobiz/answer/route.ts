import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { openCall } from "@/lib/callSession";

/**
 * Vobiz inbound-call answer webhook.
 *
 * The case is filed here, the moment the call connects — before the caller has
 * said anything. Nothing about their record then depends on the call ending
 * gracefully: a line that drops after two seconds still leaves an operator a
 * case with the number that rang.
 *
 * Configure this URL as the Answer URL on the Vobiz number.
 */

const GATHER_LANGUAGE = process.env.VOBIZ_GATHER_LANGUAGE || "hi-IN";

/** Phrases that bias recognition toward emergency vocabulary. */
const HINTS = [
  "आग", "एम्बुलेंस", "पुलिस", "बाढ़", "दुर्घटना", "मदद", "फंस गया",
  "सांस", "खून", "बेहोश", "भूकंप", "वाचवा", "मदत",
  "ambulance", "fire", "police", "flood", "accident", "help", "trapped",
].join(",");

function xml(body: string) {
  return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?>\n${body}`, {
    status: 200,
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}

async function readParams(req: NextRequest): Promise<Record<string, string>> {
  const ct = req.headers.get("content-type") || "";
  try {
    if (ct.includes("application/json")) return await req.json();
    const form = await req.formData();
    return Object.fromEntries(
      Array.from(form.entries()).map(([k, v]) => [k, String(v)])
    );
  } catch {
    return Object.fromEntries(req.nextUrl.searchParams.entries());
  }
}

/**
 * Absolute origin for callbacks.
 *
 * req.nextUrl reflects the container's bind address behind the tunnel, so a
 * callback built from it sends the caller's speech nowhere.
 */
function baseUrl(req: NextRequest) {
  const explicit = process.env.PUBLIC_BASE_URL;
  const fwdHost = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const fwdProto = req.headers.get("x-forwarded-proto") || "https";
  const base =
    explicit ||
    (fwdHost && !fwdHost.startsWith("0.0.0.0") && !fwdHost.startsWith("127.")
      ? `${fwdProto}://${fwdHost}`
      : `${req.nextUrl.protocol}//${req.nextUrl.host}`);
  return base.replace(/\/$/, "");
}

function buildAnswerXml(action: string, redirect: string) {
  // Every document we emit contains a Gather. A response without one hangs up,
  // which is how the previous version dropped callers it could not understand.
  return `<Response>
  <Speak language="hi-IN">नमस्ते। आप एक सौ बारह आपातकालीन सेवा से जुड़े हैं। कृपया अपनी आपात स्थिति बताइए।</Speak>
  <Gather inputType="speech dtmf"
          language="${GATHER_LANGUAGE}"
          timeout="7"
          speechEndTimeout="auto"
          speechModel="phone_call"
          numDigits="1"
          hints="${HINTS}"
          action="${action}"
          method="POST">
    <Speak language="hi-IN">बोलिए, मैं सुन रहा हूँ।</Speak>
  </Gather>
  <Redirect>${redirect}</Redirect>
</Response>`;
}

export async function POST(req: NextRequest) {
  const p = await readParams(req);
  // Never key a session on an empty string — calls.get("") would hand the next
  // caller the previous caller's session, and their speech would append to a
  // stranger's case.
  const uuid = (p.CallUUID || "").trim() || `synthetic-${randomUUID()}`;
  const from = p.From || "Unknown";

  const s = openCall(uuid, from);
  const b = baseUrl(req);
  const q = `case=${encodeURIComponent(s.caseId)}&uuid=${encodeURIComponent(uuid)}`;

  console.log(`[vobiz] call connected ${s.caseId} from=${from} uuid=${uuid}`);

  return xml(
    buildAnswerXml(`${b}/api/vobiz/gather?${q}`, `${b}/api/vobiz/gather?${q}&silent=1`)
  );
}

/** Health response only — an uptime monitor must not file an emergency case. */
export async function GET() {
  return NextResponse.json({ ok: true, endpoint: "vobiz answer" });
}
