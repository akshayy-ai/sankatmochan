/**
 * Records the operator console showing the cases raised during the live
 * Telegram shoot. Nothing is sent here — these are the real cases already in
 * the queue, so the footage cuts together with the Telegram-side recording.
 *
 *   node scripts/record-dashboard.mjs
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const SITE = process.env.DEMO_SITE || "https://sankatmochan.rohitdarekar.dpdns.org";
const OUT = "demo-recording/dashboard";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  recordVideo: { dir: OUT, size: { width: 1920, height: 1080 } },
});
const page = await context.newPage();

/** The tab buttons sit under an overlay, so a plain click silently no-ops. */
async function openTab(name, proof) {
  for (let i = 0; i < 6; i++) {
    await page.getByRole("button", { name }).click({ force: true });
    await sleep(1200);
    if (await page.locator(`text=${proof}`).count()) return true;
  }
  return false;
}

console.log("→ opening console");
await page.goto(SITE, { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForSelector("text=QUEUE", { timeout: 30000 });
await sleep(4000);

// ── The queue: four incidents, four languages, two channels ───────────────
console.log("→ queue");
await page.mouse.move(300, 300);
await sleep(2000);
await page.mouse.move(300, 420);
await sleep(2000);
await page.mouse.move(300, 540);
await sleep(2500);

// ── The conversation case — two turns on one incident ─────────────────────
console.log("→ Hindi conversation case");
const hindi = page.locator("text=/TG-MTYNO62801/").first();
if (await hindi.count()) {
  await hindi.click({ force: true });
  await sleep(5000);            // header: severity, SLA counting down
  await page.mouse.wheel(0, 400);
  await sleep(4000);            // source script beside English, map
  await page.mouse.wheel(0, 450);
  await sleep(4500);            // action log — the turns
  await page.mouse.wheel(0, -850);
  await sleep(2000);
} else {
  console.log("  ! Hindi case not found — was the queue reset?");
}

// ── Other languages, each its own case ────────────────────────────────────
for (const [label, id] of [
  ["Punjabi over SMS", "SMS-MTYNPCE802"],
  ["Malayalam", "TG-MTYNPJ6N03"],
  ["Spanish", "TG-MTYNPQ1Q04"],
]) {
  const row = page.locator(`text=/${id}/`).first();
  if (await row.count()) {
    console.log(`→ ${label}`);
    await row.click({ force: true });
    await sleep(5000);
  }
}

// ── The pipeline ──────────────────────────────────────────────────────────
console.log("→ pipeline");
if (await openTab(/Pipeline/, "Multi-Channel Ingest")) {
  await sleep(7000);
} else {
  console.log("  ! pipeline tab did not open");
}

console.log("→ finalising");
await context.close();
await browser.close();
console.log(`video → ./${OUT}/`);
