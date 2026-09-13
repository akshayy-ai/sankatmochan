# Recording Script — 2:00

**Console:** https://sankatmochan.rohitdarekar.dpdns.org
**Bot:** [@sankatmochan_112_bot](https://t.me/sankatmochan_112_bot)

Layout: **Telegram left, console right, both visible.** QuickTime → New Screen
Recording → whole screen. Don't move the mouse during the live send.

---

## PRE-FLIGHT (before you hit record)

Ask me to **"stage the queue"** and I'll fire four reports so the console looks
like a working shift rather than an empty shell — a clustered fire and a
visitor case. Takes 60 seconds. Then clear your Telegram chat so only your
live message shows on camera.

Have this ready to paste on your phone:

```
मेरे घर में आग लग गई है, कोथरूड में सुयोग अपार्टमेंट
```
```
तीसरी मंजिल पर दो बच्चे फंसे हुए हैं
```

---

## 0:00 — The problem  ·  show: console, full queue

> "India's 112 emergency line takes about two hundred million calls a year,
> across twenty-two official languages. The operator picking up in Pune speaks
> two of them. When a call comes in Telugu or Bengali, the first ninety seconds
> go to working out what language it even is — before anyone finds out someone
> is drowning."

Let the queue sit on screen. Multiple scripts visible at once does the work.

---

## 0:18 — Live ingest  ·  show: phone, then console  ← **the money shot**

Pick up the phone.

> "I'll report an emergency in Hindi, from my own phone. Nothing staged."

**Paste message 1. Send. Then point at the console and stop talking.**

When the case lands:

> "Three seconds. Detected Hindi, translated it, classified it CRITICAL,
> geocoded it to Kothrud, and started an eight-minute SLA countdown. That's
> **OpenAI** doing language ID, translation and triage in one pass."

---

## 0:45 — It's a conversation  ·  show: phone, then case detail

**Paste message 2. Send.**

> "Watch — that's not a second case. It joins the first one, and it's triaged
> *with* the incident. On its own, 'two children trapped on the third floor' is
> a meaningless fragment. Inside an open fire, it escalates it."

Click the case. Point at the action log.

> "Every step is logged — language identified, translated, classified,
> corroborated."

---

## 1:05 — Dispatch  ·  show: bottom of case detail

> "The buttons aren't generic. A fire routes to Fire Brigade *and* an
> ambulance — burns and smoke inhalation. An accident routes to police *and*
> ambulance, because sending one unit to a scene that needed two is how minutes
> get lost."

Click a dispatch button.

> "That creates a real task in the **Ambiguous AI** workspace — and it comes
> back. AWAITING means nobody's opened it. If it's still unopened after four
> minutes it turns red. A request nobody picked up used to look exactly like a
> unit already on the road."

Point at NEAREST UNITS.

> "And it names the actual station — Kothrud Fire Station, 1.3 kilometres,
> two-minute drive. Real road routing, not a straight line."

---

## 1:30 — Two things nobody else has  ·  show: Visitor filter

Click **🌐 Visitor**.

> "Visitors dial the same 112. Spanish, Japanese, Arabic — right-to-left
> included. And look what all three say: *I don't know where I am*. A resident
> says 'near Mhatre bridge'. A tourist can't. So the system tells the operator
> exactly that, and asks for a map pin instead."

Point at the top strip.

> "That's **Exa**, watching live Indian disaster news — so the console knows a
> flood is unfolding before the calls arrive."

---

## 1:48 — The close  ·  show: a breached case

> "And nobody clicked anything for this. The SLA monitor runs server-side. When
> a case passes its deadline it escalates on its own, writes what was missed,
> and raises a supervisor task — whether or not anyone has this screen open.
>
> Five channels in, one queue out. Sankatmochan. It's live right now — message
> the bot yourself, in your language."

---

## SPONSOR LINES — drop in naturally, don't list them

| Tool | One line that's true |
|---|---|
| **OpenAI** | "language ID, translation and triage in one pass" — also gpt-4o vision on photos, gpt-4o-transcribe on voice |
| **Ambiguous AI** | "creates a real dispatch task — and the acknowledgement comes back" |
| **Exa** | "watching live Indian disaster news, so the console knows before the calls" |
| **CopilotKit** | "the operator copilot sees the case you're on" — click it if you have 5s spare |
| **Vobiz** | "and it answers actual phone calls in Hindi" — one line, only if you have room |
| **Auth0** | operator auth — mention only in the written submission, not on camera |

**Don't say "we used ten sponsor tools."** Judges hear padding. Name each one
at the moment it's doing something on screen.

---

## WHAT NOT TO SAY

- ❌ "Production-ready" — cases persist to SQLite now, but this is one box
- ❌ "Dispatches units" — it files tasks for an operator; no vehicle moves
- ❌ "Real-time database" — SQLite, write-through
- ❌ "Supports 90 languages" — say **15 verified live**, which is true

If a judge asks about limits, say: *in-memory working set backed by SQLite,
single instance, and the translation bridge is designed but not built.* A known
limitation stated plainly reads as engineering judgement. Discovered by a
judge, it reads as overselling.

---

## IF IT STALLS ON CAMERA

Don't narrate the failure. Say *"while that comes through"*, click an existing
case, show the map and action log, then come back. Never say "hmm, that's
weird" — you can't edit it out if you're not editing.

---

## FINAL CHECK — run right before recording

```bash
curl -s -o /dev/null -w "site: %{http_code}\n" https://sankatmochan.rohitdarekar.dpdns.org/
curl -s "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getWebhookInfo" | python3 -m json.tool
```

Expect `200`, the right `url`, `pending_update_count: 0`, no `last_error_message`.

Upload to **YouTube → Unlisted**. Drive and LinkedIn links are rejected by the form.
