/**
 * Generates a narration track for the recorded demo and muxes it onto the video.
 *
 * Each segment is spoken by OpenAI TTS and laid down at a fixed offset that
 * matches the scene timings in record-demo.mjs, so the narration describes
 * what is actually on screen at that moment.
 *
 *   node scripts/narrate-demo.mjs
 */
import { mkdirSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const KEY =
  process.env.OPENAI_API_KEY ||
  (readFileSync(".env.local", "utf8").match(/^OPENAI_API_KEY=(.+)$/m)?.[1] ?? "");

if (!KEY) {
  console.error("OPENAI_API_KEY not found");
  process.exit(1);
}

const VOICE = process.env.DEMO_VOICE || "onyx";
const TMP = "demo-recording/narration";
mkdirSync(TMP, { recursive: true });

/**
 * Offsets match the sleeps in record-demo.mjs. Kept deliberately short of each
 * scene's length — narration that runs past its scene describes the wrong
 * thing on screen, which is worse than a gap of silence.
 */
const SEGMENTS = [
  {
    at: 1.0,
    text: "India's 112 emergency line takes about 200 million calls a year, across 22 official languages. The operator picking up in Pune speaks two of them.",
  },
  {
    at: 10.0,
    text: "A flood report arrives in Hindi, from a phone. Three seconds later it's on the operator's queue: language detected, translated, classified critical, geocoded, with an S L A countdown already running.",
  },
  {
    at: 23.0,
    text: "The caller sends more detail. It doesn't create a second case — it joins the first, and it's triaged with the incident, so the follow-up escalates the flood instead of becoming a meaningless fragment.",
  },
  {
    at: 38.0,
    text: "The original script beside the English translation, a live map, and every step logged: language identification, translation, classification.",
  },
  {
    at: 50.0,
    text: "Punjabi over S M S, from a feature phone with no data. Malayalam. Spanish. Fifteen languages tested, with no language configured anywhere.",
  },
  {
    at: 64.0,
    text: "Five channels in — S M S, text, voice notes, photos, and phone calls — one triaged queue out. Nobody clicked anything.",
  },
];

async function tts(text, out) {
  const res = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4o-mini-tts",
      voice: VOICE,
      input: text,
      // Measured, calm — this is an emergency system, not an advert.
      instructions:
        "Speak calmly and clearly, like a documentary narrator. Measured pace, no hype.",
      response_format: "mp3",
    }),
  });
  if (!res.ok) throw new Error(`TTS ${res.status}: ${(await res.text()).slice(0, 200)}`);
  writeFileSync(out, Buffer.from(await res.arrayBuffer()));
}

// Largest webm is the full-session recording.
const vids = readdirSync("demo-recording")
  .filter((f) => f.endsWith(".webm"))
  .map((f) => ({ f: `demo-recording/${f}`, s: statSync(`demo-recording/${f}`).size }))
  .sort((a, b) => b.s - a.s);
const VIDEO = vids[0].f;
console.log("video:", VIDEO);

for (const [i, seg] of SEGMENTS.entries()) {
  const out = `${TMP}/seg${i}.mp3`;
  console.log(`→ tts ${i} @${seg.at}s`);
  await tts(seg.text, out);
}

// Lay each segment at its offset on one silent bed, then mux with the video.
const inputs = SEGMENTS.flatMap((_, i) => ["-i", `${TMP}/seg${i}.mp3`]);
const delays = SEGMENTS.map(
  (s, i) => `[${i + 1}:a]adelay=${Math.round(s.at * 1000)}|${Math.round(s.at * 1000)}[a${i}]`
).join(";");
const mix = SEGMENTS.map((_, i) => `[a${i}]`).join("");

execFileSync(
  "ffmpeg",
  [
    "-y",
    "-i", VIDEO,
    ...inputs,
    "-filter_complex",
    `${delays};${mix}amix=inputs=${SEGMENTS.length}:normalize=0[aout]`,
    "-map", "0:v",
    "-map", "[aout]",
    "-c:v", "libx264",
    "-preset", "medium",
    "-crf", "20",
    "-pix_fmt", "yuv420p",
    "-c:a", "aac",
    "-b:a", "192k",
    "-shortest",
    "sankatmochan-demo.mp4",
  ],
  { stdio: "inherit" }
);

console.log("→ sankatmochan-demo.mp4");
