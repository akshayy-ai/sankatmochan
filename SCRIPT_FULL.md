# Demo Script — Sankatmochan

**Bold** = say it. *Italics* = do it. Nothing else needs reading.

The form caps you at **2:00** and says longer may deduct points. This is built
as a **1:22 spine** plus timed modules. Add until ~1:55, then stop.

---

## BEFORE YOU RECORD

- Console open on the **Console tab**, queue visible, both windows in frame
  https://sankatmochan.rohitdarekar.dpdns.org
- Telegram on your phone, chat cleared
- On the phone: the two Japanese messages below, one accident photo
- Ask me to **"stage the queue"** so the console looks like a working shift
- **One silent pause in the whole video** — the first case landing. Talk
  through every other wait; the next line covers the processing time.

---

# SPINE — 1:22

## 1. The story · 0:20

*Console on screen. Don't touch anything. Just talk.*

**"It's two in the morning in Pune. A hotel corridor is filling with smoke.
Someone is on the phone to one-one-two, and they're speaking Japanese —
because they landed yesterday."**

*Beat.*

**"The operator speaks Marathi and Hindi. Both of them are doing everything
right. Neither one can help the other."**

*Beat.*

**"That gap is what we built Sankatmochan for. Two hundred million calls a
year, twenty-two official languages, and an operator who speaks two of them."**

## 2. Live ingest · 0:25 ← the money shot

*Pick up the phone — same motion as the story.*

**"So let's be that caller. This is my own phone, and this is Japanese."**

*Paste. Send.*
```
助けてください！プネのコタルドにあるホテルで火事です
```

***Point at the console. Silence until the case lands. Do not fill it.***

**"Three seconds. It detected Japanese, translated it, classified it critical,
category fire, geocoded it to Kothrud, and started an eight-minute countdown.
That's OpenAI doing language ID, translation and triage in a single pass."**

## 3. Conversation state · 0:17

*Send the second message.*
```
三階に子供が二人取り残されています！
```

**"That's not a second case — it joins the first, and gets triaged with the
incident. On its own, 'two children trapped upstairs' is a fragment. Inside an
open fire, it escalates it."**

## 4. Close · 0:10

**"Five channels in. One queue out. Sankatmochan is live right now — message
the bot yourself, in your own language."**

---

# MODULES — add in this order

## A. Photo + voice · +0:18 ★ take this first

*Send the accident photo.*

**"A photo works too — vision reads the scene. The vehicle, the people, the
hazards. For a caller who can't describe what they're looking at."**

*Send a voice note, speaking normally in any language.*

**"And a voice note, because in a real emergency people don't type, they
shout."**

## B. Dispatch + Ambiguous · +0:20 ★ second

*Click the case, scroll to the bottom.*

**"A fire routes to the fire brigade and an ambulance. It creates a real task
in the Ambiguous AI workspace — and the acknowledgement comes back, so a
request nobody opened stops looking like a unit already on the road. It names
the actual station, with the real driving time."**

## C. Autonomy · +0:12 ★ third — strongest single line

*Show the queue, or a case with a breach banner.*

**"And nobody clicked anything for this. The SLA monitor runs on the server —
when a case passes its deadline it escalates on its own, whether or not anyone
has this screen open."**

## D. Visitor · +0:12

*Click the 🌐 Visitor filter.*

**"Our caller wasn't unusual. Spanish, Japanese, Arabic — right to left
included. And every one of them says the same thing: I don't know where I am. A
resident names a landmark. A visitor can't. So it asks for a map pin instead."**

## E. Exa · +0:08

*Point at the strip under the header.*

**"That's Exa — live Indian disaster news, so the console knows before the
calls arrive."**

## F. Call storm · +0:15

*Click a case with a ×4 badge.*

**"When a building burns, twenty people call. Each used to be its own case. Now
they collapse into one incident with four corroborating callers — and the
volume itself becomes the signal that it's serious."**

## G. SMS · +0:10

**"And SMS, which works on a feature phone with no data. Every other demo needs
a smartphone. SMS reaches the people who actually dial one-one-two."**

## H. Copilot · +0:10

*Click the copilot panel, type "summarise this case".*

**"CopilotKit gives the operator an agent that already knows which case they're
looking at."**

---

# MODULE V — THE 112 VOICE CALL · +0:25

> ⚠️ **UNTESTED WITH A REAL VOICE.** It connects and transcription is on
> gpt-4o-transcribe, but nobody has ever spoken to it. **Test it once before
> you record.** If it works it is the best thing in the demo. If it stalls you
> lose the take — 25 seconds of dead air cannot be recovered unedited.

*Click the **📞 Voice** tab.*

**"And there's the call itself. No language selector — it detects whatever you
speak."**

*Click **Start 112 Call**. Speak:*

> "मेरे घर में आग लगी है, दो बच्चे अंदर फंसे हैं"

**"It's listening, answering in the caller's own language, and filing the case
while it talks."**

*Switch to Console.*

**"Same queue. A phone call and a text message end up in the same place."**

### If you'd rather not risk it

One honest line over the Console, 8 seconds:

**"There's also a live voice agent and real inbound phone calls over Vobiz —
answered and triaged in Hindi, into this same queue."**

---

# SUGGESTED BUILD — 1:52

| | | |
|---|---|---|
| SPINE | story → send → follow-up → close | 1:22 |
| **A** | photo + voice | +0:18 |
| **C** | autonomy | +0:12 |
| | **total** | **1:52** |

The story costs 12 seconds more than a statistic and is worth it. If you want
module B as well, cut the second beat of the story and open straight on
*"The operator speaks Marathi and Hindi."*

**If the voice call tests clean**, swap module A for module V — a working AI
phone call beats a photo, and photos still appear in the written submission.

---

# WHY THE STORY WORKS

Don't rush the two beats. The pauses are the whole effect.

**"Both of them are doing everything right"** is the load-bearing line — it
stops the story blaming anyone and turns it into a systems problem, which is
the kind of problem software is allowed to solve.

And it sets up your next move: you say *they're speaking Japanese*, then you
pick up your phone and send Japanese. The story and the demo are the same
motion, not a gear change.

---

# WHAT NOT TO SAY

- ❌ "Production-ready" — single box, SQLite-backed
- ❌ "Dispatches units" — it files tasks; no vehicle moves
- ❌ "Ninety languages" — say **fifteen verified live**
- ❌ A list of ten sponsor names. Judges hear padding. Name each one at the
  moment it is visibly doing something on screen.

If asked about limits: single instance, SQLite working set, translation bridge
designed but not built. Stated plainly that reads as judgement; discovered by a
judge it reads as overselling.

---

# IF SOMETHING STALLS

**"While that comes through —"** *click any case, show the map and action log,*
**"— every step is logged. Language identified, translated, classified."**
*Then go back.*

Never say "hmm, that's weird". You can't cut it out.
