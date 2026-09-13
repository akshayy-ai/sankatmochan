# Agents, Everywhere — Submission

**Team:** Agentic Mindmesh
**Live:** https://sankatmochan.rohitdarekar.dpdns.org
**Bot:** https://t.me/sankatmochan_112_bot
**Repo:** https://github.com/akshayy-ai/sankatmochan

---

## Project Name

```
Sankatmochan — Multilingual 112 Emergency Response Grid
```

---

## Project Description

```
India's 112 emergency helpline handles roughly 200 million calls a year across 22
official languages. The operator who picks up in Pune speaks Marathi and Hindi.
When a call arrives in Telugu, Bengali or Punjabi, the first ninety seconds are
spent working out what language it even is — before anyone learns that someone is
drowning. That gap is where people die.

Sankatmochan is an agent that lives inside the emergency-response console itself,
not beside it in a chat window. The environment is what defines the whole design:
an operator under load cannot type prompts. So the agent watches five ingest
channels, decides what matters, and puts a triaged case in front of a human with
the context already assembled. The operator arrives at a decision, not a transcript.

FIVE CHANNELS, ONE QUEUE

- Telegram text, in any Indian language
- Telegram voice notes, transcribed and translated
- Telegram photos, where the caller shows what they cannot describe
- SMS, via an Android handset acting as a gateway — this reaches feature phones
  and no-data areas, which is precisely the population most likely to need 112
- Inbound phone calls over Vobiz telephony, answered and triaged in Hindi

Each one lands in the same operator queue within about three seconds, carrying a
severity, a category, an English translation beside the original script, a
reverse-geocoded location, live local weather, and an SLA countdown scaled to
severity.

WHY IT IS AN AGENT, NOT A CHATBOT

Nobody invokes it. There is no prompt box in the ingest path. The system watches
channels, classifies intent — distinguishing a real emergency from a greeting so
casual messages never become cases — routes by severity, enriches with external
data, and escalates. A chatbot answers when spoken to; this decides what deserves
a human's attention, and its presence inside the console is what makes that
possible.

TECHNICAL EXECUTION

Next.js 16 (App Router, React 19, Turbopack) and TypeScript. OpenAI does the
reasoning: gpt-4o-mini for language identification, translation and triage;
gpt-4o vision to read emergency scenes in photographs; gpt-4o-transcribe for
speech. We moved off whisper-1 after measuring both on identical Hindi audio —
whisper-1 rendered "आग" (fire) as "आत", destroying the one word triage depends
on, while gpt-4o-transcribe was exact. The OpenAI Realtime API drives a live
voice console.

CopilotKit gives the operator an agent-native surface inside the console, with
shared case context and generative UI rather than a bolted-on chat panel. Exa
monitors live Indian disaster news so the console knows about a flood before the
calls arrive. Ambiguous AI handles dispatch workspace tasks. Auth0 guards
operator routes. Leaflet with OpenStreetMap renders incidents; Nominatim and
wttr.in add free reverse-geocoding and weather with no API keys.

It is genuinely deployed, not a localhost demo: Dockerised behind a Cloudflare
named tunnel on self-hosted infrastructure, running as a non-root container with
a healthcheck, the app bound to loopback so the tunnel is the only ingress, and
the Telegram webhook re-registering itself on every restart so a reboot cannot
silently break ingest.

HONEST SCOPE

Cases survive a restart — SQLite write-through on a Docker volume, verified by
restoring 19 cases on the live box. What this is not: it runs as a single
instance, so there is no failover; outbound SMS needs gateway credentials we
do not have; Auth0 is wired but runs in pass-through demo mode; and the
operator-to-caller translation bridge is designed, not built. Nothing here
dispatches a vehicle — it files a task an agency has to accept.
```

---

## Products & Tools Used

Tick these — each is verified working on the live deployment:

- [x] **AI Tinkerers**
- [x] **OpenAI** — gpt-4o vision, gpt-4o-mini, gpt-4o-transcribe, Realtime API
- [x] **CopilotKit** — runtime + React core, operator copilot with shared case context
- [x] **Exa** — live disaster-news monitoring
- [x] **Ambiguous AI** — dispatch workspace
- [x] **Auth0** — operator authentication *(integrated; runs in pass-through demo mode)*

**Other Products:**
```
Vobiz (voice/telephony API — inbound 112 calls answered and triaged in Hindi),
Telegram Bot API, SMS Gateway for Android (sms-gate.app), Cloudflare Tunnel,
Docker, Next.js 16, Leaflet + OpenStreetMap, Nominatim, wttr.in
```

> **Do not tick** Trigger.dev, OpenRouter, Mozilla.ai or Google Cloud — they are
> not used in the codebase. Judges can check the repo.

---

## Additional Links

```
GitHub: https://github.com/akshayy-ai/sankatmochan
Live demo: https://sankatmochan.rohitdarekar.dpdns.org
Telegram bot: https://t.me/sankatmochan_112_bot
```

---

## Team Contributions

> ⚠️ **VERIFY BEFORE SUBMITTING.** I only have direct evidence for Akshay and
> Rohit. Correct Nishant's and Rishikesh's entries to what they actually did —
> do not submit a guess.

**Akshay Shitole (Lead)**
```
Overall architecture and agent design. Built the multi-channel ingest pipeline
and the triage agent on OpenAI — gpt-4o-mini for language ID, translation and
severity classification, gpt-4o vision for emergency photo analysis, and
gpt-4o-transcribe for speech (benchmarked against whisper-1 on Hindi audio and
switched after measuring a materially better result). Integrated CopilotKit for
the in-console operator copilot with shared case context and generative UI.
Built the Telegram Bot API integration across text, voice and photo, the SMS
ingest path, and the Vobiz telephony flow for inbound 112 calls. Built the
operator console UI: live SLA countdowns, Leaflet incident maps, and live
reverse-geocoding and weather enrichment.
```

**Rohit Darekar (Member)**
```
Deployment and infrastructure. Provided and administered the self-hosted server,
set up the Cloudflare named tunnel and domain that make the deployment publicly
reachable from behind NAT, and supported the Dockerised rollout.
```

**Nishant Bagul (Member)**
```
[REPLACE — describe what Nishant actually built, naming specific sponsor tools
or APIs they worked with.]
```

**Rishikesh Ombase (Member)**
```
[REPLACE — describe what Rishikesh actually built, naming specific sponsor tools
or APIs they worked with.]
```

---

## Prior Work

```
All code was written during the hackathon. The project was built from a fresh
Next.js application; no pre-existing codebase, designs or agent logic were
carried in. Third-party dependencies are standard open-source packages and
sponsor SDKs installed during the event.
```

> Edit this if any of it is untrue.

---

## Social Media Post

**X / Twitter**

```
We built Sankatmochan for #AgentsEverywhere 🚨

India's 112 helpline takes ~200M calls/yr across 22 languages. The operator
speaks 2 of them.

Five ways in — SMS, Telegram text, voice note, photo, phone call — one triaged
queue. Any Indian language. ~3 seconds.

SMS matters most: it reaches feature phones with no data. That's who needs 112.

@AITinkerers @OpenAI @CopilotKit @exaailabs @auth0 @ambiguousio

Live: https://sankatmochan.rohitdarekar.dpdns.org
Bot: https://t.me/sankatmochan_112_bot
```

**LinkedIn**

```
🚨 Sankatmochan — built at the AI Tinkerers "Agents, Everywhere" hackathon in Pune.

India's 112 emergency helpline handles around 200 million calls a year across 22
official languages. The operator answering in Pune speaks Marathi and Hindi. When
a call comes in Telugu or Bengali, the first ninety seconds go to working out what
language it is — before anyone finds out someone is drowning.

We built an agent that lives inside the emergency console itself. Five channels
in, one queue out:

📱 SMS — reaches feature phones with no data, the people most likely to need 112
💬 Telegram text in any Indian language
🎤 Voice notes, transcribed and translated
📸 Photos, where AI vision reads the scene a caller can't describe
📞 Inbound phone calls, answered and triaged in Hindi

Each arrives in the operator queue in about three seconds with severity, category,
English translation beside the original script, geocoded location, live weather
and an SLA countdown.

Nobody clicks anything. That's what makes it an agent rather than a chatbot — it
decides what deserves a human's attention and arrives with the context already
assembled.

One finding worth sharing: on identical Hindi audio, whisper-1 transcribed "आग"
(fire) as "आत" — a non-word. gpt-4o-transcribe got it right. In an emergency
system, that single word is the difference between a fire truck and nothing.

Built with OpenAI, CopilotKit, Exa, Ambiguous AI, Auth0, Vobiz and the Telegram
Bot API. Deployed behind a Cloudflare tunnel.

Live: https://sankatmochan.rohitdarekar.dpdns.org

Team Agentic Mindmesh — Akshay Shitole, Nishant Bagul, Rishikesh Ombase, Rohit Darekar

AI Tinkerers, OpenAI, CopilotKit, Exa, Auth0, Ambiguous AI

#AgentsEverywhere
```

---

## Submission Checklist

- [ ] Project name
- [ ] Project description
- [ ] Products/tools ticked (6 boxes + Other)
- [ ] Team contributions — **replace the two placeholders first**
- [ ] Social post published, URL pasted back into the form
- [ ] Video (optional, ≤2 min — longer deducts points)
- [ ] Additional links
