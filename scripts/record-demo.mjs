/**
 * Records a demo of the live Sankatmochan console at 1080p.
 *
 * Nothing here is mocked: it drives the real deployment and fires real
 * messages at the live API, so the cases that appear on screen are genuinely
 * being triaged by the system while the camera rolls.
 *
 *   node scripts/record-demo.mjs
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const SITE = process.env.DEMO_SITE || "https://sankatmochan.rohitdarekar.dpdns.org";
const OUT = "demo-recording";
const CHAT = 770000 + Math.floor(Date.now() % 1000);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Send a message to the live bot webhook, exactly as Telegram would. */
async function send(body) {
  try {
    await fetch(`${SITE}/api/telegram/webhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (e) {
    console.error("send failed:", e.message);
  }
}

const tgText = (text, chatId = CHAT) => ({
  message: { chat: { id: chatId }, from: { first_name: "Caller" }, text },
});

const smsText = (message, sender) => ({
  event: "sms:received",
  payload: { message, sender },
});

async function sendSms(payload) {
  try {
    await fetch(`${SITE}/api/sms/webhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.error("sms failed:", e.message);
  }
}

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  deviceScaleFactor: 1,
  recordVideo: { dir: OUT, size: { width: 1920, height: 1080 } },
});
const page = await context.newPage();

console.log("→ opening console");
await page.goto(SITE, { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForSelector("text=QUEUE", { timeout: 30000 });
await sleep(3500);

// ── Scene 1: a Hindi flood report arrives live ────────────────────────────
console.log("→ scene 1: Hindi flood report");
await send(tgText("नदी का पानी घर में घुस गया है, हम छत पर फंसे हैं"));
await sleep(9000); // poll interval + triage latency

// ── Scene 2: a follow-up joins the SAME case and escalates it ─────────────
console.log("→ scene 2: follow-up detail");
await send(tgText("माँ चल नहीं सकती, दो छोटे बच्चे भी हैं"));
await sleep(9000);

// ── Scene 3: open the case — translation, map, live SLA, action log ───────
console.log("→ scene 3: case detail");
const live = page.locator("text=/TG-[A-Z0-9]+/").first();
if (await live.count()) {
  await live.click();
  await sleep(4500);
  // Let the SLA countdown visibly tick
  await sleep(3000);
  await page.mouse.wheel(0, 420);
  await sleep(3500);
  await page.mouse.wheel(0, 420);
  await sleep(3000);
  await page.mouse.wheel(0, -840);
  await sleep(1500);
}

// ── Scene 4: other languages and channels landing in the same queue ───────
console.log("→ scene 4: multi-channel, multi-language");
await sendSms(smsText("ਮੇਰੀ ਧੀ ਗੁਆਚ ਗਈ ਹੈ, ਉਹ ਪੰਜ ਸਾਲ ਦੀ ਹੈ", "+919800011111"));
await sleep(7000);
await send(tgText("ട്രെയിൻ പാളം തെറ്റി, ധാരാളം പേർക്ക് പരിക്കേറ്റു", CHAT + 1));
await sleep(8000);
await send(tgText("¡Hay un incendio en mi edificio! Mi hija está atrapada", CHAT + 2));
await sleep(9000);

// ── Scene 5: the queue, filled by five channels ───────────────────────────
console.log("→ scene 5: queue overview");
await page.mouse.move(300, 400);
await sleep(2500);
const liveFilter = page.locator("button", { hasText: /^Live$/ }).first();
if (await liveFilter.count()) {
  await liveFilter.click();
  await sleep(4000);
}

// ── Scene 6: the pipeline view ────────────────────────────────────────────
console.log("→ scene 6: pipeline");
const pipeline = page.locator("text=Pipeline").first();
if (await pipeline.count()) {
  await pipeline.click();
  await sleep(6000);
}

console.log("→ done, finalising video");
await context.close();
await browser.close();
console.log(`video written to ./${OUT}/`);
