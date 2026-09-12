import { NextRequest, NextResponse } from "next/server";

/**
 * Vobiz inbound-call answer webhook.
 *
 * Vobiz POSTs here when a call reaches the Sankatmochan number, and we reply
 * with Voice XML telling it what to do: greet the caller, then open a speech
 * Gather whose transcript is delivered to /api/vobiz/gather.
 *
 * Configure this URL as the Answer URL on the Vobiz number.
 * Vobiz sends: CallUUID, From, To, Direction
 */

const GATHER_LANGUAGE = process.env.VOBIZ_GATHER_LANGUAGE || "hi-IN";

/** Phrases that bias recognition toward emergency vocabulary. */
const HINTS = [
  "आग",
  "एम्बुलेंस",
  "पुलिस",
  "बाढ़",
  "दुर्घटना",
  "मदद",
  "फंस गया",
  "सांस",
  "खून",
  "ambulance",
  "fire",
  "police",
  "flood",
  "accident",
  "help",
  "trapped",
].join(",");

function xml(body: string) {
  return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?>\n${body}`, {
    status: 200,
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}

/** Absolute URL for the gather callback, derived from the inbound request. */
function gatherActionUrl(req: NextRequest) {
  const base =
    process.env.PUBLIC_BASE_URL ||
    `${req.nextUrl.protocol}//${req.nextUrl.host}`;
  return `${base.replace(/\/$/, "")}/api/vobiz/gather`;
}

function buildAnswerXml(action: string) {
  return `<Response>
  <Speak language="hi-IN">नमस्ते। आप एक सौ बारह आपातकालीन सेवा से जुड़े हैं। कृपया अपनी आपात स्थिति बताइए।</Speak>
  <Gather inputType="speech"
          language="${GATHER_LANGUAGE}"
          speechEndTimeout="auto"
          speechModel="phone_call"
          hints="${HINTS}"
          action="${action}"
          method="POST">
    <Speak language="hi-IN">बोलिए।</Speak>
  </Gather>
  <Speak language="hi-IN">हमें कोई आवाज़ नहीं मिली। कृपया दोबारा कॉल कीजिए।</Speak>
</Response>`;
}

export async function POST(req: NextRequest) {
  return xml(buildAnswerXml(gatherActionUrl(req)));
}

/** Vobiz can be configured for GET; support both so the number just works. */
export async function GET(req: NextRequest) {
  return xml(buildAnswerXml(gatherActionUrl(req)));
}
