/**
 * Records the AI voice agent taking a real 112 call.
 *
 * Chromium is launched with a fake microphone fed from a WAV file, so the
 * Realtime agent genuinely hears a Hindi emergency and responds — the
 * transcript on screen is a real conversation with OpenAI's Realtime API, not
 * a scripted animation.
 *
 *   node scripts/record-voicecall.mjs
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const SITE = process.env.DEMO_SITE || "https://sankatmochan.rohitdarekar.dpdns.org";
const OUT = "demo-recording/voicecall";
const MIC = resolve("demo-recording/caller_mic.wav");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  args: [
    // Grant mic without a prompt, and play the WAV in place of a real device.
    "--use-fake-ui-for-media-stream",
    "--use-fake-device-for-media-capture",
    `--use-file-for-fake-audio-capture=${MIC}`,
    "--autoplay-policy=no-user-gesture-required",
  ],
});

const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  permissions: ["microphone"],
  recordVideo: { dir: OUT, size: { width: 1920, height: 1080 } },
});
const page = await context.newPage();

// Surface what the agent says, so a failure is diagnosable from the log.
page.on("console", (m) => {
  const t = m.text();
  if (/realtime|transcript|case|error/i.test(t)) console.log("  [page]", t.slice(0, 160));
});

console.log("→ opening console");
await page.goto(SITE, { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForSelector("text=QUEUE", { timeout: 30000 });
await sleep(2500);

console.log("→ switching to the voice tab");
// The tab is a button labelled "📞 Voice" and something overlays it, so a
// plain click silently no-ops. Force it, and verify the panel actually
// appeared rather than trusting the click.
let opened = false;
for (let i = 0; i < 6 && !opened; i++) {
  await page.getByRole("button", { name: /Voice/ }).click({ force: true });
  await sleep(1500);
  opened = await page.locator("text=Start 112 Call").count() > 0;
}
if (!opened) throw new Error("voice panel never opened");
console.log("  panel open");
await sleep(2000);

console.log("→ starting the call");
await page.getByRole("button", { name: /Start 112 Call/i }).click({ force: true });
console.log("  call started");

// The agent greets, hears the Hindi report, and replies. The WAV holds ~25s of
// padding after the speech so there is room for the response.
console.log("→ call in progress (60s)");
for (let i = 0; i < 12; i++) {
  await sleep(5000);
  const txt = await page.locator("body").innerText().catch(() => "");
  const line = txt.split("\n").reverse().find((l) => /[\u0900-\u097F]/.test(l) && l.length > 8);
  console.log(`  t+${(i + 1) * 5}s — ${line ? line.slice(0, 70) : "(no transcript yet)"}`);
}

console.log("→ back to the console to show the case");
const consoleTab = page.locator("text=/^Console$/i").first();
if (await consoleTab.count()) {
  await consoleTab.click();
  await sleep(6000);
}

await context.close();
await browser.close();
console.log(`video → ./${OUT}/`);
