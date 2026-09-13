# Read-Aloud Script — Sankatmochan

Everything in **bold** is what you say. Everything in *italics* is what you do.
Nothing else needs reading.

---

*Screen: console, full queue visible. Phone in frame. Start recording.*

**"India's one-one-two emergency line takes about two hundred million calls a
year, across twenty-two official languages. The operator picking up in Pune
speaks two of them. When a call comes in Telugu, or Bengali, the first ninety
seconds go to working out what language it even is — before anyone finds out
someone is drowning."**

**"This is Sankatmochan. Five ways in, one triaged queue out. Everything you're
about to see is a live API call."**

---

*Pick up the phone.*

**"I'm going to report an emergency from my own phone, in Japanese. A tourist in
Pune — no Hindi, no idea where they are."**

*Paste message 1. Send.*

```
助けてください！プネのコタルドにあるホテルで火事です
```

***Point at the console. Say nothing. Wait for the case.***

**"Three seconds. It detected Japanese, translated it, classified it critical,
category fire, geocoded it to Kothrud, and started an eight-minute countdown.
That's OpenAI doing language identification, translation and triage in a single
pass."**

---

*Send message 2.*

```
三階に子供が二人取り残されています！
```

**"Now watch — that's not a second case. It joins the first one, and it gets
triaged with the incident. On its own, 'two children trapped on the third
floor' is a meaningless fragment. Inside an open fire, it escalates it."**

*Click the case.*

**"And because they're not speaking an Indian language, it flags them as a
visitor — they can't name a local landmark, they may have no Indian number, so
it asks for a map pin instead. That's the difference between a resident saying
'near Mhatre bridge' and a tourist who genuinely doesn't know where they are."**

---

*Scroll to the bottom of the case.*

**"Dispatch isn't a generic row of buttons. A fire routes to the fire brigade
and an ambulance — burns, smoke inhalation. An accident routes to police and an
ambulance, because sending one unit to a scene that needed two is how minutes
get lost."**

*Click a dispatch button.*

**"That creates a real task in the Ambiguous AI workspace — and the
acknowledgement comes back. 'Awaiting' means nobody's opened it yet. After four
minutes unopened, it turns red. A request nobody picked up used to look exactly
like a unit already on the road."**

*Point at NEAREST UNITS.*

**"And it names the actual station. Kothrud Fire Station, one-point-three
kilometres, two-minute drive — real road routing, not a straight line."**

---

*Point at the strip under the header.*

**"That's Exa, watching live Indian disaster news, so the console knows a flood
is unfolding before the calls start arriving."**

---

*Show a case with a breach banner, or the queue.*

**"And nobody clicked anything for this part. The SLA monitor runs on the
server. When a case passes its deadline it escalates on its own, writes down
what was missed, and raises a supervisor task — whether or not anybody has this
screen open."**

**"Five channels in. One queue out. Sankatmochan is live right now — message the
bot yourself, in your own language."**

*Stop recording.*

---

## Backup line if something stalls

**"While that comes through —"** *click any existing case, show the map and the
action log,* **"— every step is logged. Language identified, translated,
classified."** *Then go back.*

Never say "hmm, that's weird". You can't cut it out.
