# Sankatmochan — 2 Minute Demo Script

**Live:** https://sankatmochan.rohitdarekar.dpdns.org
**Bot:** [@sankatmochan_112_bot](https://t.me/sankatmochan_112_bot)

Built to the AI Tinkerers video guide. Two rules from it worth holding onto:

- **Target 2:00.** The guide says 2–4 min; the submission form says 2 min and that
  longer videos may deduct points. The form wins.
- **"Production quality does not affect your judging score."** Don't edit. One
  clean QuickTime screen recording with your phone in frame is the whole job.

---

## Before you record

- [ ] Dashboard in a **clean browser window** — no bookmarks bar, no other tabs
- [ ] Telegram open on your **phone**, chat with the bot cleared
- [ ] The Hindi lines below **copy-pasteable on your phone** — don't type Devanagari on camera
- [ ] Do one full dry run. Know the ~3–6 s beat between sending and the case appearing.

> **The single most important thing:** when you send the message, **point at the
> screen and stop talking.** Let it land in silence. That pause is the demo.
> Filling it with "um, it should come through any second" kills it.

---

## 0:00 — Overview (30 s)

> "India's 112 emergency line takes about 200 million calls a year, across 22
> official languages. The operator picking up in Pune speaks Marathi and Hindi.
> When a call comes in Telugu or Bengali, the first ninety seconds go to working
> out what language it even is — before anyone finds out someone is drowning.
>
> Sankatmochan is an agent that lives inside the emergency console. Five ways in,
> one triaged queue out. Everything you're about to see is a live API call."

---

## 0:30 — Feature 1: live multilingual ingest (35 s) ← **the demo**

Pick up your phone.

> "I'll report an emergency in Hindi, from my own phone. Nothing staged."

Send:
```
नदी का पानी घर में घुस गया है, हम छत पर फंसे हैं
```

**Point at the screen. Say nothing.** When the case appears:

> "Three seconds. Detected Hindi, translated it, classified it CRITICAL, category
> FLOOD, geocoded the location, started an eight-minute SLA countdown."

---

## 1:05 — Feature 2: it's a conversation, not a form (25 s)

Send a follow-up:
```
माँ चल नहीं सकती, दो बच्चे भी हैं
```

> "That's not a new case — it joins the one already open. And it's triaged *with*
> the incident: on its own that line is a fragment, in context it escalates the
> flood. Follow-up detail is where emergency calls actually live."

Click the case, show the turn history.

---

## 1:30 — Feature 3: the channel that matters most (20 s)

> "Photos, where AI vision reads a scene the caller can't describe. Voice notes,
> transcribed and translated. Phone calls, answered and triaged in Hindi.
>
> And SMS — which works on a ₹800 feature phone with no data. Every other demo
> today needs a smartphone. SMS reaches the people who actually dial 112."

---

## 1:50 — Stack, team, close (10 s)

> "OpenAI for vision, transcription and triage. CopilotKit for the operator
> copilot. Exa for live disaster news. Ambiguous AI for dispatch. Auth0, Vobiz,
> Telegram. Deployed behind a Cloudflare tunnel — live right now.
>
> Team Agentic Mindmesh. Message the bot yourself; it answers in your language."

---

## If you have a Vobiz number

Swap this in for Feature 3 — it's stronger than describing channels.

Set the number's Answer URL to:
```
https://sankatmochan.rohitdarekar.dpdns.org/api/vobiz/answer
```

**Call it on camera.** It answers in Hindi, you speak, it asks a follow-up
question, and the case appears on the dashboard as you talk.

> "That's a real phone call. No app, no smartphone. Which matters, because the
> people who most need 112 usually have neither."

---

## Say these; don't say those

**Do say** — all true and verifiable:
- "Every classification you're seeing is a live API call"
- "15 languages tested — 10 Indian, plus Spanish, French, Japanese, German, Arabic"
- "Deployed and public, not localhost"

**Don't say:**
- ❌ "Production-ready" — cases are in-memory and reset on restart
- ❌ "Dispatches units" — it files cases for an operator; it dispatches nothing
- ❌ "Real-time database" — there's no database

If a judge asks about persistence, say plainly that it's in-memory and a database
is the first thing you'd add. A known limitation stated out loud reads as
engineering maturity; the same limitation discovered by a judge reads as overselling.

---

## If the ingest stalls on camera

Don't narrate the failure. Say *"while that comes through"*, click an existing
case, show the map and the action log, then come back to it. Never say "hmm,
that's weird" — it's 20 seconds of dead air you can't edit out if you're not editing.

---

## Health check, right before you hit record

```bash
curl -s -o /dev/null -w "site: %{http_code}\n" https://sankatmochan.rohitdarekar.dpdns.org/
curl -s "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getWebhookInfo" | python3 -m json.tool
```

Expect `200`, a `url` matching the domain, `pending_update_count: 0`, and no
`last_error_message`.

---

## Upload

YouTube → **Unlisted** (or Public). Paste the watch URL into the form's video field.
Google Drive and LinkedIn links are rejected by the form.
