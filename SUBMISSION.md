# Hackathon Submission — Copy-Paste Ready

---

## Project Name

```
Sankatmochan (संकटमोचन) — Multilingual AI Emergency Response Console
```

---

## Products & Tools Used

Check ALL of these:
- [x] AI Tinkerers
- [x] OpenAI
- [x] CopilotKit
- [x] OpenRouter
- [x] Exa
- [x] Auth0
- [x] Ambiguous AI

Other Products: `Leaflet/OpenStreetMap, React Flow`

---

## Project Description

```markdown
# Sankatmochan (संकटमोचन) — AI Emergency Response Console for India's 112 Helpline

## The Problem

India's 112 emergency helpline serves 1.4 billion people across 22 official languages and 780+ dialects. When someone calls in crisis — in Marathi, Telugu, Tamil, or Odia — the operator often doesn't speak their language. Manual translation adds 3-5 critical minutes to response times. In emergencies, that gap costs lives.

## The Solution

Sankatmochan ("the one who resolves crisis") is an AI-powered emergency response console where **four AI agents live inside the operator's workflow** — not as chatbots, but as integral parts of the emergency response chain:

### 📞 Voice Agent (OpenAI Realtime API)
The most impactful integration. Using OpenAI's `gpt-realtime` model via WebRTC, we built a **112 call simulator** that answers emergency calls in the caller's native language. The agent auto-detects Hindi, Marathi, Telugu, Tamil, Bengali, Gujarati, Kannada, Malayalam, Odia, and Punjabi. It triages the emergency in real time — gathering location, assessing severity, identifying injuries — and creates a structured case, all by voice. No human translator needed. A 5-minute call becomes 30 seconds.

**Why context matters:** The voice agent doesn't just transcribe — it understands it's on a 112 emergency line. It asks the right questions ("Where are you? How many people?"), classifies severity (CRITICAL/HIGH/MEDIUM/LOW), and triggers dispatch tools. The emergency context shapes every response.

### 🤖 Copilot Agent (CopilotKit v2)
An AI assistant embedded in the operator's console sidebar using CopilotKit's full stack:
- **`useAgentContext`** feeds the selected case (native text, translation, severity, location, timeline, alert) to the AI — it always knows what the operator is looking at
- **`useFrontendTool`** registers 6 tools: `select_case`, `get_case_summary`, `search_news` (Exa), `escalate_case`, `dispatch_to_agency` (Ambiguous AI)
- **`useComponent`** renders structured emergency cards and case timelines inline — controlled generative UI
- **`useHumanInTheLoop`** gates irreversible dispatch actions — the operator must click "Approve Dispatch" before any unit is sent
- **`CopilotChat`** with contextual suggestion buttons ("Summarise this case", "Search disaster news", "Draft handoff note")

**Why context matters:** The copilot sees the same case the operator sees. It doesn't ask "what case?" — it already knows. Its suggestions change based on severity, language, and case status.

### 📋 Dispatch Agent (Ambiguous AI)
When the operator confirms an escalation, the system dispatches through Ambiguous AI's workspace:
- Creates a tracked **Task** with severity, location, language, and full case details
- Sends an **email notification** to the target agency (NDRF, SDRF, Hospital, Fire, Police)
- Maintains a complete **audit trail** in the Ambiguous workspace
- The dispatch agent has its own workspace identity: `sankatmochan.dispatch@sankatmochan-dispatch-workspace.ambi.cc`

**Why context matters:** Dispatch isn't a one-shot API call — it's tracked work. The Ambiguous workspace gives each dispatch a task with status, priority, and ownership. Nothing falls through the cracks.

### 📰 News Agent (Exa)
Integrated via CopilotKit's `search_news` tool, the operator can ask "What's happening with floods in this region?" and get real-time disaster intelligence from Exa's search API — headlines, sources, and highlights relevant to the active case.

### 🔐 Operator Auth (Auth0)
The console is protected by Auth0 authentication. Operators sign in via Auth0 Universal Login, and their identity appears in the dashboard header. When Auth0 isn't configured, the console gracefully falls back to demo mode — no broken deploys.

### 🔄 Model Gateway (OpenRouter)
The CopilotKit runtime supports OpenRouter as a model provider — a single env var change (`MODEL_PROVIDER=openrouter`) routes through OpenRouter's gateway, enabling access to 200+ models from OpenAI, Anthropic, Google, and open-source providers. Zero code change required.

## Technical Stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS
- **AI Copilot:** CopilotKit v2 (`@copilotkit/react-core@1.70.1`, `@copilotkit/runtime@1.70.3`)
- **Voice:** OpenAI Realtime API (`gpt-realtime`) via WebRTC with ephemeral tokens
- **Dispatch:** Ambiguous AI REST API (Tasks + Mail)
- **Search:** Exa API for disaster news
- **Auth:** Auth0 (`@auth0/nextjs-auth0@4.29.0`) with middleware
- **Model Gateway:** OpenRouter (OpenAI-compatible, env-var switchable)
- **Maps:** Leaflet + OpenStreetMap (CartoDB Dark Matter tiles, no API key)
- **Fonts:** IBM Plex Mono/Sans + 6 Noto Sans Indic scripts (Devanagari, Telugu, Tamil, Bengali, Gujarati, Odia)
- **Pipeline Viz:** React Flow for agent orchestration canvas

## Why This Fits "Agents, Everywhere"

The hackathon theme asks agents to live "inside the tools, channels, devices, and environments where people already have work to do." There is no environment where that matters more than an emergency control room. Our four agents don't sit in a separate chat window — they're woven into the 112 operator's console:

- The **voice agent** answers the phone call
- The **copilot** reads the case on screen
- The **dispatch agent** tracks the response
- The **news agent** provides situational awareness

Remove any one of them, and the operator's workflow breaks. That's context-dependent agency.
```

---

## Team Contributions

### Akshay Shitole (Lead)
```
Full-stack architecture and AI agent integration. Built the CopilotKit integration (useAgentContext, useFrontendTool with 6 tools, useComponent for generative UI, useHumanInTheLoop approval gates, CopilotChat with suggestions). Integrated OpenAI Realtime API voice agent with WebRTC client and ephemeral token endpoint. Set up Ambiguous AI dispatch workspace (agent provisioning, task creation, email notifications via REST API). Configured Auth0 operator authentication with middleware and graceful fallback. Added OpenRouter model gateway support. Built the Exa news search integration. Created the Leaflet incident map with severity markers.
```

### Nishant Bagul (Member)
```
Frontend UI development and dashboard design. Built the emergency console layout, case sidebar, case detail view, and translation panel. Implemented the dark theme design system with Tailwind CSS custom tokens. Added Indic language font support (Noto Sans Devanagari, Telugu, Tamil, Bengali, Gujarati, Odia). Worked on the agent pipeline visualization using React Flow.
```

### Rishikesh Ombase (Member)
```
Data modeling and crisis case design. Created the multilingual mock dataset with 9 crisis cases across 9 Indian languages (Telugu, Hindi, Marathi, Tamil, Bengali, Gujarati, Odia, Kannada, Malayalam). Designed the case severity classification system, SLA timers, and timeline event structure. Assisted with testing the CopilotKit tools and voice agent multilingual capabilities.
```

### Rohit Darekar (Member)
```
Testing, demo preparation, and deployment. Tested the end-to-end flow: voice call → case creation → copilot triage → dispatch via Ambiguous AI. Prepared the 2-minute demo video and recording setup. Managed the GitHub repository and documentation. Assisted with the OpenAI Realtime API voice agent testing across multiple Indian languages.
```

---

## Additional Links

```
GitHub: https://github.com/akshayy-ai/sankatmochan
```

---

## Prior Work

```
The project was built entirely during the hackathon. The Next.js project was scaffolded with create-next-app at the start of the build session. No prior code, designs, or agent implementations existed before the hackathon. All integrations (CopilotKit, OpenAI Realtime, Ambiguous AI, Exa, Auth0, OpenRouter) and the emergency response console UI were built from scratch during the event.
```

---

## Social Media Post (Twitter/X)

```
🚨 Built संकटमोचन (Sankatmochan) at @AITinkerers #AgentsEverywhere hackathon — an AI emergency response console for India's 112 helpline.

4 AI agents inside the operator's workflow:
📞 @OpenAI Realtime Voice — answers 112 calls in 10+ Indian languages
🤖 @CopilotKit — AI copilot with live case context + generative UI
📋 @ambiguousio — dispatch tracking + agency notifications
📰 @exaailabs — real-time disaster intelligence

Plus @openrouter model gateway + @auth0 operator auth.

When someone calls 112 in panic in Telugu or Marathi, every second on translation = a second without help. Sankatmochan eliminates that gap with agents that live WHERE emergencies are managed.

🇮🇳 Hindi · Marathi · Telugu · Tamil · Bengali · Gujarati · Kannada · Malayalam · Odia

Team: Agentic Mindmesh 🏗️ Pune

#AgentsEverywhere #OpenAI #CopilotKit @triggerdotdev @mozillaAI @googlecloud
```

## Social Media Post (LinkedIn)

```
🚨 Just built Sankatmochan (संकटमोचन) at the AI Tinkerers "Agents, Everywhere" global hackathon in Pune!

The problem: India's 112 emergency helpline serves 1.4 billion people across 22+ languages. When someone calls in crisis in Marathi, Telugu, or Tamil — manual translation adds 3-5 minutes to response time. In emergencies, that's the difference between life and death.

Our solution: 4 AI agents embedded directly into the emergency operator's workflow:

📞 Voice Agent (OpenAI Realtime API) — Answers 112 calls in the caller's language via WebRTC. Auto-detects Hindi, Marathi, Telugu, Tamil, Bengali + more. Triages, gathers location, creates cases — all by voice.

🤖 Copilot Agent (CopilotKit v2) — AI assistant in the operator's console with full case context. Summarizes cases, searches disaster news, proposes escalations with human-in-the-loop approval gates.

📋 Dispatch Agent (Ambiguous AI) — Creates tracked tasks and sends notifications to NDRF, hospitals, fire brigade via a dedicated workspace.

📰 News Agent (Exa) — Live disaster intelligence relevant to the current case's region.

🔐 Auth (Auth0) — Operator authentication for the emergency console.

🔄 Model Gateway (OpenRouter) — Multi-provider model routing support.

Tech: Next.js 15 · OpenAI Realtime · CopilotKit v2 · Ambiguous AI · Exa · Auth0 · OpenRouter · Leaflet/OSM · 10 Indic language fonts

The theme was "agents in the places people already work" — there's no place where that matters more than an emergency control room.

Team: Agentic Mindmesh — Akshay Shitole, Nishant Bagul, Rishikesh Ombase, Rohit Darekar

#AgentsEverywhere #AITinkerers #OpenAI #CopilotKit #AmbiguousAI #OpenRouter #Exa #Auth0 #EmergencyResponse #AI #Hackathon
```
