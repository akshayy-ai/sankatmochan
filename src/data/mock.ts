// Sankatmochan — Command Center mock data

export type CrisisCase = {
  id: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  category:
    | "FLOOD"
    | "MEDICAL"
    | "FIRE"
    | "SAFETY"
    | "MISSING"
    | "DV"
    | "ACCIDENT"
    | "GENERAL";
  lang: string;
  langCode: string;
  nativeText: string;
  englishText: string;
  translit: string;
  location: string;
  coords: string;
  channel: "VOICE" | "WHATSAPP" | "SMS" | "TELEGRAM" | "TG VOICE" | "TG PHOTO" | "112 CALL";
  /** True for cases ingested live (Telegram) rather than seeded into the console */
  isLive?: boolean;
  /** Set when other reports describe the same incident. */
  cluster?: { id: string; size: number; major: boolean };
  /** Operator-visible flags: unread media, failed analysis, silence. */
  attention?: string[];
  /** Agencies already notified, so a reload does not invite a double dispatch. */
  dispatched?: { agency: string; at: string; taskId?: string }[];
  /** Advisory context for the operator. Never gates or hides anything. */
  credibility?: { level: string; note?: string; priorDismissals?: number };
  timestamp: string;
  time: string;
  status: string; // "BRIDGE OPEN", "AMB EN ROUTE", "FIRE DISPATCHED", "TRIAGE", "MONITORING"
  owner: string | null;
  fixNote: string;
  timeline: TimelineEvent[];
  sourceConfidence?: number; // ASR confidence
  bleuScore?: number;
  tags: string[];
  slaMinutes: number;
  alert?: CaseAlert;
};

export type CaseAlert = {
  kind: string;
  color: string;
  title: string;
  action: string;
  body: string;
};

export type TimelineEvent = {
  time: string;
  action: string;
  badge: string;
  duration: string;
  detail: string;
  status: "done" | "active" | "pending";
};

export type PipelineNode = {
  id: string;
  label: string;
  sponsor: string;
  iconName: string;
  status: "done" | "processing" | "waiting" | "error";
  time?: string;
  detail?: string;
};

export type ChatMessage = {
  role: "bot" | "user";
  text: string;
  cite?: string;
  model?: string;
};

export const CASES: CrisisCase[] = [
  {
    id: "CASE-0471",
    severity: "CRITICAL",
    category: "FLOOD",
    lang: "Telugu",
    langCode: "te-IN",
    nativeText: "నీళ్ళు ఇంట్లోకి వచ్చేస్తున్నాయి, మా అమ్మ మంచం మీద ఉంది, కదలలేదు",
    englishText: "Water is coming into the house. My mother is on the bed, she cannot move.",
    translit: "Neellu intlōki vachēstunnāyi, maa amma mancham meeda undi, kadalaledu",
    location: "Sangli · Ward 12",
    coords: "16.85, 74.58",
    channel: "VOICE",
    timestamp: "02:14",
    time: "14:18",
    status: "BRIDGE OPEN",
    owner: "RK",
    fixNote: "TOWER + PIN FUSION",
    sourceConfidence: 0.94,
    bleuScore: 42.8,
    tags: ["IMMOBILE PERSON", "GROUND FLOOR", "RISING WATER", "1 DEPENDENT"],
    slaMinutes: 4,
    alert: {
      kind: "WATER RISING",
      color: "red",
      title: "Upstream level rising 2cm/hr",
      action: "NOTIFY SDRF",
      body: "Water level continues to rise upstream of Ward 12. Escalate extraction priority if SDRF Boat Bravo ETA exceeds 10 min.",
    },
    timeline: [
      { time: "00:00.0", action: "Inbound voice call accepted on 112 trunk", badge: "ingest", duration: "—", detail: "Pune ERC trunk 04, caller ID +91 94xx xx4471, tower triangulation queued.", status: "done" },
      { time: "00:00.4", action: "Language identified: Telugu (te-IN)", badge: "lang-id", duration: "340ms", detail: "Confidence 0.96. Second candidate Kannada 0.03. Locked Telugu ASR model and te→en glossary.", status: "done" },
      { time: "00:01.2", action: "Streaming transcription started", badge: "asr", duration: "412ms", detail: "Partial hypotheses streaming at 180ms cadence. Background noise flagged: running water, 68 dB.", status: "done" },
      { time: "00:02.8", action: "Segment translated te → en", badge: "translate", duration: "286ms", detail: "\"Water is coming into the house. My mother is on the bed, she cannot move.\"", status: "done" },
      { time: "00:03.1", action: "Threat classified FLOOD · CRITICAL", badge: "classify", duration: "190ms", detail: "Immobile dependent + rising water on ground floor triggers CRITICAL override from HIGH baseline.", status: "done" },
      { time: "00:03.6", action: "Location resolved to Sangli Ward 12", badge: "geo", duration: "520ms", detail: "Tower fix refined with WhatsApp pin history; 42m radius. Matched active SDRF flood zone SNG-FLD-03.", status: "done" },
      { time: "00:04.1", action: "SDRF team alerted — Zone SNG-FLD-03", badge: "dispatch", duration: "—", detail: "Boat team Bravo notified. ETA 8 min. Upstream water level rising 2cm/hr.", status: "active" },
      { time: "—", action: "Translation bridge open — caller ↔ SDRF", badge: "bridge", duration: "—", detail: "Live Telugu ↔ Marathi. Streaming bidirectional.", status: "active" },
      { time: "—", action: "Awaiting rescue confirmation", badge: "resolve", duration: "—", detail: "Pending SDRF on-site confirmation.", status: "pending" },
    ],
  },
  {
    id: "CASE-0470",
    severity: "HIGH",
    category: "MEDICAL",
    lang: "Marathi",
    langCode: "mr-IN",
    nativeText: "आजोबा पडले आहेत, डोक्याला लागलं आहे, रक्त येत आहे",
    englishText: "Grandfather has fallen, his head is injured and it is bleeding.",
    translit: "Aajoba padle aahet, dokyala laglay, rakt yet aahe",
    location: "Kothrud, Pune",
    coords: "18.50, 73.80",
    channel: "VOICE",
    timestamp: "02:41",
    time: "14:31",
    status: "AMB EN ROUTE",
    owner: null,
    fixNote: "TOWER FIX ONLY",
    sourceConfidence: 0.93,
    bleuScore: 44.1,
    tags: ["HEAD INJURY", "ELDERLY", "BLEEDING", "BLS"],
    slaMinutes: 6,
    timeline: [
      { time: "00:00.0", action: "Inbound voice call on 112 trunk", badge: "ingest", duration: "—", detail: "Pune ERC trunk 02, caller distressed, elderly household reported.", status: "done" },
      { time: "00:00.3", action: "Language identified: Marathi (mr-IN)", badge: "lang-id", duration: "210ms", detail: "Confidence 0.97. Marathi ASR + mr→en glossary locked.", status: "done" },
      { time: "00:01.1", action: "Streaming transcription started", badge: "asr", duration: "380ms", detail: "Partial hypotheses streaming. Caller audibly panicked, background voices present.", status: "done" },
      { time: "00:01.8", action: "Segment translated mr → en", badge: "translate", duration: "240ms", detail: "\"Grandfather has fallen, his head is injured and it is bleeding.\"", status: "done" },
      { time: "00:02.1", action: "Threat classified MEDICAL · HIGH", badge: "classify", duration: "170ms", detail: "Head injury + active bleeding + elderly patient → BLS trauma protocol triggered.", status: "done" },
      { time: "00:02.6", action: "108 Ambulance dispatched", badge: "dispatch", duration: "—", detail: "Kothrud BLS unit assigned. ETA 6 min. Advised caller to apply direct pressure to wound.", status: "active" },
      { time: "—", action: "Hospital pre-alert pending", badge: "notify", duration: "—", detail: "Nearest trauma-capable facility: Sassoon General Hospital, 4.1 km.", status: "pending" },
    ],
  },
  {
    id: "CASE-0469",
    severity: "CRITICAL",
    category: "MEDICAL",
    lang: "Marathi",
    langCode: "mr-IN",
    nativeText: "माझ्या नवऱ्याला छातीत खूप दुखतंय, श्वास घेता येत नाही",
    englishText: "My husband has severe chest pain and cannot breathe.",
    translit: "Majhya navaryala chatit khup dukhatay, shwas gheta yet nahi",
    location: "Viman Nagar, Pune",
    coords: "18.57, 73.91",
    channel: "WHATSAPP",
    timestamp: "05:02",
    time: "14:39",
    status: "AMB EN ROUTE",
    owner: "SP",
    fixNote: "SHARED PIN",
    sourceConfidence: 0.97,
    bleuScore: 51.2,
    tags: ["CHEST PAIN", "DYSPNEA", "MALE 55+"],
    slaMinutes: 6,
    timeline: [
      { time: "00:00.0", action: "WhatsApp voice note received", badge: "ingest", duration: "—", detail: "Audio 18s, Marathi detected. Auto-transcription initiated.", status: "done" },
      { time: "00:00.3", action: "Language identified: Marathi (mr-IN)", badge: "lang-id", duration: "280ms", detail: "Confidence 0.98. Native Devanagari pipeline locked.", status: "done" },
      { time: "00:01.1", action: "Transcription complete", badge: "asr", duration: "380ms", detail: "ASR confidence 0.97. Medical keywords flagged: छातीत दुखतंय, श्वास.", status: "done" },
      { time: "00:02.0", action: "Classified MEDICAL · CRITICAL", badge: "classify", duration: "210ms", detail: "Chest pain + breathing difficulty → cardiac protocol triggered.", status: "done" },
      { time: "00:02.5", action: "108 Ambulance dispatched", badge: "dispatch", duration: "—", detail: "Viman Nagar station. ETA 6 min. ALS unit with cardiac kit.", status: "active" },
      { time: "—", action: "Hospital pre-alert pending", badge: "notify", duration: "—", detail: "Nearest cardiac center: Ruby Hall Clinic, 3.2 km.", status: "pending" },
    ],
  },
  {
    id: "CASE-0468",
    severity: "HIGH",
    category: "FIRE",
    lang: "Bengali",
    langCode: "bn-IN",
    nativeText: "আমার দোকানে আগুন লেগেছে, পাশে গ্যাস সিলিন্ডার আছে",
    englishText: "There is a fire in my shop, there are gas cylinders next to it.",
    translit: "Amar dokane agun legeche, pashe gas cylinder ache",
    location: "Hadapsar, Pune",
    coords: "18.50, 73.93",
    channel: "VOICE",
    timestamp: "08:41",
    time: "14:44",
    status: "FIRE DISPATCHED",
    owner: "AM",
    fixNote: "TOWER FIX ONLY",
    sourceConfidence: 0.91,
    bleuScore: 38.5,
    tags: ["GAS CYLINDERS", "COMMERCIAL", "EXPLOSION RISK"],
    slaMinutes: 3,
    alert: {
      kind: "CAD QUEUED",
      color: "amber",
      title: "CAD dispatch queued",
      action: "CONFIRM UNITS",
      body: "Hadapsar fire tender request is queued in CAD; confirm unit assignment to avoid dispatch delay past SLA.",
    },
    timeline: [
      { time: "00:00.0", action: "Voice call received on 112", badge: "ingest", duration: "—", detail: "Caller distressed, background crackling noise detected.", status: "done" },
      { time: "00:00.5", action: "Language identified: Bengali (bn-IN)", badge: "lang-id", duration: "410ms", detail: "Confidence 0.93. Bengali ASR + bn→en glossary loaded.", status: "done" },
      { time: "00:01.8", action: "Transcription + translation", badge: "asr", duration: "520ms", detail: "Gas cylinder proximity flagged as EXPLOSION RISK modifier.", status: "done" },
      { time: "00:02.3", action: "Classified FIRE · HIGH", badge: "classify", duration: "175ms", detail: "Explosion risk elevates to priority dispatch.", status: "done" },
      { time: "00:02.8", action: "Fire tender dispatched — Hadapsar station", badge: "dispatch", duration: "—", detail: "2 units + hazmat. ETA 5 min.", status: "active" },
      { time: "—", action: "Gas company emergency notified", badge: "notify", duration: "—", detail: "HP Gas emergency line alerted.", status: "pending" },
    ],
  },
  {
    id: "CASE-0467",
    severity: "MEDIUM",
    category: "MEDICAL",
    lang: "Marathi",
    langCode: "mr-IN",
    nativeText: "आईला ताप आला आहे, थोडी अशक्तपणा जाणवतोय",
    englishText: "Mother has a fever, feeling a bit weak.",
    translit: "Aaila taap aala aahe, thodi ashaktpana janavtoy",
    location: "Deccan Gymkhana, Pune",
    coords: "18.52, 73.84",
    channel: "WHATSAPP",
    timestamp: "11:26",
    time: "14:52",
    status: "TRIAGE",
    owner: null,
    fixNote: "TOWER FIX ONLY",
    sourceConfidence: 0.9,
    bleuScore: 40.3,
    tags: ["FEVER", "NON-URGENT", "ELDERLY"],
    slaMinutes: 25,
    timeline: [
      { time: "00:00.0", action: "WhatsApp text message received", badge: "ingest", duration: "—", detail: "Marathi text, no audio. Follow-up questions sent to caller.", status: "done" },
      { time: "00:00.3", action: "Language identified: Marathi (mr-IN)", badge: "lang-id", duration: "220ms", detail: "Confidence 0.94. Text-only mr→en pipeline.", status: "done" },
      { time: "00:01.0", action: "Segment translated mr → en", badge: "translate", duration: "260ms", detail: "\"Mother has a fever, feeling a bit weak.\"", status: "done" },
      { time: "00:01.4", action: "Classified MEDICAL · MEDIUM", badge: "classify", duration: "160ms", detail: "No red-flag symptoms detected. Routed to nurse triage line.", status: "done" },
      { time: "00:02.0", action: "Nurse triage queued", badge: "dispatch", duration: "—", detail: "Deccan Gymkhana PHC callback scheduled within 25 min.", status: "active" },
    ],
  },
  {
    id: "CASE-0463",
    severity: "HIGH",
    category: "MISSING",
    lang: "Tamil",
    langCode: "ta-IN",
    nativeText: "என் மகள் பள்ளியிலிருந்து வீட்டிற்கு வரவில்லை, இரண்டு மணி நேரம்...",
    englishText: "My daughter has not come home from school, it has been two hours.",
    translit: "En magal palliyilirundhu veettirku varavillai, irandu mani neram...",
    location: "Kothrud, Pune",
    coords: "18.51, 73.81",
    channel: "SMS",
    timestamp: "12:07",
    time: "15:02",
    status: "TRIAGE",
    owner: null,
    fixNote: "TOWER FIX ONLY",
    tags: ["MINOR", "SCHOOL", "2HR OVERDUE"],
    slaMinutes: 15,
    timeline: [
      { time: "00:00.0", action: "SMS received via MSG91", badge: "ingest", duration: "—", detail: "Tamil text from basic phone. No GPS available.", status: "done" },
      { time: "00:00.2", action: "Language identified: Tamil (ta-IN)", badge: "lang-id", duration: "190ms", detail: "Text-only pipeline. Tamil→English NMT.", status: "done" },
      { time: "00:01.0", action: "Classified MISSING · HIGH", badge: "classify", duration: "220ms", detail: "Minor + 2hr window → elevated priority.", status: "done" },
      { time: "00:01.5", action: "Nearest police station alerted", badge: "dispatch", duration: "—", detail: "Kothrud PS. Missing person protocol initiated.", status: "active" },
      { time: "—", action: "School contact pending", badge: "verify", duration: "—", detail: "Attempting school admin contact for attendance verification.", status: "pending" },
    ],
  },
  {
    id: "CASE-0460",
    severity: "MEDIUM",
    category: "FLOOD",
    lang: "Odia",
    langCode: "or-IN",
    nativeText: "ଆମ ଗାଁକୁ ପାଣି ଘେରି ସାରିଛି, ରାସ୍ତା ବନ୍ଦ ହୋଇଗଲା",
    englishText: "Water has surrounded our village, the road is closed.",
    translit: "Aama gaanku pani gheri sarichi, rasta bandha hoigala",
    location: "Balasore, Odisha",
    coords: "21.49, 86.93",
    channel: "WHATSAPP",
    timestamp: "16:33",
    time: "15:08",
    status: "MONITORING",
    owner: null,
    fixNote: "TOWER FIX ONLY",
    tags: ["VILLAGE", "ROAD CLOSED", "MULTIPLE AFFECTED"],
    slaMinutes: 30,
    timeline: [
      { time: "00:00.0", action: "WhatsApp message received", badge: "ingest", duration: "—", detail: "Odia text + location pin shared.", status: "done" },
      { time: "00:00.3", action: "Language identified: Odia (or-IN)", badge: "lang-id", duration: "250ms", detail: "Confidence 0.95. Odia pipeline activated.", status: "done" },
      { time: "00:01.2", action: "Classified FLOOD · MEDIUM", badge: "classify", duration: "180ms", detail: "Road closure, no immediate life threat reported.", status: "done" },
      { time: "00:01.8", action: "NDRF monitoring activated", badge: "dispatch", duration: "—", detail: "Added to Balasore flood watch list. Hourly check-in scheduled.", status: "active" },
    ],
  },
  {
    id: "CASE-0457",
    severity: "MEDIUM",
    category: "SAFETY",
    lang: "Gujarati",
    langCode: "gu-IN",
    nativeText: "મારા ઘરની બાજુમાં દિવાલ તૂટી ગઈ છે, બહુ ખોજી છે",
    englishText: "The wall next to my house has collapsed, it is very dangerous.",
    translit: "Mara gharni bajuma dival tuti gai chhe, bahu khatarnak chhe",
    location: "Pimpri, Pune",
    coords: "18.62, 73.80",
    channel: "VOICE",
    timestamp: "21:19",
    time: "15:14",
    status: "DISPATCHED",
    owner: null,
    fixNote: "TOWER FIX ONLY",
    tags: ["STRUCTURAL", "COLLAPSE", "RESIDENTIAL"],
    slaMinutes: 20,
    timeline: [
      { time: "00:00.0", action: "Voice call on 112", badge: "ingest", duration: "—", detail: "Gujarati speaker, moderate urgency.", status: "done" },
      { time: "00:00.4", action: "Language identified: Gujarati (gu-IN)", badge: "lang-id", duration: "310ms", detail: "Confidence 0.92. gu→en translation pipeline.", status: "done" },
      { time: "00:01.5", action: "Classified SAFETY · MEDIUM", badge: "classify", duration: "200ms", detail: "Structural collapse, no injuries reported yet.", status: "done" },
      { time: "00:02.0", action: "Municipal team alerted", badge: "dispatch", duration: "—", detail: "Pimpri-Chinchwad MC structural assessment team.", status: "active" },
    ],
  },
  {
    id: "CASE-0454",
    severity: "LOW",
    category: "MEDICAL",
    lang: "Hindi",
    langCode: "hi-IN",
    nativeText: "दवा की दुकान कहाँ खुली मिलेगी, बुखार है",
    englishText: "Where can I find an open pharmacy, there is fever.",
    translit: "Dawa ki dukaan kahaan khuli milegi, bukhar hai",
    location: "Kondhwa, Pune",
    coords: "18.46, 73.89",
    channel: "WHATSAPP",
    timestamp: "22:47",
    time: "15:22",
    status: "ROUTED 104",
    owner: null,
    fixNote: "TOWER FIX ONLY",
    sourceConfidence: 0.95,
    bleuScore: 47.6,
    tags: ["NON-EMERGENCY", "ROUTED 104"],
    slaMinutes: 45,
    timeline: [
      { time: "00:00.0", action: "WhatsApp text message received", badge: "ingest", duration: "—", detail: "Hindi text query, no distress markers detected.", status: "done" },
      { time: "00:00.2", action: "Language identified: Hindi (hi-IN)", badge: "lang-id", duration: "160ms", detail: "Confidence 0.98. Text-only hi→en pipeline.", status: "done" },
      { time: "00:00.7", action: "Segment translated hi → en", badge: "translate", duration: "150ms", detail: "\"Where can I find an open pharmacy, there is fever.\"", status: "done" },
      { time: "00:01.0", action: "Classified MEDICAL · LOW", badge: "classify", duration: "140ms", detail: "No emergency indicators. Identified as pharmacy locator query.", status: "done" },
      { time: "00:01.4", action: "Routed to 104 health helpline", badge: "route", duration: "—", detail: "Auto-reply sent with nearest 24-hr pharmacy list and 104 helpline number.", status: "active" },
    ],
  },
];

export const PIPELINE_NODES: PipelineNode[] = [
  // Row 1 — ingest and understanding. Every sponsor named here is actually
  // called at runtime; the earlier list credited Sarvam AI and Trigger.dev,
  // neither of which this system uses.
  { id: "ingest", label: "Multi-Channel Ingest", sponsor: "Telegram · SMS · Vobiz", iconName: "phone-incoming", status: "done", time: "0.1s", detail: "5 CHANNELS" },
  { id: "stt", label: "Speech → Text", sponsor: "OpenAI gpt-4o-transcribe", iconName: "mic", status: "done", time: "1.8s" },
  { id: "vision", label: "Scene Analysis", sponsor: "OpenAI gpt-4o vision", iconName: "brain", status: "done", time: "2.4s" },
  { id: "translate", label: "Detect & Translate", sponsor: "OpenAI gpt-4o-mini", iconName: "languages", status: "done", time: "0.6s", detail: "15 LANGS" },

  // Row 2 — triage, enrichment and the operator surface.
  { id: "triage", label: "Triage & Severity", sponsor: "OpenAI gpt-4o-mini", iconName: "git-branch", status: "processing", time: "0.5s", detail: "SLA SET" },
  { id: "geo", label: "Location & Weather", sponsor: "Nominatim · wttr.in", iconName: "map-pin", status: "done", time: "0.5s" },
  { id: "news", label: "Disaster News Watch", sponsor: "Exa", iconName: "phone-call", status: "done", time: "1.2s" },
  { id: "console", label: "Operator Console", sponsor: "CopilotKit · Ambiguous AI", iconName: "layout-dashboard", status: "processing", detail: "LIVE" },
];

export const SPONSORS = [
  { name: "OpenAI", role: "Brain", color: "#10A37F" },
  { name: "Ambiguous AI", role: "Coordination", color: "#7C3AED" },
  { name: "CopilotKit", role: "Dashboard", color: "#3B82F6" },
  { name: "Exa", role: "Search", color: "#F59E0B" },
  { name: "OpenRouter", role: "Failover", color: "#EF4444" },
  { name: "Trigger.dev", role: "Pipeline", color: "#8B5CF6" },
  { name: "Auth0", role: "Auth", color: "#EB5424" },
  { name: "Mozilla", role: "Offline", color: "#FF7139" },
  { name: "Google Cloud", role: "Deploy", color: "#4285F4" },
];

export const COPILOT_CHAT: ChatMessage[] = [
  {
    role: "bot",
    text: "CASE-0471 is a ground-floor flood with one immobile dependent. The Telugu caller and the assigned SDRF crew do not share a language — I have pre-armed the te ⇄ mr bridge.",
    cite: "sources · asr#0471 · dispatch/SDRF-07 · zone SNG-FLD-03",
    model: "claude-3.5",
  },
  {
    role: "user",
    text: "Anything in the transcript we might have missed?",
  },
  {
    role: "bot",
    text: 'Two things. The caller said the mother "cannot move" — the classifier read that as immobility, but she later mentions a broken leg, which upgrades this to a stretcher extraction. Also 68 dB of running water suggests the flood is already inside, not approaching.',
    cite: "confidence 0.81 · 2 segments re-scored",
    model: "claude-3.5",
  },
];

export const SUGGESTED_PROMPTS = [
  "What responder gear is needed?",
  "Summarise caller history",
  "Draft handoff note",
];
