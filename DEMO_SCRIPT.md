# Sankatmochan — 2 Minute Demo Script

**Live:** https://sankatmochan.rohitdarekar.dpdns.org
**Bot:** [@sankatmochan_112_bot](https://t.me/sankatmochan_112_bot)

---

## Before you hit record

- [ ] Open https://sankatmochan.rohitdarekar.dpdns.org in a **clean browser window** (no bookmarks bar, no tabs)
- [ ] Open Telegram on your **phone**, chat with `@sankatmochan_112_bot`, send `/start` once and clear the screen
- [ ] Have the Hindi message below **copy-pasteable** on your phone so you aren't typing Devanagari on camera
- [ ] Screen layout: dashboard fills the screen, phone held in frame (or screen-mirrored beside it)

> **Rehearse the ingest once.** A case takes ~3-6s to appear (3s poll + model latency). Know that beat so you don't fill it with "um".

---

## The script

### 0:00 — The problem (15s)

> "India's 112 emergency line takes about 200 million calls a year, across 22 official languages.
> But the operator picking up in Pune speaks Marathi and Hindi. When a call comes in Telugu or
> Bengali, the first ninety seconds are spent working out *what language this even is* — before
> anyone finds out someone is drowning."

### 0:15 — What it is (10s)

Dashboard on screen, queue visible.

> "Sankatmochan is a multilingual emergency response console. Four channels in, one queue out —
> and every case you see here arrived through a real API."

### 0:25 — The live ingest (40s) ← **this is the demo**

Pick up your phone. Say what you're doing *while* you do it.

> "I'm going to report an emergency, in Hindi, from my own phone. Nothing staged."

Send this to the bot:

```
नदी का पानी घर में घुस गया है, हम छत पर फंसे हैं, दो बच्चे भी साथ हैं
```

*(River water has entered the house, we're trapped on the roof, two children with us)*

Then — **point at the screen and stop talking.** Let it land.

When the case appears:

> "Three seconds. Detected Hindi, translated it, classified it CRITICAL, category FLOOD,
> geocoded the location, and started an eight-minute SLA countdown. The operator never
> had to know what language that was."

Click the case. Scroll the timeline.

> "And every step is auditable — language ID, translation, classification, each one logged."

### 1:05 — The other channels (30s)

Send a **voice note** in Hindi. While it processes:

> "Voice note — Whisper transcribes it, then the same triage runs. Because in a real
> emergency people don't type, they shout."

Then send a **photo** (fire, flood, accident — anything).

> "And a photo. GPT-4o vision reads the scene — what's burning, how many people, what
> hazards are visible. A caller who can't describe it can just show it."

### 1:35 — Why it's agentic (15s)

> "Nobody clicked anything. The system watched a channel, decided what mattered, triaged it,
> and put it in front of a human with the context already assembled. The operator arrives
> to a decision, not a transcript."

### 1:50 — Close (10s)

> "Live right now at sankatmochan.rohitdarekar.dpdns.org. Message the bot yourself —
> it'll answer in your language."

---

## If you have a Vobiz number

Swap this in at 1:05 — it's stronger than the voice note.

Set the number's Answer URL to:
```
https://sankatmochan.rohitdarekar.dpdns.org/api/vobiz/answer
```

Then **call it on camera**. The line answers in Hindi, you speak Hindi, it replies in Hindi
with a case number — and the case appears on the dashboard as you hang up.

> "That's a real phone call. No app, no smartphone needed. Which matters, because the
> people who most need 112 are often the ones without either."

---

## Guardrails

**Do not** say "real-time database" or "production-ready". Cases live in memory and reset on
restart. If asked, say so plainly — judges respect a known limitation far more than a bluff.

**Do** say the SLA timers, geocoding, weather and translations are live API calls, because
they are. The seeded cases in the queue are illustrative; the ones you create on camera are not.

**If ingest stalls** — don't narrate the failure. Say "while that comes through" and click an
existing case to show the timeline and map. Come back to it.

---

## Health check before recording

```bash
curl -s -o /dev/null -w "site: %{http_code}\n" https://sankatmochan.rohitdarekar.dpdns.org/
curl -s "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getWebhookInfo" | python3 -m json.tool
```

Expect `200`, and a `url` matching the domain with `pending_update_count: 0`.
