# Full Demo Script — Sankatmochan

**Bold** = say it. *Italics* = do it.

The form caps you at **2:00** and says longer may deduct points. This script is
modular: the **SPINE** is 1:10 and covers the strongest material. Add modules
until you hit 1:55, then stop. Suggested build at the bottom.

---

## BEFORE YOU RECORD

- Console open, **Console tab**, queue visible: https://sankatmochan.rohitdarekar.dpdns.org
- Telegram on your phone, chat cleared, both windows in frame
- Ready on the phone: the two Japanese messages, one accident photo
- Ask me to **"stage the queue"** so it looks like a working shift
- **Pace: one silent pause only** — the first case landing. Talk through every
  other wait; the next line covers the processing time.

---

# SPINE — 1:10 · record this no matter what

## 1. The problem · 0:18

*Console on screen, full queue.*

**"India's one-one-two line takes two hundred million calls a year, across
twenty-two official languages. The operator in Pune speaks two of them. When a
call comes in Telugu, the first ninety seconds go to working out what language
it even is — before anyone learns someone is drowning."**

## 2. Live ingest · 0:25 ← the money shot

*Pick up the phone.*

**"I'll report an emergency from my own phone, in Japanese. A tourist in Pune —
no Hindi, no idea where they are."**

*Paste. Send.*
```
助けてください！プネのコタルドにあるホテルで火事です
```

***Point at the console. Silence until the case lands.***

**"Three seconds. Detected Japanese, translated it, classified it critical,
geocoded it, started an eight-minute countdown. That's OpenAI doing language
ID, translation and triage in one pass."**

## 3. Conversation state · 0:17

*Send the second message.*
```
三階に子供が二人取り残されています！
```

**"That's not a second case — it joins the first, and gets triaged with the
incident. Alone, 'two children trapped upstairs' is a fragment. Inside an open
fire, it escalates it."**

## 4. Close · 0:10

**"Five channels in. One queue out. It's live right now — message the bot
yourself, in your own language."**

---

# MODULES — add in this order

## A. Photo + voice · +0:18 ★ take this first

*Send the accident photo.*

**"A photo works too — vision reads the scene. The vehicle, the people, the
hazards. For a caller who can't describe what they're looking at."**

*Send a voice note, speaking normally in any language.*

**"And a voice note, because in a real emergency people don't type, they
shout."**

## B. Dispatch + Ambiguous · +0:20 ★ take this second

*Click the case, scroll to the bottom.*

**"A fire routes to the fire brigade and an ambulance. It creates a real task
in the Ambiguous AI workspace — and the acknowledgement comes back, so a
request nobody opened stops looking like a unit on the road. It names the
actual station, with the real driving time."**

## C. Autonomy · +0:12 ★ take this third — strongest single line

*Show the queue, or a case with a breach banner.*

**"And nobody clicked anything for this. The SLA monitor runs on the server —
when a case passes its deadline it escalates on its own, whether or not anyone
has this screen open."**

## D. Exa · +0:08

*Point at the strip under the header.*

**"That's Exa — live Indian disaster news, so the console knows before the
calls arrive."**

## E. Visitor · +0:14

*Click the 🌐 Visitor filter.*

**"Visitors dial the same one-one-two. Spanish, Japanese, Arabic, right-to-left
included. And every one of them says the same thing — I don't know where I am.
A resident names a landmark. A tourist can't. So it asks for a map pin
instead."**

## F. Call storm · +0:15

*Click a case with a ×4 badge.*

**"When a building burns, twenty people call. Each used to be its own case.
Now they collapse into one incident with four corroborating callers — and the
volume itself becomes the signal that it's serious."**

## G. SMS · +0:10

**"And SMS, which works on a feature phone with no data. Every other demo needs
a smartphone. SMS reaches the people who actually dial one-one-two."**

## H. Copilot · +0:10

*Click the copilot panel, type "summarise this case".*

**"CopilotKit gives the operator an agent that already knows which case
they're on."**

---

# MODULE V — THE 112 VOICE CALL · +0:25

> ⚠️ **UNTESTED WITH A REAL VOICE.** It connects and transcription is on
> gpt-4o-transcribe, but nobody has ever spoken to it. **Test it once before
> you record.** If it works, it is the best thing in the demo. If it stalls on
> camera you lose the take — there is no recovering 25 seconds of dead air.

*Click the **📞 Voice** tab.*

**"This is the voice agent — a simulated one-one-two call. No language
selector. It detects whatever you speak."**

*Click **Start 112 Call**. Speak in Hindi or your own language:*

> "मेरे घर में आग लगी है, दो बच्चे अंदर फंसे हैं"

**"It's listening, transcribing and answering in the caller's own language —
and filing the case while it talks."**

*Switch to Console, show the case.*

**"Same queue. A phone call and a text message end up in the same place."**

### If you'd rather not risk it

Say this over the Console instead — it's true, and costs 8 seconds:

**"There's also a live voice agent and real inbound phone calls over Vobiz —
answered and triaged in Hindi, into this same queue."**

---

# SUGGESTED BUILD — 1:53

| | | |
|---|---|---|
| SPINE | | 1:10 |
| **A** | photo + voice | +0:18 |
| **B** | dispatch + Ambiguous | +0:20 |
| **C** | autonomy | +0:12 |
| | **total** | **2:00** |

Tight. Drop module B's last sentence if you run over.

**If the voice call tests clean**, swap module B for module V — a working AI
phone call beats a dispatch button, and you keep Ambiguous in the written
submission.

---

# WHAT NOT TO SAY

- ❌ "Production-ready" — single box, SQLite-backed
- ❌ "Dispatches units" — it files tasks; no vehicle moves
- ❌ "Ninety languages" — say **fifteen verified live**
- ❌ A list of ten sponsor names — judges hear padding. Name each one at the
  moment it is visibly doing something.

If asked about limits: single instance, SQLite working set, translation bridge
designed but not built. Stated plainly it reads as judgement. Discovered by a
judge, it reads as overselling.

---

# IF SOMETHING STALLS

**"While that comes through —"** *click any case, show the map and action log,*
**"— every step is logged. Language identified, translated, classified."**
*Then go back.*

Never say "hmm, that's weird". You can't cut it out.
