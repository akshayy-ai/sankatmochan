<p align="center">
  <img src="https://img.shields.io/badge/संकटमोचन-112_ERC-00D4AA?style=for-the-badge&labelColor=0A0E13" alt="Sankatmochan" />
</p>

<h1 align="center">संकटमोचन · Sankatmochan</h1>

<p align="center">
  <b>Multilingual AI emergency response console for India's 112 helpline</b>
  <br />
  <i>Telegram · inbound phone · SMS · browser voice — one queue, any language</i>
</p>

<p align="center">
  <a href="https://youtu.be/d4DqKCsSLXA">
    <img src="https://img.shields.io/badge/▶_Watch_the_2_min_demo-FF0000?style=for-the-badge&logo=youtube&logoColor=white" alt="Watch the demo" />
  </a>
  &nbsp;
  <a href="https://sankatmochan.rohitdarekar.dpdns.org">
    <img src="https://img.shields.io/badge/Try_it_live-00D4AA?style=for-the-badge&labelColor=0A0E13" alt="Live deployment" />
  </a>
</p>

<p align="center">
  <i>Or message <a href="https://t.me/sankatmochan_112_bot">@sankatmochan_112_bot</a> on Telegram — in any language. A case will appear in the live console within seconds.</i>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.3-black?logo=next.js" alt="Next.js 16.3" />
  <img src="https://img.shields.io/badge/React-19.2-149ECA?logo=react" alt="React 19.2" />
  <img src="https://img.shields.io/badge/Node-22-5FA04E?logo=node.js&logoColor=white" alt="Node 22" />
  <img src="https://img.shields.io/badge/OpenAI-5_models-412991?logo=openai" alt="OpenAI" />
  <img src="https://img.shields.io/badge/CopilotKit-1.70-6366f1" alt="CopilotKit" />
  <img src="https://img.shields.io/badge/Ambiguous_AI-Dispatch-FF6B35" alt="Ambiguous AI" />
  <img src="https://img.shields.io/badge/Exa-News-0EA5E9" alt="Exa" />
  <img src="https://img.shields.io/badge/SQLite-node:sqlite-003B57?logo=sqlite&logoColor=white" alt="SQLite" />
</p>

---

## The problem

India's 112 helpline serves 1.4 billion people across 22 official languages. A caller
in distress speaks their own; the operator speaks two or three. Both are doing
everything right and neither can help the other.

Sankatmochan removes the translation step. A report arrives in any language, on
whatever channel the caller has — a smartphone, a feature phone, or a landline — and
reaches the operator already translated, classified, located and timed.

---

## What actually works

Every row here is running on the live deployment right now. Send a message to the bot
and watch it land.

| Channel | How it arrives | What happens to it |
|---|---|---|
| **Telegram** | text, voice note, photo, location pin | Voice → `gpt-4o-transcribe` with Indian-language prompt bias. Photos → GPT-4o vision reads the scene. Pins backfill the open case instead of opening a new one. |
| **Inbound phone** | real 112 call over Vobiz IVR | The case is filed the moment the line connects — before the caller speaks — so a call that drops after two seconds still leaves an operator a case and a number that rang. |
| **SMS** | inbound via an Android SMS gateway | Works on a feature phone with no data. Single-turn by design. |
| **Browser voice** | OpenAI Realtime over WebRTC | A live 112 call in the console with running transcript. No language selector — it detects what you speak. |

All four write to one shared case store. The operator sees one queue.

### The parts that aren't obvious from a screenshot

**Call-storm clustering** — when a building burns, twenty people call. Reports group at
read time by category, a 45-minute window and a category-specific radius (flood 1200 m,
fire 500 m, accident 250 m), with a two-shared-word place-name fallback when there's no
GPS. Three independent reports raise a **MAJOR INCIDENT**. Grouping is a view and never
a merge — no case is rewritten or hidden.
→ [`src/lib/clustering.ts`](src/lib/clustering.ts)

**Server-side SLA escalation** — the countdown used to live in the browser: it hit zero,
the number turned red, and nothing happened. A sweeper now runs on the server every 30
seconds and escalates on its own, whether or not anyone has the console open. It files a
supervisor task in the Ambiguous workspace and **refuses to auto-dispatch or touch
severity** — a breach is a failure of our response, not new information about the
emergency.
→ [`src/lib/slaMonitor.ts`](src/lib/slaMonitor.ts)

**Credibility assessment with a refusal list** — grounded in exactly three things:
corroboration by independent callers, prior reports from the same sender an operator
already reviewed, and people explicitly saying they're testing. It deliberately refuses
to treat panic, incoherence, brevity, evasiveness, a child's voice, a call-back request,
or a missing location as signals of a hoax. It is advisory only and can never hide,
reorder or downgrade a case.
→ [`src/lib/credibility.ts`](src/lib/credibility.ts)

**Deterministic dispatch routing** — category maps to agency in a fixed table the model
can add to but never subtract from. Fire routes to the fire brigade *and* an ambulance;
an accident routes to hospital and police as co-primaries. Nearest units come from
OpenStreetMap Overpass with real road ETAs from OSRM.
→ [`src/lib/dispatchRouting.ts`](src/lib/dispatchRouting.ts), [`src/app/api/facilities/`](src/app/api/facilities/)

**Cases survive restart** — SQLite write-through via `node:sqlite` on a Docker volume.
Verified on the live box: the container restores its working set on boot.

**Multi-turn conversation** — a follow-up message joins the open incident rather than
opening a second case, and is re-triaged *with* the earlier turns as context. "Two
children trapped upstairs" is a fragment on its own; inside an open fire it escalates.

---

## Honest scope

The project's own limits, stated plainly. Everything above is running; everything here
is not.

- **Nothing dispatches a vehicle.** Dispatch files a task an agency must accept. The bot
  never tells a caller help is on the way, because at that moment it isn't.
- **Dispatch email goes to demo addresses.** All five agencies map to
  `*@demo.sankatmochan.in`, which doesn't resolve. Task creation is the real path; mail
  is best-effort and a dispatch still reports as sent if the mail fails.
- **Auth0 is scaffolded, not enforced.** The SDK is installed and a themed `/login` page
  exists, but `src/middleware.ts` is a deliberate pass-through, so the console runs
  unauthenticated and the operator identity in the header is hardcoded.
- **Single instance.** No failover. One container, one SQLite file.
- **Vobiz is wired but unconfigured here** — no telephony credentials in this deployment.
- **Outbound SMS needs gateway credentials.** Inbound SMS files cases today; replies are
  skipped without them. With `SMS_GATEWAY_SIGNING_KEY` unset, inbound HMAC verification
  is skipped entirely.
- **ETAs are free-flow**, from OSRM road distance. Not traffic-aware.
- **The translation bridge is designed, not built.** The Bridge tab is labelled PLANNED
  in the UI for that reason.
- **A caller can end a conversation thread but never a case.** Deliberate: a coerced
  caller must not be able to retire a live incident.

No credential has ever been committed. `.env*` is gitignored, and no env, key or `.pem`
file appears in any commit in this repository's history — checkable in one command.

---

## Languages

No language is pinned anywhere in the pipeline — the model detects whatever the caller
uses, and the console has handled Japanese, Spanish and Arabic in testing.

The triage prompts explicitly name 11: Hindi, Marathi, Telugu, Tamil, Bengali, Gujarati,
Kannada, Malayalam, Odia, Punjabi and English.

The nine seeded demo cases cover 7 languages — Telugu (flood), Marathi ×3 (fall injury,
chest pain, fever), Bengali (shop fire), Tamil (missing child), Odia (village flood),
Gujarati (collapsed wall), Hindi (pharmacy).

*Font caveat:* six Noto scripts are loaded (Devanagari, Telugu, Tamil, Bengali,
Gujarati, Odia). A Kannada, Malayalam or Punjabi case is triaged correctly but renders
in a fallback face.

---

## Architecture

```
   Telegram        Vobiz IVR         SMS gateway      Browser (WebRTC)
   text/voice      inbound 112       feature phone    OpenAI Realtime
   photo/pin           call
       │                │                 │                  │
       └────────────────┴────────┬────────┴──────────────────┘
                                 ▼
                      ┌──────────────────────┐
                      │   shared case store  │   triage · translation · severity
                      │   + SQLite mirror    │   clustering · credibility · SLA
                      └──────────┬───────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          ▼                      ▼                      ▼
   OPERATOR CONSOLE       Ambiguous AI            OSM / OSRM / Exa
   queue · map · copilot  dispatch tasks +        nearest units, road ETA,
   claim · notes          acknowledgement         geocode, live disaster news
```

The SLA sweeper runs inside the app process on a 30-second interval, independent of any
browser. Cloudflare's named tunnel is the only public path in; the container publishes
to loopback only.

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.3, React 19.2, TypeScript, standalone output |
| Runtime | Node 22 (`node:sqlite` requires 22.5+) |
| AI | OpenAI — `gpt-realtime`, `gpt-4o` (vision), `gpt-4o-transcribe`, `gpt-4o-mini` (triage) |
| Copilot | CopilotKit 1.70 (v2 API) — agent context, frontend tools, generative UI, human-in-the-loop |
| Dispatch | Ambiguous AI workspace tasks + acknowledgement read-back |
| News | Exa |
| Storage | SQLite via `node:sqlite`, write-through, restored on boot |
| Geo | Leaflet + OpenStreetMap, Overpass (facilities), OSRM (ETA), Nominatim (geocode) |
| Deployment | Docker multi-stage on `node:22-alpine`, non-root, healthcheck, Cloudflare named tunnel |

---

## Getting started

**Prerequisites:** Node 22.5+ (for `node:sqlite`), an OpenAI API key.

```bash
git clone https://github.com/akshayy-ai/sankatmochan.git
cd sankatmochan
npm install
cp .env.local.example .env.local   # then add your keys
npm run dev
```

> **Local-dev trap:** `CASE_DB_PATH` defaults to `/data/sankatmochan.db`, which a dev
> machine can't create. Set `CASE_DB_PATH=./.data/sankatmochan.db` in `.env.local` or
> persistence silently disables itself and the app runs memory-only.

The console requires a **1320 × 820** viewport and the body does not scroll — on a
shorter window it clips rather than scrolls.

### Environment

Only `OPENAI_API_KEY` is needed to boot. Everything else enables a channel or a feature.

| Variable | Needed for | Without it |
|---|---|---|
| `OPENAI_API_KEY` | everything — triage, vision, transcription, Realtime | core features 500 |
| `TELEGRAM_BOT_TOKEN` | Telegram ingest and replies | bot cannot reply |
| `EXA_API_KEY` | news search and monitors | news routes 500 (does not degrade) |
| `PUBLIC_BASE_URL` | Vobiz callback URLs, webhook registration | telephony callbacks point at the wrong host |
| `AMBIGUOUS_API_KEY` | dispatch tasks, SLA escalation | escalation silently no-ops |
| `SMS_GATEWAY_USERNAME` / `_PASSWORD` | outbound SMS replies | inbound still files cases, reply skipped |
| `SMS_GATEWAY_SIGNING_KEY` | HMAC on inbound SMS | **verification skipped entirely** |
| `TELEGRAM_SETUP_SECRET` | overriding the webhook target | override disabled (fails closed) |

Optional, with in-code defaults: `MODEL_PROVIDER`, `MODEL`, `CASE_DB_PATH`,
`REALTIME_LIVE`, `VOBIZ_GATHER_LANGUAGE`, `AMBIGUOUS_API_URL`, `OVERPASS_URL`,
`OSRM_URL`, `SMS_GATEWAY_API_URL`.

Compose reads `TUNNEL_TOKEN` and `PUBLIC_URL` from a separate `.env.tunnel` — see
`.env.tunnel.example`.

### Deployment

```bash
docker compose up -d --build
```

Three services: the app on loopback, a Cloudflare named tunnel as the only ingress, and
a registrar that re-points the Telegram webhook at `PUBLIC_URL` on every start so a
reboot never leaves the bot registered to a stale target.

> A Cloudflare **quick** tunnel will not work — Telegram refuses `*.trycloudflare.com`
> webhook targets. You need a named tunnel on a domain you control.

---

## Project structure

```
src/
├── app/
│   ├── page.tsx · layout.tsx · login/page.tsx
│   └── api/                          22 routes
│       ├── telegram/webhook · telegram/setup       ingest + registration
│       ├── vobiz/answer · vobiz/gather             inbound phone IVR
│       ├── sms/webhook                             inbound SMS
│       ├── realtime/session · realtime/case        browser voice
│       ├── image/analyze · audio/translate         standalone media analysis
│       ├── cases/claim · note · dismiss · resolve  operator actions
│       ├── dispatch · dispatch/status              dispatch + acknowledgement
│       ├── facilities · geocode · weather          context enrichment
│       ├── news · news/monitor · news/webhook      Exa
│       └── copilotkit/[[...path]]                  CopilotKit runtime
├── lib/                              11 modules
│   ├── caseStore.ts        shared store — every channel writes here
│   ├── persistence.ts      SQLite write-through mirror
│   ├── callSession.ts      phone-call slot filling + silence ladder
│   ├── clustering.ts       call-storm grouping
│   ├── credibility.ts      advisory hoax assessment
│   ├── dispatchRouting.ts  deterministic category → agency
│   ├── slaMonitor.ts       server-side sweeper
│   └── sla.ts · exa.ts · auth0.ts · realtime-client.ts
├── components/             console UI, map, copilot panel, generative UI
├── hooks/                  useTelegramCases · useLiveData · useSlaTimer
└── data/mock.ts            shared CrisisCase type + 9 seeded demo cases
```

---

## Sponsor integrations

**OpenAI** — five models across four endpoint families: `gpt-realtime` over WebRTC for
the voice console, `gpt-4o` vision for photos, `gpt-4o-transcribe` for voice notes
(chosen over `whisper-1` after Whisper corrupted Hindi emergency vocabulary in testing),
and `gpt-4o-mini` for triage.

**CopilotKit** — the operator's decision surface, not a chat panel. `useAgentContext`
feeds it the selected case, queue and severity so the operator never re-explains what
they're looking at. Five frontend tools (`select_case`, `get_case_summary`,
`search_news`, `escalate_case`, `dispatch_to_agency`), generative UI components
(`emergency_card`, `case_timeline`), and `useHumanInTheLoop` gating `confirm_dispatch` —
the one action in this system with a real-world consequence.

**Ambiguous AI** — the dispatch record and the escalation backbone. Confirmed dispatches
create a workspace task; `/api/dispatch/status` reads the acknowledgement back onto the
case, so a request nobody opened stops looking like a unit already on the road. The SLA
sweeper files its own supervisor task on breach, autonomously. *Dispatch mail in this
demo goes to placeholder addresses; the per-case audit trail lives in the app's own
store, not a workspace Doc.*

**Exa** — live Indian disaster news in a header strip, so the console knows before the
calls arrive.

**Auth0** — installed and scaffolded with a themed operator sign-in page, but the
middleware is a pass-through and the console runs unauthenticated. See Honest scope.

---

## Team

Built by **Agentic Mindmesh** at the AI Tinkerers *"Agents, Everywhere"* hackathon —
Pune, September 2026.

## Licence

[MIT](LICENSE)
