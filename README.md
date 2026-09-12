<p align="center">
  <img src="https://img.shields.io/badge/संकटमोचन-112_ERC-00D4AA?style=for-the-badge&labelColor=0A0E13" alt="Sankatmochan" />
</p>

<h1 align="center">संकटमोचन · Sankatmochan</h1>

<p align="center">
  <b>Multilingual AI Emergency Response Console for India's 112 Helpline</b>
  <br />
  <i>10+ Indian languages · Voice + Text + WhatsApp · Real-time AI triage</i>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/OpenAI-Realtime_Voice-412991?logo=openai" alt="OpenAI" />
  <img src="https://img.shields.io/badge/CopilotKit-AI_Copilot-6366f1?logo=data:image/svg+xml;base64,PHN2Zy8+" alt="CopilotKit" />
  <img src="https://img.shields.io/badge/Ambiguous_AI-Dispatch-FF6B35" alt="Ambiguous AI" />
  <img src="https://img.shields.io/badge/Exa-News_Search-0EA5E9" alt="Exa" />
  <img src="https://img.shields.io/badge/OpenRouter-Model_Gateway-7C3AED" alt="OpenRouter" />
  <img src="https://img.shields.io/badge/Auth0-Identity-EB5424?logo=auth0" alt="Auth0" />
  <img src="https://img.shields.io/badge/Leaflet-Maps-199900?logo=leaflet" alt="Leaflet" />
</p>

---

## 🚨 What is Sankatmochan?

**Sankatmochan** (संकटमोचन — "the one who resolves crisis") is an AI-powered emergency response console built for India's 112 helpline operators. It tackles the #1 problem in Indian emergency response: **language barriers**.

India has 22 official languages and 780+ dialects. When someone calls 112 in a panic — in Marathi, Telugu, Tamil, or Odia — every second spent on translation is a second lost. Sankatmochan eliminates that gap.

### The Problem

- 🇮🇳 India's 112 helpline serves 1.4 billion people across 22+ languages
- 🗣️ Callers in distress speak their native language — operators often don't understand
- ⏱️ Manual translation adds 3-5 minutes to critical response times
- 📋 No unified triage system across language barriers

### The Solution

An AI console where **agents live inside the emergency workflow** — not as a chatbot, but as integral parts of the operator's toolkit:

1. **Voice Agent** (OpenAI Realtime) — answers 112 calls in the caller's language, triages automatically
2. **Copilot Agent** (CopilotKit) — sits beside the operator, summarizes cases, searches news, proposes escalations
3. **Dispatch Agent** (Ambiguous AI) — tracks dispatches, sends notifications, maintains audit trail
4. **News Agent** (Exa) — pulls live disaster updates for situational awareness

---

## 🎯 Hackathon: AI Tinkerers — "Agents, Everywhere"

> *Build an agent for a place people already work, talk, and live — then make it meaningfully more useful because of that context.*

**Where agents live in Sankatmochan:**

| Agent | Where It Lives | Why Context Matters |
|-------|---------------|-------------------|
| 📞 Voice Agent | Inside the 112 phone call | Hears the caller's language, tone, and urgency — no copy-paste |
| 🤖 Copilot Agent | Inside the operator's console | Sees the selected case, queue, severity — acts with full context |
| 📋 Dispatch Agent | Inside the team workspace | Creates tasks, sends emails, tracks everything — not a one-shot API |
| 📰 News Agent | Inside the triage workflow | Searches disaster news relevant to THIS case's region |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    SANKATMOCHAN CONSOLE                       │
│                                                              │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────────┐  │
│  │  Case     │  │  Case Detail │  │  CopilotKit Panel     │  │
│  │  Sidebar  │  │  + Leaflet   │  │  • AI Chat            │  │
│  │  (Queue)  │  │    Map       │  │  • Generative UI      │  │
│  │           │  │  + Timeline  │  │  • Tool Calls         │  │
│  │  9 cases  │  │  + Translate │  │  • Suggestions        │  │
│  └──────────┘  └──────────────┘  └───────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │  📞 Voice Agent Tab (OpenAI Realtime WebRTC)             ││
│  │  • Multilingual 112 call simulation                      ││
│  │  • Auto language detection (Hindi, Marathi, Telugu...)    ││
│  │  • Real-time transcript + case creation                  ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
        │                    │                    │
        ▼                    ▼                    ▼
  ┌──────────┐      ┌──────────────┐     ┌──────────────┐
  │ OpenAI   │      │  Ambiguous   │     │     Exa      │
  │ Realtime │      │  AI Workspace│     │  News API    │
  │ (Voice)  │      │  (Dispatch)  │     │  (Search)    │
  └──────────┘      └──────────────┘     └──────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 15, React 19, TypeScript | App shell, SSR, routing |
| **AI Copilot** | CopilotKit v2 | In-context AI assistant with tools + generative UI |
| **Voice** | OpenAI Realtime API (gpt-realtime) | WebRTC voice agent, multilingual 112 calls |
| **Dispatch** | Ambiguous AI | Workspace tasks, email dispatch, audit trail |
| **News** | Exa API | Live disaster/emergency news search |
| **Model Gateway** | OpenRouter | Multi-provider model routing (OpenAI, Anthropic, Google) |
| **Auth** | Auth0 | Operator authentication + identity management |
| **Maps** | Leaflet + OpenStreetMap (CartoDB Dark Matter) | Incident location mapping |
| **Styling** | Tailwind CSS + custom design tokens | Dark emergency console theme |
| **Fonts** | IBM Plex Mono/Sans + Noto Sans (Devanagari, Telugu, Tamil, Bengali, Gujarati, Odia) | Native script rendering |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- OpenAI API key ([platform.openai.com](https://platform.openai.com/api-keys))
- Exa API key ([dashboard.exa.ai](https://dashboard.exa.ai)) — optional, for news search

### Setup

```bash
# Clone
git clone https://github.com/akshayy-ai/sankatmochan.git
cd sankatmochan

# Install
npm install

# Configure
cp .env.local.example .env.local
# Edit .env.local with your API keys

# Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — requires a 1320px+ viewport (emergency console).

### Environment Variables

```env
# Required
MODEL_PROVIDER=openai
OPENAI_API_KEY=sk-...
MODEL=gpt-4o

# Optional
EXA_API_KEY=...              # Exa news search
AMBIGUOUS_API_KEY=...        # Ambiguous AI dispatch
AMBIGUOUS_API_URL=https://api.ambiguous.ai
AMBIGUOUS_WORKSPACE_EMAIL=...
```

---

## 📂 Project Structure

```
sankatmochan/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Main dashboard
│   │   ├── layout.tsx                  # CopilotKit provider + fonts
│   │   └── api/
│   │       ├── copilotkit/[[...path]]/ # CopilotKit runtime (AI agent)
│   │       ├── realtime/session/       # OpenAI Realtime ephemeral tokens
│   │       ├── dispatch/               # Ambiguous AI dispatch bridge
│   │       └── news/                   # Exa news search proxy
│   ├── components/
│   │   ├── Header.tsx                  # Nav with Console/Pipeline/Bridge/Voice tabs
│   │   ├── CaseSidebar.tsx             # Case queue (9 multilingual cases)
│   │   ├── CaseDetail.tsx              # Case view + map + timeline + translation
│   │   ├── IncidentMap.tsx             # Leaflet map with severity markers
│   │   ├── CopilotPanel.tsx            # CopilotKit AI chat sidebar
│   │   ├── CopilotProvider.tsx         # CopilotKit client boundary
│   │   ├── EmergencyContext.tsx        # Agent context + frontend tools
│   │   ├── GenerativeUI.tsx            # Agent-renderable components + approval gates
│   │   ├── VoiceCallPanel.tsx          # 112 Voice Agent UI
│   │   ├── UserMenu.tsx               # Auth0 operator identity / sign-out
│   │   └── AgentCanvas.tsx             # Pipeline visualization (React Flow)
│   ├── lib/
│   │   ├── realtime-client.ts          # WebRTC client for OpenAI Realtime
│   │   ├── auth0.ts                    # Auth0 client instance
│   │   └── exa.ts                      # Exa API client
│   └── data/
│       └── mock.ts                     # 9 crisis cases in 9 Indian languages
```

---

## 🌐 Supported Languages

| Language | Script | Sample Case |
|----------|--------|------------|
| Telugu | తెలుగు | Flood rescue — "నీళ్ళు ఇంట్లోకి వస్తున్నాయి" |
| Hindi | हिन्दी | Pharmacy needed — "बुखार है, दवाई चाहिए" |
| Marathi | मराठी | Fall injury — "आजोबा पडले, डोक्याला लागलं" |
| Tamil | தமிழ் | Building collapse — "கட்டிடம் இடிந்தது" |
| Bengali | বাংলা | Chest pain — "বুকে ব্যথা হচ্ছে" |
| Gujarati | ગુજરાતી | Road accident — "ગાડી પલટી ગઈ" |
| Odia | ଓଡ଼ିଆ | Missing child — "ପିଲା ହଜିଯାଇଛି" |
| Kannada | ಕನ್ನಡ | Gas leak — "ಗ್ಯಾಸ್ ಸೋರುತ್ತಿದೆ" |
| Malayalam | മലയാളം | Snake bite — "പാമ്പ് കടിച്ചു" |
| English | English | Fire report — "Building on fire" |

---

## 🏆 Sponsor Integrations

### OpenAI (Marquee Sponsor)
- **Realtime API** (`gpt-realtime`) — Voice agent for 112 calls via WebRTC
- **GPT-4o** — CopilotKit agent brain for text-based triage
- Multilingual voice: auto-detects Hindi, Marathi, Telugu, Tamil, Bengali, and more

### CopilotKit (Main Sponsor)
- `useAgentContext` — Feeds live case data to the AI
- `useFrontendTool` — 5 tools: select_case, get_case_summary, search_news, escalate_case, dispatch_to_agency
- `useComponent` — Generative UI: emergency_card, case_timeline
- `useHumanInTheLoop` — Approval gate for dispatch confirmations
- `CopilotChat` — Live AI sidebar with suggestion buttons

### Ambiguous AI (Supporting Sponsor)
- Agent workspace with its own email identity
- Task creation for dispatch tracking
- Email notifications to emergency agencies
- Full audit trail in workspace

### Exa (Supporting Sponsor)
- Real-time disaster news search
- Region-specific emergency updates
- Integrated via CopilotKit tool

### OpenRouter (Main Sponsor)
- Model gateway support — switch providers via env var (`MODEL_PROVIDER=openrouter`)
- Enables routing across OpenAI, Anthropic, Google, and open-source models
- Zero code change — same CopilotKit runtime, different provider

### Auth0 (Supporting Sponsor)
- Operator authentication for the emergency console
- Login page with Auth0 Universal Login
- Session management via `@auth0/nextjs-auth0` v4
- Graceful fallback — console works without Auth0 in demo mode

---

## 👥 Team

Built at **AI Tinkerers "Agents, Everywhere" Hackathon** — Pune, September 12, 2026.

---

## 📄 License

MIT

