# Sankatmochan — Conversation State Implementation Plan

One plan, three channels, one shared store. Ordered by what it buys a caller who is in danger right now, not by what is easy.

---

## 0. Verdict on the three designs

All three designs get the same three things right, and those survive intact:

- **The case *is* the conversation.** No separate Incident entity. One `LiveCase` grows turns and a lifecycle. (Two entities means two things to sync, two things to evict, and a console that renders one of them.)
- **Ambiguity resolves toward CONTINUE.** A wrong merge is one case with a stray paragraph; a wrong split is two incomprehensible half-cases racing each other down the queue.
- **Timeouts change routing, never the operator's view.** Silence from someone in crisis is the strongest available signal that something is wrong. It is never read as resolution.

What does not survive is the machinery under them. Several pieces as drafted are **regressions against code that works live today** — the Telegram watchdog that drops a voice note where today's code at least says "could not transcribe", the Vobiz idempotency cache that freezes the DV "press 1" rung, the Realtime casing bug that makes quiet mode permanently false. Those are fixed below.

### Critiques I am rejecting, and why

| # | Rejected | Why |
|---|---|---|
| R1 | **"We emit `<Hangup/>` in exactly one circumstance, everything else is unbounded."** | Unbounded hold loops exhaust Vobiz channel concurrency. During a flood the busy signal happens at the carrier, invisibly, with no case and no log line. That drops more callers than a controlled release does. Phone gets a **bounded** hold: unbounded while the caller is speaking; after the case is filed *and* located *and* 10 silent laps (~5 min), speak the case number and release with `closeReason: "held_out"`, everything intact. Capacity exhaustion is also a way to drop callers. |
| R2 | **Retroactive split machinery (merge now, split automatically when a later turn proves separateness).** | It mutates case ids the caller has already been told, and it is the wrong failure to automate. Ship the **operator split route** instead (§1.9, `POST /api/cases/[id]/split`) — it is required, not optional, because it is the only human backstop for the CONTINUE bias. |
| R3 | **"Open the Realtime case at first audio, not at connect."** | The scenario that justifies this channel is the caller who gasps one word and loses signal at second four. Keep open-at-connect — but adopt everything that motivated the objection: `provisional: true`, excluded from the map and from `liveCount`, no phantom Pune pin, `drill: true` by default. |
| R4 | **Auto-downgrade of severity; auto-merge across call legs or by phone number; model-authored case ids.** | All three trade operator seconds against caller risk in the correct direction. Severity is a high-water mark. Cross-leg matches are *linked*, never merged. Ids come from the server only. |
| R5 | **"`backfillLocation` lands Telegram pins on call cases."** | Verified unreachable: `backfillLocation` is only ever called from the Telegram location branch with a real `chat.id`, which is never `0`. The reviewer who called this a misdiagnosis is right. The guard still goes in (§1.7) because the design makes call cases long-lived, but it is not a live bug and must not displace the real ones. |
| R6 | **A 2.4 s model timeout on the phone response path.** | Any model budget on the caller's clock is dead air, and the "smart" path is absent exactly under load. Remove the model from the phone response path *entirely*: the XML is built from a deterministic ladder in <50 ms, and triage runs detached, enriching the case afterwards. |
| R7 | **`/new` and `/case TG-xxxxxx` as the mitigation for a wrong merge.** | A typed English slash command is unusable by a semi-literate Marathi speaker in a fire. Operator split is the mitigation. Native-word close/new are accepted as a convenience, never as the safety story. |
| R8 | **Telegram's `CLOSING` confirmation state.** | It is a state the system can enter and never leave: the confirming "हाँ" is classified CONTINUE by the design's own prompt, nothing reads `status === "CLOSING"`, and no timer expires it. Deleted. Caller close sets a flag; only an operator resolves. |
| R9 | **Growing `cases` past the cap "rather than drop a live case."** | Unbounded + unauthenticated + a full-array 3 s poll is an OOM that erases *every* open case at once. Hard ceiling with loud, counted, operator-visible drops. |

---

## 1. Shared state layer — `src/lib/caseStore.ts`

Everything below lands **first**. All three channels depend on it, and two of its items (ids, eviction) are live data-corruption bugs today.

### 1.1 Case ids — the highest-priority single line in the repo

`nextCaseId` is `${prefix}-${String(Date.now()).slice(-6)}` (caseStore.ts:49). The last six digits of an ms clock **wrap every 16 min 40 s**. Today that is cosmetic because cases are write-once and churn out of a 50-slot array. Every design here makes the id a routing key (`activeByChat → find(c => c.id === id)`), makes cases live for hours, and speaks the id to the caller as their reference. Collision then means caller A's fire detail is appended to caller B's case, and `page.tsx:23`'s `allCases.find(c => c.id === selectedCase)` swaps an operator's open detail pane to a different incident.

```ts
let idCounter = 0;
const byId = new Map<string, LiveCase>();

export function nextCaseId(prefix: string): string {
  for (;;) {
    const id = `${prefix}-${Date.now().toString(36)}${(++idCounter % 1296)
      .toString(36).padStart(2, "0")}`.toUpperCase();
    if (!byId.has(id)) return id;
  }
}

export function getCase(id: string): LiveCase | undefined {
  return byId.get(id);
}

/** Spoken reference: digits only, prefix said as a word, hyphen never read aloud. */
export function spokenCaseId(id: string): string {
  return id.replace(/^[A-Z]+-/, "").split("").join(" ");
}
```

Nothing resolves a case by `listCases().find(...)` any more. `getCase` is the only lookup, and every call-path lookup additionally asserts the thread key matches (§1.4) so a bug degrades to "no open incident" rather than writing into a stranger's case.

### 1.2 The type

```ts
export type Channel = "TEXT" | "VOICE" | "PHOTO" | "CALL" | "SMS" | "REALTIME";

export type CaseStatus =
  | "OPEN"              // caller engaged
  | "DORMANT"           // silent past ACTIVE_TTL — routing only, still in the queue
  | "AWAITING_CALLBACK" // line dropped or went quiet on HIGH+ — a human must ring back
  | "ARCHIVED"          // routing terminal — next contact starts a new case
  | "RESOLVED";         // OPERATOR ONLY. Nothing else may set this.

export type Attention =
  | "SILENT" | "DROPPED" | "OPERATOR_REQUESTED" | "NEEDS_REVIEW"
  | "AGENT_WRAPPED" | "DOWNGRADE_SUGGESTED" | "CANNOT_SPEAK" | "DELIVERY_FAILED";

export type Slot =
  | "what" | "where" | "people" | "trapped" | "injured"
  | "ongoing" | "callback" | "safe_to_speak";

export type TurnKind =
  | "TEXT" | "VOICE" | "PHOTO" | "LOCATION" | "CALLER" | "AGENT" | "SYSTEM" | "DTMF";

export type CaseTurn = {
  seq: number;
  at: string;
  kind: TurnKind;
  text: string;            // caller's exact words, or "[photo] caption", or an agent line
  english?: string;
  confidence?: number;     // ASR confidence where the channel supplies one
  answers?: Slot;
  mediaId?: string;        // telegram file_id — audio/photo stays recoverable
  note?: string;
  pending?: boolean;       // written before enrichment; cleared when enrichment lands
};

export type LiveCase = {
  // ── existing, unchanged names (console + CopilotKit read these) ──
  id: string;
  chatId: number;
  senderName: string;
  message: string;
  language: string;
  englishTranslation: string;
  severity: string;
  category: string;
  timestamp: string;          // opened at — never rewritten
  location: string;
  channel: Channel;
  audioTranscript?: string;
  imageAnalysis?: string;
  callUuid?: string;
  callerNumber?: string;

  // ── new, all NON-optional so no channel can create a half-case ──
  threadKey: string;          // "tg:<chatId>" | "call:<uuid>" | "rt:<sessionId>" | "sms:<sender>"
  sessionId?: string;
  turns: CaseTurn[];
  status: CaseStatus;
  updatedAt: string;          // the caller last SPOKE. Not "we touched the object".
  rev: number;                // console diff key
  summary: string;
  slots: Partial<Record<Slot, string>>;
  asked: Partial<Record<Slot, number>>;
  answered: Slot[];
  peakSeverity: string;
  categoryVotes: string[];    // last two model reads — category flips need two agreeing
  callerSaysResolved: boolean;
  operatorSeenAt: string | null;
  attention: Attention[];
  relatedIds: string[];
  provisional: boolean;       // opened, nothing learned yet
  drill: boolean;             // browser-mic simulation, not real 112 traffic
  lowConfidenceTurns: number;
  translationTurn: number;    // turns.length at last successful translation
  closeReason?: "caller_hungup" | "held_out" | "stalled" | "silent_call" | "swept";
};
```

`sessionId`, `callUuid`, `callerNumber`, `imageAnalysis`, `audioTranscript` stay optional; everything the lifecycle reads is required.

### 1.3 One constructor — the fix for "appendTurn throws on every case the other channels made"

SMS (`sms/webhook/route.ts:154`) and Vobiz (`vobiz/gather/route.ts:71`) build object literals. If the new fields are optional, `c.turns.push()` is a `TypeError` swallowed inside a `.catch(console.error)` — the caller gets no reply and no case row — and `Date.parse(undefined)` is `NaN`, so every age comparison is false and the case is **immortal and permanently the chat's open incident**.

```ts
export function makeCase(p: Partial<LiveCase> & {
  threadKey: string; channel: Channel; senderName: string;
}): LiveCase {
  const now = new Date().toISOString();
  const sev = p.severity ?? "MEDIUM";
  return {
    id: p.id ?? nextCaseId(PREFIX_BY_CHANNEL[p.channel]),
    chatId: p.chatId ?? 0,
    senderName: p.senderName,
    message: p.message ?? "",
    language: p.language ?? "Unknown",
    englishTranslation: p.englishTranslation ?? "",
    severity: sev,
    category: p.category ?? "GENERAL",
    timestamp: p.timestamp ?? now,
    location: p.location ?? "",
    channel: p.channel,
    threadKey: p.threadKey,
    turns: [], status: "OPEN", updatedAt: now, rev: 1,
    summary: p.summary ?? "",
    slots: {}, asked: {}, answered: [],
    peakSeverity: sev, categoryVotes: [],
    callerSaysResolved: false, operatorSeenAt: null,
    attention: [], relatedIds: [],
    provisional: p.provisional ?? false,
    drill: p.drill ?? false,
    lowConfidenceTurns: 0, translationTurn: 0,
    ...pick(p, ["audioTranscript","imageAnalysis","callUuid","callerNumber","sessionId"]),
  };
}

export function addCase(c: LiveCase): LiveCase {
  cases.unshift(c);
  byId.set(c.id, c);
  if (c.threadKey) threads.set(c.threadKey, c.id);
  evict();
  return c;
}
```

`appendTurn` still defends (`c.turns ??= []`, `if (!Number.isFinite(Date.parse(c.updatedAt))) c.updatedAt = c.timestamp ?? now`) so a stale object from a hot-reload cannot throw. Belt and braces.

**`location: ""` replaces `"Location not shared"` as the unlocated value.** The string is a display concern; the store must be able to say "unknown" in a way `hasPin()` and the console can both test. `toCrisisCase` renders the label.

### 1.4 Thread keys — never a bare `0`

Both SMS and Vobiz write `chatId: 0` today. Any map keyed on `chatId` puts every SMS sender and every phone caller into one thread. Keys are strings, always namespaced:

```ts
const threads = new Map<string, string>();          // threadKey -> case id

export const tgKey   = (chatId: number) => `tg:${chatId}`;
export const callKey = (uuid: string)   => `call:${uuid}`;
export const rtKey   = (sid: string)    => `rt:${sid}`;
export const smsKey  = (sender: string) => `sms:${sender}`;

/** The thread's current incident, aged on read. Never returns another thread's case. */
export function openIncident(threadKey: string): LiveCase | undefined {
  const id = threads.get(threadKey);
  const c = id ? byId.get(id) : undefined;
  if (!c || c.threadKey !== threadKey) return undefined;   // collision / dangling pointer
  if (c.status === "ARCHIVED" || c.status === "RESOLVED") {
    return c.status === "RESOLVED" &&
      Date.now() - Date.parse(c.updatedAt) <= REOPEN_GRACE ? c : undefined;
  }
  return c;
}
```

Group chats and shared handsets still thread every sender into one incident. Stated, not fixed: the key becomes `tg:${chatId}:${from.id}` the day groups matter. Today that would split a family passing one phone around, which is worse.

### 1.5 Mutation primitives — `touch` vs `revise`, and the high-water marks

```ts
const RANK: Record<string, number> = { NONE:0, LOW:1, MEDIUM:2, HIGH:3, CRITICAL:4 };

/** The caller spoke. Advances the silence clock AND the console diff key. */
export function touch(c: LiveCase) { c.updatedAt = new Date().toISOString(); c.rev++; }
/** Internal change (status ageing, enrichment landing). Diff key only — the
 *  silence clock must keep meaning "the caller last spoke". */
export function revise(c: LiveCase) { c.rev++; }

export function appendTurn(c: LiveCase, t: Omit<CaseTurn,"seq"|"at">): CaseTurn {
  c.turns ??= [];
  const turn: CaseTurn = { ...t, seq: c.turns.length + 1, at: new Date().toISOString() };
  c.turns.push(turn);

  if (turn.kind !== "SYSTEM" && turn.kind !== "AGENT") {
    c.provisional = false;
    if (c.status === "DORMANT" || c.status === "AWAITING_CALLBACK") c.status = "OPEN";
    c.message = capNarrative(c.message, turn.text);
    touch(c);
  } else {
    revise(c);
  }
  capTurns(c);
  return turn;
}

/** Head + tail. Truncating the head deletes the original report and the address —
 *  the part that matters most on exactly the long calls this exists for. */
function capTurns(c: LiveCase) {
  const KEEP_HEAD = 10, KEEP_TAIL = 30;
  if (c.turns.length <= KEEP_HEAD + KEEP_TAIL + 1) return;
  const elided = c.turns.length - KEEP_HEAD - KEEP_TAIL;
  c.turns = [
    ...c.turns.slice(0, KEEP_HEAD),
    { seq: -1, at: new Date().toISOString(), kind: "SYSTEM",
      text: `[${elided} turns elided — full transcript via /api/cases/${c.id}]` },
    ...c.turns.slice(-KEEP_TAIL),
  ];
}

function capNarrative(prev: string, next: string) {
  const joined = prev ? `${prev} · ${next}` : next;
  return joined.length <= 1200 ? joined : "…" + joined.slice(-1200);
}
```

**Severity is a ratchet. Category needs two votes. Location always accepts a correction.**

```ts
export function mergeTriage(c: LiveCase, t: CaseTurn, p: {
  severity?: string; category?: string; location?: string;
  translation?: string; summary?: string; language?: string;
}) {
  if (p.severity) {
    if ((RANK[p.severity] ?? 0) > (RANK[c.severity] ?? 0)) {
      c.severity = p.severity;
      if ((RANK[p.severity] ?? 0) > (RANK[c.peakSeverity] ?? 0)) c.peakSeverity = p.severity;
    } else if (p.severity !== c.severity) {
      // A hopeful sentence must never de-prioritise a live case. Record, don't apply.
      t.note = join(t.note, `turn triaged ${p.severity}; case held at ${c.severity}`);
      if (RANK[p.severity] < RANK[c.severity] - 1) addAttention(c, "DOWNGRADE_SUGGESTED");
    }
  }

  if (p.category && p.category !== "GENERAL") {
    c.categoryVotes = [...c.categoryVotes, p.category].slice(-2);
    const settled = c.categoryVotes.length === 2 && c.categoryVotes[0] === c.categoryVotes[1];
    if (c.category === "GENERAL" || settled) {
      if (p.category !== c.category) {
        t.note = join(t.note, `category ${c.category} → ${p.category}`);
        c.slots = {}; c.answered = [];   // a FIRE ladder's slots are not a MEDICAL ladder's
        addAttention(c, "NEEDS_REVIEW");
      }
      c.category = p.category;
    } else if (p.category !== c.category) {
      t.note = join(t.note, `turn read as ${p.category}`);
      addAttention(c, "NEEDS_REVIEW");
    }
  }

  // A newer pin ALWAYS wins. "wrong pin, sorry — this one" and "we moved to the gate"
  // are the normal case; caseStore's own comment says a stale position is worse than none.
  if (p.location) {
    if (c.location && c.location !== p.location)
      t.note = join(t.note, `location superseded: ${c.location}`);
    c.location = p.location;
  }

  if (p.translation) { c.englishTranslation = p.translation; c.translationTurn = c.turns.length; }
  if (p.summary) c.summary = p.summary;
  if (p.language && c.language === "Unknown") c.language = p.language;
  revise(c);
}

export function hasPin(loc: string) { return /-?\d+\.\d+\s*,\s*-?\d+\.\d+/.test(loc ?? ""); }
```

`hasPin` is exported and used in all three places that inline that regex today (caseStore.ts:89, useTelegramCases.ts:184, and the new ask-ladder).

### 1.6 Eviction — never delete a case no operator has seen

Today: `if (cases.length > MAX_CASES) cases.length = MAX_CASES` (caseStore.ts:37) — blind tail truncation. The proposed "evict only RESOLVED/ARCHIVED" is worse: the two conditions that make a case deletable become *the caller said it's fine* and *the caller stopped answering* — the exact two signals the domain forbids reading as resolution — and SMS/CALL cases with no status are immortal, so the array grows without bound.

```ts
const SOFT_MAX = Number(process.env.MAX_CASES ?? 400);
const HARD_MAX = 800;
export let droppedUnseen = 0;   // surfaced in the GET payload; the console renders it

function evict() {
  if (cases.length <= SOFT_MAX) return;
  const removable = (c: LiveCase) => c.operatorSeenAt !== null &&
    (c.status === "RESOLVED" || c.status === "ARCHIVED");
  for (let i = cases.length - 1; i >= 0 && cases.length > SOFT_MAX; i--)
    if (removable(cases[i])) drop(i);

  while (cases.length > HARD_MAX) {          // loud, counted, last resort
    const i = cases.length - 1;
    if (cases[i].operatorSeenAt === null) droppedUnseen++;
    console.error(`[caseStore] HARD_MAX breached — dropping ${cases[i].id} ` +
      `(${cases[i].severity}/${cases[i].status}, operatorSeen=${cases[i].operatorSeenAt})`);
    drop(i);
  }
}
function drop(i: number) {
  const [c] = cases.splice(i, 1);
  byId.delete(c.id);
  if (threads.get(c.threadKey) === c.id) threads.delete(c.threadKey);
}
```

A case a human has never looked at is never evicted below `HARD_MAX`. Above it, the drop is logged and counted and the count reaches the operator's screen.

### 1.7 The sweeper — the piece every design names and none builds

Every timeout in all three designs is evaluated lazily inside the inbound path, so **the silent caller — the highest-signal case in the domain — triggers nothing.** A `CRITICAL` case whose caller stops mid-sentence generates no state change, no rev bump, no console update, forever.

```ts
const ACTIVE_TTL   = 30 * 60_000;
const REOPEN_TTL   =  6 * 3_600_000;
const REOPEN_GRACE = 15 * 60_000;
const QUIET_ALERT  =  4 * 60_000;   // HIGH+ with an unanswered question

declare global { var __sankat_sweeper: ReturnType<typeof setInterval> | undefined; }

function sweep() {
  const now = Date.now();
  for (const c of cases) {
    const age = now - Date.parse(c.updatedAt);
    if (!Number.isFinite(age)) { c.updatedAt = c.timestamp; continue; }
    if (c.status === "RESOLVED") continue;

    // Deterioration, not resolution: a HIGH+ case that went quiet with a question
    // outstanding is escalated TO the operator, never away from them.
    if (RANK[c.severity] >= RANK.HIGH && age > QUIET_ALERT &&
        Object.keys(c.asked).length > c.answered.length &&
        !c.attention.includes("SILENT")) {
      appendTurn(c, { kind: "SYSTEM",
        text: `caller silent ${Math.round(age/60000)}m with a question outstanding` });
      addAttention(c, "SILENT");
      if (c.status === "OPEN") { c.status = "AWAITING_CALLBACK"; revise(c); }
    }
    if (c.status === "OPEN" && age > ACTIVE_TTL) { c.status = "DORMANT"; revise(c); }
    if (c.status !== "ARCHIVED" && age > REOPEN_TTL &&
        c.status !== "AWAITING_CALLBACK") { c.status = "ARCHIVED"; revise(c); }
    if (c.provisional && age > 5 * 60_000 && c.turns.length === 0) {
      c.closeReason = "silent_call"; c.status = "ARCHIVED"; revise(c);
    }
  }
  sweepCallSessions(now);
  sweepDedupe(now);
  for (const [k, id] of threads) if (!byId.has(id)) threads.delete(k);
  evict();
}

if (!globalThis.__sankat_sweeper) {
  globalThis.__sankat_sweeper = setInterval(sweep, 30_000);
  (globalThis.__sankat_sweeper as any).unref?.();
  console.log(`[caseStore] single-process in-memory store · pid ${process.pid} · ` +
    `sweeper armed. A container recreate wipes the queue.`);
}
```

Note what the sweeper **never** does: it never sets `RESOLVED`, and it never sets `CLOSED`. A `AWAITING_CALLBACK` case holding a callback number nobody has dialled must sort to the *top* of the queue, not out of it.

`ARCHIVED` is routing-terminal only. It is still in the operator queue until a human acknowledges it.

### 1.8 Concurrency — serialize that actually serializes, dedupe on commit

`Promise.race([fn(), timeout])` is a **fork, not a timeout.** At expiry the chain advances, the next turn starts, and the abandoned turn later calls `appendTurn` and `sendTelegram` out of order — the exact interleaving serialization exists to prevent, plus a duplicate reply to a caller in crisis.

```ts
type Chain = { p: Promise<unknown>; depth: number };
const chains = new Map<string, Chain>();
export const TURN_BUDGET_MS = 90_000;
const MAX_DEPTH = 5;

export async function serialize<T>(
  key: string,
  fn: (signal: AbortSignal) => Promise<T>,
  onOverflow?: () => void,
): Promise<T | undefined> {
  const chain = chains.get(key) ?? { p: Promise.resolve(), depth: 0 };
  if (chain.depth >= MAX_DEPTH) { onOverflow?.(); return undefined; }
  chain.depth++;

  const run = chain.p.catch(() => {}).then(async () => {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(new Error("turn-budget")), TURN_BUDGET_MS);
    try { return await fn(ac.signal); }
    finally { clearTimeout(timer); chain.depth--; }
  });

  chains.set(key, { ...chain, p: run.catch(() => {}) });
  return run;
}
```

`signal` is threaded into **every** fetch on the turn path: Telegram `getFile`, the file download, `gpt-4o-transcribe`, vision, triage. `analyzeEmergency` gains an optional `signal` (additive — the existing signature keeps working). Aborting is what makes the budget a budget.

Dedupe records **commit, not arrival**:

```ts
type SeenState = { state: "IN_FLIGHT" | "DONE"; at: number };
const seen = new Map<string, SeenState>();   // `${threadKey}:${messageId}`

/** true = suppress. An IN_FLIGHT entry older than the budget is retryable:
 *  a crash must not convert a redeliverable message into a lost one. */
export function claim(key: string): boolean {
  const hit = seen.get(key);
  if (hit?.state === "DONE") return true;
  if (hit?.state === "IN_FLIGHT" && Date.now() - hit.at < TURN_BUDGET_MS) return true;
  seen.set(key, { state: "IN_FLIGHT", at: Date.now() });
  return false;
}
export function commit(key: string) { seen.set(key, { state: "DONE", at: Date.now() }); }
export function release(key: string) { seen.delete(key); }   // failed → let Telegram retry
function sweepDedupe(now: number) {
  for (const [k, v] of seen) if (now - v.at > 30 * 60_000) seen.delete(k);
}
```

### 1.9 Read path — projection, ordering, and the two operator write routes

`GET /api/telegram/webhook` returns `listCases()` by reference (route.ts:31-34) and polls every 3 s. With turns attached that grows without bound on a long incident and is re-serialised to every open tab.

```ts
export type CaseProjection = Omit<LiveCase, "turns"> & {
  turns: CaseTurn[]; turnCount: number; full: boolean;
};

/** Ordered by activity, not insertion. An escalating case must RISE. */
export function projectCases(): { cases: CaseProjection[]; droppedUnseen: number } {
  const sorted = [...cases].sort((a, b) =>
    Date.parse(b.updatedAt || b.timestamp) - Date.parse(a.updatedAt || a.timestamp));
  return {
    cases: sorted.map((c) => ({
      ...c,
      message: c.message.length > 600 ? "…" + c.message.slice(-600) : c.message,
      englishTranslation: c.englishTranslation.length > 600
        ? "…" + c.englishTranslation.slice(-600) : c.englishTranslation,
      turns: c.turns.slice(-12),
      turnCount: c.turns.length,
      full: c.turns.length <= 12,
    })),
    droppedUnseen,
  };
}
```

Two new operator routes, both running **inside the thread's chain** so an operator write cannot race an in-flight turn and get silently un-resolved:

```ts
// src/app/api/cases/[id]/status/route.ts
// POST { status, seen?: true, notifyCaller?: boolean }
// - status: "RESOLVED" is reachable ONLY here.
// - seen: stamps operatorSeenAt, making the case evictable and clearing the UPDATED badge.
// - notifyCaller defaults FALSE. An automatic "your emergency is closed" to someone
//   still in danger is worse than saying nothing.

// src/app/api/cases/[id]/split/route.ts
// POST { fromSeq }  → moves turns[fromSeq..] into a new case, cross-links relatedIds,
// writes a SYSTEM turn in both. This is the human backstop for the CONTINUE bias.
// It is REQUIRED, not a follow-up: without it a wrong merge is permanent and silent.

// GET /api/cases/[id] → the full untruncated case incl. every turn, for the detail pane.
```

### 1.10 What stays untouched in this file

`PIN_TTL_MS`, `setLastLocation`, `getLastLocation` — they solve a *different* problem (a pin arriving before any case exists) and the 30-minute reasoning is sound. `analyzeEmergency`'s signature, prompt, `FALLBACK` (`is_emergency: true` is the right instinct), and the `is_emergency !== false && severity !== "NONE"` reconciliation all stay exactly as they are; `analyzeTurn` is added **alongside**, never in place, because SMS and Vobiz call the existing one today.

`backfillLocation` is narrowed to the thread's open incident and guarded by channel:

```ts
export function backfillLocation(chatId: number, coords: string): string | null {
  const c = openIncident(tgKey(chatId));
  if (!c || c.channel === "CALL" || c.channel === "REALTIME") return null;
  const turn = appendTurn(c, { kind: "LOCATION", text: `[pin] ${coords}` });
  mergeTriage(c, turn, { location: coords });
  return c.id;
}
```

---

## 2. Console visibility — `src/hooks/useTelegramCases.ts`, `CaseSidebar.tsx`, `useSlaTimer.ts`

**This ships in the same commit as the first `appendTurn`, or not at all.** Every design says so and every reviewer repeats it, and the reason is stronger than "the re-render is broken": today a follow-up message arrives as a **fresh row at the top of the queue**. After threading it is a silent in-place mutation of a row that keeps its original index, its original 19:04 clock, and its original badge. Without the changes below, an actively escalating incident becomes visually indistinguishable from an abandoned one — strictly worse than the duplicates it replaces.

```ts
// diff on content, not identity
const prevKey = liveCases.map((c) => `${c.id}:${c.rev}`).join(",");
const nextKey = mapped.map((c) => `${c.id}:${c.rev}`).join(",");
if (prevKey !== nextKey) { liveCases = mapped; notify(); }

// memoize so an unchanged case is not re-mapped and its timeline not re-allocated
const mapCache = new Map<string, CrisisCase>();
function mapCached(t: TelegramCase): CrisisCase {
  const k = `${t.id}:${t.rev}`;
  let hit = mapCache.get(k);
  if (!hit) { hit = toCrisisCase(t); mapCache.set(k, hit); }
  return hit;
}
```

In `toCrisisCase`:

```ts
const hasCoords = hasPin(t.location);
return {
  ...,
  // Stop planting a confident marker in central Pune for a case whose location
  // is genuinely unknown. caseStore's own comment: "a stale position is worse than
  // none, because it sends responders somewhere confidently wrong."
  coords: hasCoords ? t.location.replace(/\s/g, "") : "",
  location: t.location || "Location unknown",
  status: STATUS_LABEL[t.status],              // was hardcoded "TRIAGE"
  isLive: t.status !== "RESOLVED" && t.status !== "ARCHIVED",
  updatedAt: t.updatedAt,
  turnCount: t.turnCount,
  attention: t.attention,
  callbackNumber: t.callerNumber,
  drill: t.drill,
  openedAt: t.timestamp,
  alert: buildAlert(t),   // feeds the EXISTING "flagged" sidebar filter (c.alert)
};
```

`buildAlert` maps `attention` to the `CaseAlert` shape the sidebar already renders, so `CANNOT_SPEAK` ("caller pressed 1 — cannot speak, possible DV"), `SILENT`, `DROPPED`, `NEEDS_REVIEW` and `DELIVERY_FAILED` surface through a filter that exists today and currently can never fire.

`CHANNEL_LABEL.REALTIME = "112 DRILL"` — deliberately *not* "112 VOICE", which is one character from the real `112 CALL`.

Sidebar (`CaseSidebar.tsx`):
- Apply the `sort` state — today it is set at :54/:109 and `filtered` is rendered unsorted at :141, so all three buttons are dead. Default sort: `attention` first, then severity, then `updatedAt` desc.
- Preview the **latest** turn plus `turnCount`, not the truncated first fragment.
- `UPDATED` badge persisting until `operatorSeenAt`; a severity-changed marker.
- Filter out `drill` cases by default.
- Render `droppedUnseen` as a red banner when non-zero.

`useSlaTimer.ts` — escalation currently fabricates a breach. `caseStartTimes[caseId]` is memoised on first render from the *then-current* `slaMinutes`, so `MEDIUM` (30 min) → `CRITICAL` (8 min) computes `8min − (up to 30min elapsed)` → `BREACH` on a 90-second-old case. Every escalation trains operators to ignore the red clock.

```ts
export function useSlaTimer(caseId: string, slaMinutes: number, openedAt?: string) {
  // A real opened-at wins. The synthetic id-derived offset stays ONLY for the
  // seeded demo cases, which have no real clock and are meant to look aged.
  const start = openedAt ? Date.parse(openedAt) : getSyntheticStart(caseId, slaMinutes);
  ...
}
```

---

## 3. Channel: PHONE (Vobiz) — highest caller-safety value, ships after §1 and with §2

Today's phone path is the live drop. `gather/route.ts:62-66` returns a `<Response>` with **no `<Gather>`** when speech is empty — its comment says "invite one retry rather than dropping the caller" and the XML it emits tells the caller to redial and disconnects them, *before `addCase` ever runs*. And the success path is no better: it speaks the case number and the document ends, hanging up on someone who has more to say.

### 3.1 The structural inversion — case at ANSWER time

`answer/route.ts` never parses the body. After the change, the instant Vobiz says a call connected, a `CALL-` case exists with the number, the uuid and `status: "OPEN"`. Nothing about survival depends on the call ending gracefully.

```ts
// src/app/api/vobiz/answer/route.ts
export async function POST(req: NextRequest) {
  const p = await readParams(req);
  const uuid = (p.CallUUID || "").trim() || `synthetic-${randomUUID()}`;  // NEVER ""
  const from = p.From || "Unknown";
  const s = openCall(uuid, from);
  return xml(buildAnswerXml(gatherActionUrl(req), s));
}
/** GET is a health response ONLY — an uptime monitor must not file an emergency. */
export async function GET() { return NextResponse.json({ ok: true, endpoint: "vobiz answer" }); }
```

`calls.get("")` returning the previous caller's session — so caller B's speech appends to caller A's case and B hears questions about A's fire — is prevented by the synthetic key. The `From` + 2-minute fallback is **deleted from the intra-leg path**: two people behind one office trunk or one village handset is exactly the population this reaches.

### 3.2 Every document contains a `<Gather>`, and the no-input fall-through becomes `<Redirect>`

```xml
<Response>
  <Speak language="hi-IN">समझ गया, आग लगी है।</Speak>
  <Gather inputType="speech dtmf" language="hi-IN" timeout="7" speechEndTimeout="auto"
          speechModel="phone_call" numDigits="1" hints="आग,एम्बुलेंस,फंस गया,…"
          action="…/api/vobiz/gather?case=CALL-K3F9A1&amp;uuid=…&amp;k=<sig>" method="POST">
    <Speak language="hi-IN">आप किस जगह पर हैं? इमारत का नाम और इलाका बताइए।</Speak>
  </Gather>
  <Redirect>…/api/vobiz/gather?case=CALL-K3F9A1&amp;uuid=…&amp;k=<sig>&amp;silent=1</Redirect>
</Response>
```

> **Verify this against the live number before building anything else on it.** The whole silence ladder is load-bearing on `<Redirect>`-after-`<Gather>` re-entering our handler on no-input. Test with a call where the tester simply says nothing. If Vobiz neither POSTs `action` with empty `Speech` nor follows the `Redirect`, every silence path here is fiction. **This is a 10-minute test and it gates the phase.**

### 3.3 The model leaves the response path entirely

The question comes from a **deterministic ladder**, always. The model only enriches the case, detached, after the XML is on the wire.

```ts
const LADDER: Record<string, Slot[]> = {
  FIRE:     ["where","trapped","ongoing","people"],
  MEDICAL:  ["where","injured","people"],
  ACCIDENT: ["where","injured","ongoing"],
  FLOOD:    ["where","trapped","people"],
  DV:       ["where","ongoing","safe_to_speak"],
  GENERAL:  ["where","what","people"],
};

// Phrasing is INCIDENT location, not "where are YOU" — a son in Delhi reporting his
// mother's collapse in Pune must not have his own location recorded as the scene.
const ASK: Record<Slot, Record<string,string>> = {
  where: { hi: "घटना कहाँ हुई है? इमारत या पास की कोई खूण बताइए।", en: "Where is the emergency? Give a building name or a landmark." },
  ...
};

/** where is re-askable and does not count against the CRITICAL budget until filled. */
function nextSlot(s: CallSession, c: LiveCase): Slot | null {
  if (!c.slots.where && (c.asked.where ?? 0) < 3) return "where";
  return (LADDER[c.category] ?? LADDER.GENERAL)
    .find((k) => !c.slots[k] && !c.answered.includes(k)) ?? null;
}
```

The two-attempt cap that permanently abandoned `where` — the one field dispatch cannot function without — is gone. Splitting `asked` from `answered` is what fixes it: today's draft pushes to `asked` when the question is *asked*, so a garbled or low-confidence answer retires the slot forever.

**A deterministic keyword classifier as a severity floor**, reusing the existing `HINTS` vocabulary from `answer/route.ts:17-34`. Fifteen lines, zero model dependency, and it is the only thing standing between an OpenAI outage and a queue of indistinguishable `MEDIUM`/`GENERAL` rows during a mass-casualty event:

```ts
const FLOOR = [
  [/आग|आगीच|fire|जळ/, "FIRE", "HIGH"],
  [/फंस|फसल|trapped|अंदर/, "FIRE", "CRITICAL"],
  [/सांस|बेहोश|खून|cardiac|छाती/, "MEDICAL", "CRITICAL"],
  [/पानी|बाढ़|flood|डूब/, "FLOOD", "HIGH"],
] as const;
```

### 3.4 The silence ladder — and the bug that kills it

Both drafts key idempotency on `${turn}:${hash(speech+digit)}` **and check the cache before the silence branch.** Every silent lap on one turn has identical empty speech and an identical turn number, so lap 2 replays lap 1's XML and `consecutiveSilent` is never incremented. The ladder freezes at rung 1 forever, which means **the caller who cannot speak never hears "press 1"** — the DV/hostage path, presented as the marquee safety feature, is unreachable dead code.

Order in `gather/route.ts`, exactly:

```ts
export async function POST(req: NextRequest) {
  try {
    const p = await readParams(req);
    const q = req.nextUrl.searchParams;
    if (!verifyVobizSig(q)) return xml(HOLDING_XML(req));      // auth before anything
    const uuid = p.CallUUID || q.get("uuid") || "";
    const s = getCall(uuid) ?? resumeCall(q.get("case"), uuid, p.From) ?? openCall(uuid, p.From);
    const c = getCase(s.caseId)!;

    s.lastSeenAt = Date.now();            // EVERY webhook, silence Redirects included
    const speech = (p.Speech || "").trim();
    const digit  = (p.Digits || "").trim();

    // ── 1. SILENCE BRANCH FIRST, before any dedupe cache ────────────────
    if (!speech && !digit) return xml(onSilence(req, s, c));

    // ── 2. dedupe keyed on server-side state, claimed BEFORE the work ──
    const key = `${s.turns}:${s.consecutiveSilent}:${hash(speech + digit)}`;
    const cached = s.seen.get(key);
    if (cached) return xml(cached);
    ...
```

The ladder itself:

| lap | behaviour |
|---|---|
| 1 | repeat `lastQuestionText` **verbatim**, `timeout="10"`. Verbatim, not rephrased — a distracted caller heard half of it and a new phrasing restarts comprehension from zero. |
| 2 | yes/no plus the DTMF door: *"बोल नहीं सकते तो एक दबाइए।"* Short, non-explanatory, **not** "we will send police" — the prompt plays on the handset speaker, audible to the person the caller may be hiding from. |
| 3+ | stop interviewing. `<Speak>` reassurance, bare `<Gather timeout="30">` → `<Redirect>` to itself, reassurance every third lap. |

DTMF `1` → `slots.safe_to_speak = "caller cannot speak"`, severity floored at `CRITICAL`, `addAttention(c, "CANNOT_SPEAK")`, no further open questions. Every silence lap **writes to the case** (`appendTurn({kind:"SYSTEM", text:"no response (silence 2/3)"})`) — otherwise a caller who went quiet mid-report is indistinguishable to the operator from one who hung up. Three consecutive silences on a call that reported an emergency floors severity at `HIGH`: going quiet mid-report is deterioration, not disinterest.

### 3.5 The wrap-up says only what is true

Delete the named-units promise. The system dispatches nothing — `useTelegramCases.ts:200` hardcodes `TRIAGE` and the timeline's terminal event is "Awaiting operator dispatch". Telling someone in a burning building that engines are en route can stop them self-rescuing, stop them calling a neighbour, stop them calling the real 112.

> *"आपकी सूचना कंट्रोल रूम में दर्ज हो गई है। आपका केस नंबर है <digits>। दोहराता हूँ — <digits>। कुछ और बताना हो तो बताइए, मैं सुन रहा हूँ।"*

No unit, no ETA, ever. The same rule applies to Realtime (§5) and to `dispatch_emergency_unit`'s hardcoded `"ETA: 8-12 minutes"` (realtime-client.ts:311).

### 3.6 Language

`openCall` must not hardcode `language: "Hindi"`, and the `<Gather language=>` must be re-issued in the detected language after turn 1 — with `lowConfStreak` reset when it changes, because a non-Hindi caller's first low-confidence streak is a language mismatch, not a noisy line. Today a Tamil caller is transcribed by a `hi-IN` recogniser, produces garbage, fails the confidence floor, is offered a yes/no confirmation of nonsense *in Hindi*, and is funnelled into a Hindi DTMF menu by the very machinery meant to rescue them. Until this lands, describe the phone channel as Hindi-only.

Low confidence (`< 0.45`) turns are **stored verbatim, shown to the operator marked low-confidence, and allowed to RAISE severity on keyword evidence** — never to lower it, never to be spoken back as fact. ASR confidence is inversely correlated with severity: a screamed fire report, a whispered DV call, gasping between breaths. Withholding a 0.3-confidence "there's a child inside" is the worse error.

### 3.7 Session liveness, stall, and the sweep that manufactures duplicates

`lastTurnAt` updated only on speech + a 90 s stall window + `finalizeCall` deleting the session = a caller parked in the hold loop is finalized every 90 s, `resumeCall` refuses a CLOSED case, `openCall` mints a new one, and **one silent 30-minute hold emits ~20 duplicate cases**, flushing every other incident out of the queue.

- `lastSeenAt` updates on **every** webhook.
- `STALL_MS = 300_000` (≫ 4× the longest Gather timeout).
- `finalizeCall` sets `phase = "ended"`, **never deletes** the session; it lives the full 30-min TTL.
- `resumeCall` accepts a finalized session and reopens it.
- `everSpoke` is reconstructed from `c.turns.some(t => t.kind === "CALLER" && t.text)`, never defaulted to `false`.
- The stall sweep never finalizes a session with `everSpoke === true` while webhooks are still arriving.

### 3.8 Termination on the phone

`<Hangup/>` is reachable in exactly two circumstances, both after the case is safe:

1. **`everSpoke === false`** — answered, zero speech, zero DTMF, full ladder walked, ≥5 min. Case persists as `silentCall`, `LOW`, with the number.
2. **Bounded hold release** (§R1) — case filed, `where` filled, 10 silent laps. Speak the case number and "call back if anything changes", then `<Hangup/>`, `closeReason: "held_out"`, everything intact.

Everything else ends because the caller ended it. Caller hangup is detected by a new `POST /api/vobiz/hangup` (configure as the number's Hangup URL) **and** the 5-minute stall sweep — neither trusted alone.

`escapeXml` is applied to every caller-derived string that reaches a `<Speak>` (the wrap-up speaks the ASR address back), and `encodeURIComponent` to every query value in `action`/`Redirect`. Malformed XML makes Vobiz drop the call — the exact failure this phase exists to remove. The route's outermost `try/catch` returns a **valid continue-the-call XML with an open Gather**; it may never return non-200 and may never return a document without a `<Gather>`.

---

## 4. Channel: TELEGRAM

### 4.1 Write first — literally first

The headline promise is "the write happens before the reply, always." The drafts then `await materialize()` and `await analyzeTurn()` before the first write, with a 90 s watchdog whose rejection lands in `.catch(console.error)`. Nothing anywhere materialises the promised `[analysis timed out]` turn. A caller's voice note that trips the watchdog is **written nowhere, replied to never, and logged to a console nobody reads** — strictly worse than today, where the same caller at least gets "❌ Could not transcribe audio" (route.ts:201).

```ts
// src/app/api/telegram/webhook/route.ts
export async function POST(req: NextRequest) {
  if (SECRET && req.headers.get("x-telegram-bot-api-secret-token") !== SECRET)
    return NextResponse.json({ ok: true });           // before dedupe, before anything

  let msg: TelegramMessage | undefined;
  try {
    const body = await req.json();
    msg = body?.message ?? body?.edited_message;      // corrections are turns too
    if (body?.edited_message) (msg as any).__edited = true;
  } catch { return NextResponse.json({ ok: true }); }
  if (!msg?.chat?.id) return NextResponse.json({ ok: true });   // never 500 → no retry loop

  const key = `${tgKey(msg.chat.id)}:${msg.message_id}`;
  if (claim(key)) return NextResponse.json({ ok: true });

  void serialize(tgKey(msg.chat.id),
    (signal) => handleTurn(msg!, key, signal),
    () => void sendTelegram(msg!.chat.id, "🕐 आपके पिछले संदेश पर काम चल रहा है — मैं यहीं हूँ।"),
  ).catch((e) => { release(key); console.error("turn", e); });

  return NextResponse.json({ ok: true });             // ack-before-work: UNCHANGED
}

async function handleTurn(msg: TelegramMessage, key: string, signal: AbortSignal) {
  const chatId = msg.chat.id;
  const kind = classifyKind(msg);                     // cheap, no network
  const raw  = rawTextOf(msg);                        // caption preserved, never "[photo]"
  const open = openIncident(tgKey(chatId));

  // ── STEP 1: WRITE. No model call, no download, no network precedes this. ──
  const target = open ?? addCase(makeCase({
    threadKey: tgKey(chatId), chatId, channel: kindToChannel(kind),
    senderName: nameOf(msg), message: raw, provisional: true,
  }));
  const turn = appendTurn(target, {
    kind, text: raw, mediaId: mediaIdOf(msg), pending: true,
    note: (msg as any).__edited ? "caller corrected an earlier message" : undefined,
  });

  // ── STEP 2: RECEIPT. Before the slow work, every time. ──
  await sendTelegram(chatId, receiptFor(kind, target.id)).catch(() =>
    { appendTurn(target, { kind: "SYSTEM", text: "reply delivery failed" });
      addAttention(target, "DELIVERY_FAILED"); });

  // ── STEP 3: ENRICH IN PLACE. Every failure leaves the turn written. ──
  try {
    const rich = await materialize(msg, kind, signal);   // transcript / vision / pin
    const a = await analyzeTurn(rich, ctxOf(target), signal);
    turn.english = rich.english ?? a.translation;
    turn.pending = false;
    applyRoute(target, turn, a, chatId);                 // may MOVE the turn — see 4.2
    await sendTelegram(chatId, replyFor(target, turn, a));
  } catch (e) {
    turn.pending = false;
    turn.note = join(turn.note, signal.aborted
      ? "analysis timed out — raw content attached"
      : "analysis unavailable — raw content attached");
    revise(target);
    await sendTelegram(chatId, `✅ आपका संदेश ${target.id} में दर्ज है। ` +
      `विश्लेषण अभी नहीं हो सका — ऑपरेटर देखेंगे।`);
  } finally {
    commit(key);                                        // dedupe on COMMIT, not arrival
  }
}
```

Consequences that fall out of this ordering, all of them good: the watchdog cannot lose a turn; an OpenAI outage cannot lose a turn; a failed Whisper call leaves `[voice note — transcription failed]` carrying the `file_id` so the operator can play the audio; the vision description reaches the case because `analyzeTurn` receives the **rich** text (transcript / scene description), never the placeholder `"[photo]"`.

For `PHOTO` and `LOCATION` turns, `mergeTriage` is called with **location only** — no severity, no category. A triage of the literal string `"[pin]"` must not be able to ratchet a monotonic-upward field on a real case.

### 4.2 Routing — deterministic rules outrank the model, always

Because the write happens first, routing runs *after* the turn is already in the open incident (which is where the CONTINUE fallback would put it anyway). The only movement `applyRoute` may perform is lifting a just-written turn out into a new case, within the same turn, before any operator has seen it — with a SYSTEM turn left behind in both.

First match wins:

1. **Exact-match command** (`/start`, `/help`, `/close`, `/new`, `/case <id>`, and native words for close/new). Anything *else* beginning with `/` **falls through to triage** — a prefix rule would send an emergency that happens to start with a slash to `handleCommand` and file nothing.
2. **No open incident** → NEW. See 4.3 — no first-contact drop.
3. **`ARCHIVED`, or age > `REOPEN_TTL`** → NEW, cross-linked. *(Status is checked before kind — a photo of a road accident sent five hours after a fire went quiet must not merge into the fire and ratchet its severity.)*
4. **kind is LOCATION or PHOTO and status is OPEN** → CONTINUE, unconditionally, no model vote. Nobody sends a pin to open a *second* emergency while the first is live; they are answering a question we asked. This alone kills the duplicate-spawning photos and pins cause today.
5. **`RESOLVED` within `REOPEN_GRACE`** and the model says CONTINUE → REOPEN — *unless* `resolvedBy === "OPERATOR"`, in which case a "shukriya" may not resurrect the case.
6. **`DORMANT`** → `rel === "NEW" && conf >= 0.7 ? NEW : CONTINUE`. Phrased this way deliberately: a draft that wrote `CONTINUE && conf >= 0.6 ? CONTINUE : NEW` means an OpenAI outage routes the caller who was silent 31 minutes and then writes "still trapped" into a **brand-new fragment case** — the exact headline failure, reintroduced in the worst scenario the system has.
7. **OPEN, age < 2 min** → CONTINUE **unless** the model returns NEW with `conf >= 0.85` **and** a different category. Both, not either.
8. **OPEN, 2–30 min** → model decides; NEW needs `conf >= 0.7`.
9. **Everything else — every failure, timeout, unparseable response** → CONTINUE.

`analyzeTurn(rich, ctx, signal)` is one call returning relation **and** triage, so there is no added latency and the triage itself is context-aware. That context-awareness is the entire win: `"तीसरी मंजिल पर, दो बच्चे हैं"` reads as CRITICAL/FIRE inside an open fire instead of the MEDIUM/GENERAL fragment it becomes today. The caller-authored history in the prompt is delimited and labelled as data, and `answers_slot` is **validated** against what we actually asked and against `hasPin()` before it can mark `location` answered — otherwise one spurious `answers_slot: "location"` permanently disables the single most operationally important question.

**Two live cases in one chat: not shipping.** Worked-example-C's implicit newest-wins focus is a corruption machine — every subsequent turn, including "the fire is on the 5th floor, not the 3rd", lands on the newest case, and the only escape is a typed English command. Rule 7's escape hatch stays (it is deliberately hard to trigger), but when it fires the reply **names both case ids**, `relatedIds` renders as a linked pair in the console, and `analyzeTurn` is asked which incident each following turn belongs to. If that per-turn `incident_ref` does not test out, drop the hot-window NEW escape entirely and let the operator split — which is consistent with the asymmetry this design reasons from everywhere else.

### 4.3 No silent first-contact drop

The drafts fix the `is_emergency` gate only when an incident is already open, leaving the current behaviour on **the single highest-risk message in the system: the first one.** `"मदद"`, `"हे भगवान"`, a butt-dialled voice note of screaming, a photo the vision model calls a selfie, and above all the domestic-violence and trafficking pattern of someone who cannot speak plainly ("can you call me back later") all classify non-emergency and file **nothing**. There is no record anywhere that a human contacted 112 and was turned away by a classifier.

```ts
if (!a.is_emergency && !open) {
  mergeTriage(target, turn, { severity: "LOW", category: a.category });
  addAttention(target, "NEEDS_REVIEW");          // one-click dismiss in the sidebar
  await sendTelegram(chatId, a.response || HELPLINE_BLURB);
  return;                                        // the case STAYS. The blurb still sends.
}
```

Cost: an operator glance, dismissible in one click. Cost of the reverse: the case the system was built for.

### 4.4 Reply shape and media

- **Reassurance first, question last, never a bare question.** "Where exactly are you?" opening a message reads as an obstacle to someone whose house is burning.
- One line plus at most one question after the first turn; the formatted case card is a first-turn artefact. Re-sending it every 20 seconds to someone watching a fire is noise.
- **The case id appears on every reply, compactly.** The restart-recovery story depends on it and the drafts' own follow-up spec deletes it.
- `ASK_COOLDOWN` 45 s between two questions to the same person.
- `materialize` has a **default branch**: `video`, `video_note` (the round clips people actually record in a crisis), `document` (what "send as file" produces — including full-resolution photos), `sticker`, `contact`, forwards → `[unsupported media: video_note]` with the `file_id`, filed and replied to. Today `if (!message.text) return;` (route.ts:257) gives a ten-second video of a burning building complete silence.
- Photo turns keep the **caption** as their text. `"[photo]"` discards the line where "second floor, my mother is inside" usually lives.
- A total `sendTelegram` failure appends a SYSTEM turn and sets `DELIVERY_FAILED` — the person is sitting there believing nobody received their report.

### 4.5 Telegram termination

Nothing terminates the bot's willingness to answer. Termination means only "this case stops being the default destination for the next message."

`/close` and any model-detected close set `callerSaysResolved = true` plus a SYSTEM turn; **status stays OPEN** and the case remains fully visible. A confused caller, or an abuser who grabs the phone in a DV case, must not be able to erase a live incident from the operator queue seconds after it was filed. Only an operator sets `RESOLVED`. The `CLOSING` confirmation state is deleted (§R8).

---

## 5. Channel: REALTIME voice console

Today this channel is decorative: `create_emergency_case` fabricates `CASE-${Math.random()}` (realtime-client.ts:298) and `session/route.ts` does not import `caseStore` at all. A successful triage of a life-threatening emergency is invisible to every operator.

**First, the honest framing: this panel runs on the operator's own microphone** and its own empty state says "Simulate a 112 emergency call." It is a drill surface until a telephony bridge exists. Every case it opens is `drill: true`, filtered out of the default queue, labelled `112 DRILL`. `REALTIME_LIVE=1` flips it. Mixing browser-mic drills into the same queue as real traffic under a label one character from `112 CALL` is a worse operator outcome than the duplicates this whole plan set out to fix.

### 5.1 Quiet mode — the one bug here that can get someone hurt

The tool declares `quiet_mode` (snake) while the store reads `quietMode` (camel), and `updateRealtimeCase` copies keys blind: `(c as any)[k] = v`. The write lands on `c.quiet_mode`, the read checks `c.quietMode` → permanently `undefined` → the server returns `quiet_mode: false` → the client line `quietMode = res?.quiet_mode ?? quietMode` **actively resets the optimistic latch**. A domestic-violence caller who whispers "I can't talk, he's in the next room" gets an emergency line that loudly announces itself at 8 s and again at 20 s. The same split breaks `lifeSafety` and `callbackNumber`, so `missing` never empties and the agent re-asks the callback number forever.

Three changes together:

```ts
// 1. ONE casing. camelCase in the tool schema, with additionalProperties: false.
// 2. An explicit allowlist — never (c as any)[k] = v. A model-supplied key must not
//    be able to write `id` (rewriting the number the caller was told) or `status`
//    (marking a live CRITICAL case terminal, and therefore evictable).
const WRITABLE = ["severity","category","location","language","englishTranslation",
  "senderName","callbackNumber","quietMode","lifeSafety","peopleAffected",
  "nativeSummary"] as const;
for (const [k, v] of Object.entries(patch)) {
  if (!WRITABLE.includes(k as any)) {
    appendTurn(c, { kind: "SYSTEM", text: `rejected unknown field ${k}` });
    unknown.push(k); continue;
  }
  ...
}
// 3. The latch is CLIENT-SIDE and one-way, set from the model's own ARGUMENTS
//    before any network hop, and never clearable by a server response.
if (args.quietMode) quietMode = true;
```

An integration test asserts `quietMode: true` suppresses every rung of the ladder.

### 5.2 The call must outlive the tab switch

`page.tsx:56-70` renders `VoiceCallPanel` only when `view === "voice"`. Switching to the console tab — which this design actively encourages, since the operator is supposed to watch the case escalate — unmounts the panel with **no cleanup**: the peer connection, the mic and the data channel keep running orphaned, the agent keeps talking to the caller, and the only End Call button in the system no longer exists. Returning remounts at `idle` with a green Start button, so the natural next click opens a second session and a second case while the first is still live with an open microphone. Every closure-scoped timer survives.

- Lift the session into a module-level singleton / a provider mounted **above** the `view` switch.
- `useEffect` cleanup in `VoiceCallPanel` regardless.
- A persistent call bar in `Header` (LIVE badge, elapsed, End Call) whenever a session is active, reachable from every view.
- Start disabled while a session exists; `startCall` stops any existing session first.
- End Call confirms while the caller is speaking, and **awaits the outbox flush** before teardown.

### 5.3 Transport

```ts
// `disconnected` is a state WebRTC recovers from constantly. Today it is terminal
// (realtime-client.ts:208-220) — a 2-second blip is indistinguishable from a hangup.
pc.oniceconnectionstatechange = () => {
  const s = pc.iceConnectionState;
  if (disposed) return;
  if (s === "connected") {
    if (graceTimer) { clearTimeout(graceTimer); graceTimer = null; }
    stableSince = Date.now();
  }
  if (s === "disconnected" && !graceTimer && !reconnecting) {
    graceTimer = setTimeout(() => { graceTimer = null; void reconnect(); }, 6000);
  }
  if (s === "failed") {
    if (graceTimer) { clearTimeout(graceTimer); graceTimer = null; }   // NULL it, or
    void reconnect();                                                   // grace never re-arms
  }
};
```

- A `reconnecting` flag so the grace path and the failed path cannot both enter.
- `attempt` resets after 60 s of stable `connected` — three recovered blips over a 20-minute flood call must not exhaust the budget and tear down a caller who is still speaking.
- `reconnect()` fully tears down the previous `pc`/`dc`/mic/audio/`AudioContext`/intervals **first**. Otherwise the dead pc's handler fires `failed`, schedules another reconnect against the shared counter (a storm from one flap), and if the old connection recovers — which is what `disconnected` usually does — **two agent voices talk over each other** to a panicking caller.
- A `disposed` flag checked at the top of `reconnect()`, the restartIce timeout, the outbox retry and the silence interval. `stop()` sets it and clears every timer, closes the AudioContext, stops the mic track (today it stays open, leaving the browser recording indicator lit), and nulls the ICE handler.
- `await audio.play()` with escalation on rejection. A reconnect attaches a track outside a user gesture; Chrome's autoplay policy blocks it, and then the caller speaks, the agent replies, and **the operator hears nothing** while every indicator reads green.
- An **agent-liveness watchdog**: caller speech observed with no agent audio within 12 s → `OPERATOR_REQUESTED` plus an audible alert. If OpenAI fails every `response.create` the connection stays `connected`, the UI stays LIVE, and the caller hears silence forever — the fail-quiet mode the brief names as worst.

### 5.4 Reconnect resumes the case, and the session outlives the conversation

`sessionId` is a browser-minted `crypto.randomUUID()` created **before** the token fetch, so a reconnect carries the same key: new OpenAI conversation, same case. `POST /api/realtime/session { sessionId, resume: true }` appends a context block:

```
=== CASE IN PROGRESS — RT-K7Q2 ===
You were already speaking with this caller. Do NOT greet them again and do NOT ask
anything listed as known.
Known: category=FIRE, severity=CRITICAL, location=Kothrud near Mhatre bridge,
callback=98xxxxxxxx, lifeSafety=2 children trapped 3rd floor
Still needed: caller_name
Last thing the caller said: "तिसऱ्या मजल्यावर दोन मुलं आहेत!"
Your first words must acknowledge the interruption.
```

Without it a reconnect produces *"नमस्कार, काय झालं?"* to a woman who told you thirty seconds ago that her children are trapped — worse than the drop.

**Drop the T-120s pre-expiry re-session.** `expires_at` on the client secret is the 60-second key window, not a session duration, and nothing else exposes a session cap — the timer can never be scheduled. Make the ordinary reconnect path good enough to cover it and say so.

### 5.5 Persist the caller's words, not the model's summary

Only structured fields the model chose to extract reach the store today, and `nativeSummary` **overwrites `message`**, so `message` means verbatim testimony on four channels and model paraphrase on this one, rewritten wholesale every update. Wire both transcript events (`conversation.item.input_audio_transcription.completed`, `response.audio_transcript.done`) to `appendTurn` as `CALLER`/`AGENT` turns, **including empty and garbled ones with a marker** — an operator scrubbing the case must see there was speech we failed to capture. `nativeSummary` goes to `summary`, never to `message`.

### 5.6 Outbox

```ts
let draining = false;
async function drain() {
  if (draining || disposed) return;
  draining = true;
  try {
    for (let i = 0; i < outbox.length; ) {
      const item = outbox[i];
      const r = await fetch(item.url, { method: "POST",
        body: JSON.stringify({ ...item.body, writeId: item.writeId }) });
      if (r.ok) { outbox.splice(i, 1); continue; }         // shift only on 2xx
      if (r.status >= 400 && r.status < 500) {             // poison: dead-letter, don't block
        deadLetter.push(outbox.splice(i, 1)[0]);
        persistSystemNote("write rejected — operator callback required");
        raiseAttention("OPERATOR_REQUESTED");
        continue;
      }
      i++;                                                 // 5xx: skip, retry later
    }
  } finally { draining = false; if (outbox.length) setTimeout(drain, 2000); }
}
```

Strict FIFO with "any non-2xx is retryable" means a single permanently-failing write blocks every write behind it — and the ones behind it are the HIGH→CRITICAL escalation, the callback number, "two children trapped, third floor". Invisibly, while the model is told `{note:"queued"}` and reassures the caller the case is filed. No concurrency guard means two drains race and `shift()` each other's items: the first item sent twice, the second removed **without ever being sent**.

The `pagehide` handler moves **inside** `startRealtimeSession` (guarded by `typeof window !== "undefined"` — at module scope it is an SSR crash, and `sessionId` is not even in scope there), skips the localStorage write when the beacon succeeded, and a module-load scan replays `rt-outbox-*` keyed by `writeId` so a replayed note does not duplicate. "Never discard" with no reader is worse than no promise.

### 5.7 Server owns the case; `missing` must be honest

- `/case/open`, `/case/update`, `/case/note` all **upsert by sessionId**. A restart or an eviction between open and the first write currently makes `findBySession` miss forever, every later write a silent no-op, and the agent read `case_id: undefined` aloud.
- `/case/open` returns an **open token** echoed on every later write. `middleware.ts:17` passes everything through, and these endpoints mutate the operator queue.
- Open with `category: ""` and `severity: ""`. `missing = REQUIRED.filter(f => !c[f])` is a truthiness test, so seeding `"GENERAL"`/`"UNKNOWN"` means **`category` is never in `missing`** — the model is never told to establish what is actually happening, and `mark_case_ready` can fire on a structure fire presented as `GENERAL`/`MEDIUM` with a 30-minute SLA. `severity` joins `REQUIRED`; `mark_case_ready` is refused server-side while either is unset.
- Provisional cases get their own "live, unclassified" visual state instead of `normSeverity` inventing `MEDIUM`, are excluded from `liveCount` and from the map.
- Instruction rule: **never speak a case number that did not come back in a tool result.** When none is available the result carries `{ case_id: null, do_not_state_case_number: true }`.
- Cap the `arguments_unparseable` retry, then fall through to asking the caller aloud and flagging for a human.
- Dedupe `request_operator` / `mark_case_ready` per session — a stream of alerts is how an attention signal gets ignored.
- `request_operator` may not promise a human the system cannot produce. There is no operator-join audio path. The instruction becomes "I am sending this to a person right now", which is true.
- The soft cross-channel link runs when `callbackNumber` is **first written** (not at open, when there is nothing to match on), normalising to the last 10 digits, matching recent cases **regardless of status** (restricting it to OPEN makes it dead code, since a callback by definition follows a hangup), and it **renders** as a linked pair. Suggest, never auto-merge.

---

## 6. What MUST NOT change

All of this is working and verified live. Touching it is out of scope for every phase.

**Telegram**
- Ack-before-work in `POST` (route.ts:53). Voice and photo take tens of seconds; without the early 200 the edge hands Telegram a 502 and its backoff stalls every later message.
- `analyzeImage`: the vision prompt (including the "when uncertain, set it TRUE" recall rule), the `NEEDS_REVIEW` fail-open on an empty completion, and the MIME-from-extension sniffing that works around Telegram serving `application/octet-stream`.
- `transcribeVoice`: `gpt-4o-transcribe` (whisper-1 renders आग as आत — the one word triage depends on), the emergency-vocabulary prompt, the deliberate absence of a pinned language, and the `!whisperRes.ok` logging.
- `sendTelegram`'s Markdown → plain retry. Every new reply path goes through it.
- `/start` and `/help` text.

**SMS** — the whole route. HMAC signature verification, the `sms:received` event filter, the reply format ending `Case: <id>`. Its only change is `makeCase` + `smsKey`.

**Vobiz** — `gatherActionUrl`'s origin resolution (`x-forwarded-host` before `req.nextUrl`, which reflects `0.0.0.0:3000` behind the tunnel and would send speech nowhere); `escapeXml`; `spokenCaseId`'s digit-by-digit rendering; `readParams`' form/JSON/query fallback; `HINTS`, `speechModel="phone_call"`, `speechEndTimeout="auto"`.

**Realtime** — `/v1/realtime/client_secrets` with the config nested under `session`, the dual `client_secret` shape returned for old callers, and `POST /v1/realtime/calls?model=gpt-realtime` for the SDP handshake. The beta paths 404.

**Store** — `PIN_TTL_MS` / `setLastLocation` / `getLastLocation`; `analyzeEmergency`'s signature, prompt and `is_emergency` reconciliation; `FALLBACK.is_emergency = true`.

**Console** — every `CrisisCase` field name currently consumed by `CaseDetail`, `IncidentMap`, `EmergencyContext` and CopilotKit; `normSeverity`'s NONE→LOW.

**Deploy** — `.env.local` on the host, loopback-only `127.0.0.1:3000` publish, the named Cloudflare tunnel (quick tunnels are refused by Telegram's `setWebhook`).

---

## 7. Rebuild vs config — and the queue wipe

`Dockerfile` builds `output: "standalone"` at image build time. **Every change under `src/` needs `docker compose up -d --build`.**

| Change | Rebuild? |
|---|---|
| Everything in §1–§5 | **Rebuild** |
| `TELEGRAM_WEBHOOK_SECRET`, `VOBIZ_SHARED_SECRET`, `PUBLIC_BASE_URL`, `MAX_CASES`, `REALTIME_LIVE`, `VOBIZ_GATHER_LANGUAGE` values | Config — but a **restart** to re-read `.env.local`, which also wipes the queue |
| Telegram `setWebhook` with `secret_token` | Config only — one API call via `/api/telegram/setup` |
| Vobiz **Hangup URL** on the number → `/api/vobiz/hangup` | Provider config only |
| Cloudflare tunnel hostname | Provider config; `cloudflared` restart does **not** touch the app container |

**Order matters for the webhook secret.** Deploy the verifying code in a mode that accepts a *missing* header first, then call `setWebhook` with the secret, then flip to strict on the next rebuild. Reversing it makes the bot reject every update until the second deploy.

> **Every container recreate wipes the entire in-memory queue** — all cases, all thread pointers, all call sessions, all dedupe state. A rebuild mid-incident means a live caller's next message opens a fresh case, and a live phone call's next turn falls through to the `?case=` carrier (which recovers the id where it can and otherwise files one duplicate — degrading toward a duplicate, never toward a lost word). Deploy in a quiet window. The case id printed in every reply is the only human recovery handle, which is the argument for always printing it. A startup line logs the pid and "single-process in-memory store"; on a multi-instance host (a `.vercel/` directory is sitting in this repo) every write silently no-ops, so that line must be checked after any platform change.

---

## 8. Ship order

Ordered by value to a caller in danger. Items inside a phase land in one commit.

| Phase | Contents | Why here |
|---|---|---|
| **0** | §1 entire: ids, `makeCase` + all four channels converted, `touch`/`revise`, ratchets, eviction floor, sweeper, `serialize` with abort, `claim`/`commit`, projection + `/api/cases/[id]` + status + split routes | Ids and eviction are live corruption bugs. Nothing else is safe on top of them. |
| **1** | §3 phone. **Gated on the `<Redirect>` dialect test.** | Today's code hangs up on a winded caller before `addCase` runs. This is the only channel actively dropping people. |
| **2** | §2 console — ships **with** phases 1 and 3, never after | A coherent case nobody can see is worth less than the visible duplicate it replaced. |
| **3** | §4 Telegram threading, write-first, no first-contact drop | Fixes the fragmentation in the brief and the DV/trafficking silent drop. |
| **4** | Deterioration surfacing: sweeper alerts to the sidebar, `AWAITING_CALLBACK` sorting to the top, `droppedUnseen` banner | Makes "silence is not consent to hang up" a behaviour rather than a sentence. |
| **5** | §5 Realtime | Decorative today; nothing downstream depends on it. |

---

## 9. Termination conditions — all three channels, one table

Check the implementation off against this. "Terminates" means only that the channel stops treating the case as the default destination for the next message; **no row below removes a case from the operator queue.** Only an operator sets `RESOLVED`, and only `operatorSeenAt !== null` makes a case evictable.

| Trigger | Telegram | Phone (Vobiz) | Realtime | Case status after | Visible to operator? |
|---|---|---|---|---|---|
| **Caller says it's over** | `/close` or native word or model CLOSE → `callerSaysResolved = true` + SYSTEM turn | same, in `listening` → confirm case number, then **two more silent laps** before release | model calls `mark_case_ready` | **OPEN** (unchanged) | yes, flagged `AGENT_WRAPPED` |
| **Operator resolves** | `POST /api/cases/[id]/status` | same | same | **RESOLVED** (`resolvedBy: OPERATOR`) | yes, until evicted |
| **Silence < `ACTIVE_TTL`** | nothing; next message CONTINUEs | ladder: verbatim repeat → DTMF door → unbounded hold | ladder 8 s → 20 s → 45 s, **suppressed entirely in quiet mode** | OPEN | after 45 s / lap 3: `SILENT` |
| **Silence, HIGH+ , question outstanding, > 4 min** | sweeper alert | sweeper alert | sweeper alert | **AWAITING_CALLBACK** | yes — sorts to the **top** |
| **Silence > 30 min** | → DORMANT (routing only) | n/a (call already ended) | n/a | DORMANT | yes, unchanged in queue |
| **Silence > 6 h** | → ARCHIVED; next message opens a new cross-linked case | n/a | n/a | ARCHIVED | yes until acknowledged |
| **Caller hangs up / tab closed** | n/a | hangup webhook, or 5-min stall sweep | `pagehide` → beacon flush | OPEN, `closeReason: caller_hungup` | yes |
| **Transport fails past retry budget** | n/a | n/a | 3 attempts, 1/3/6 s | **AWAITING_CALLBACK**, `DROPPED` | yes — callback number in large type |
| **Turn budget (90 s) expires** | abort, turn finalised `[analysis timed out — raw content attached]`, caller told the message is filed | n/a — model is off the response path | n/a | OPEN | yes, turn marked |
| **Model unavailable / unparseable** | CONTINUE; turn written raw | deterministic ladder + keyword severity floor | tool result `{error, retry}`, capped | OPEN | yes, turn marked |
| **`<Hangup/>` — zero speech ever** | n/a | answered, no speech, no DTMF, ladder walked, ≥5 min | n/a | ARCHIVED, `silent_call`, `LOW`, number kept | yes, filtered by default |
| **`<Hangup/>` — bounded hold release** | n/a | case filed **and** located, 10 silent laps (~5 min), case number spoken | n/a | OPEN, `closeReason: held_out` | yes |
| **Store eviction** | never below `HARD_MAX`; never while `operatorSeenAt === null` | same | same | removed | `droppedUnseen` counter + `console.error` |
| **Container recreate** | everything lost | everything lost; `?case=` carrier recovers the id or files one duplicate | everything lost; outbox replays from localStorage | — | startup log line |

**Never a terminator on any channel:** a low-confidence transcript, an `is_emergency=false` verdict, an unanswered question, a failed vision or Whisper call, an unparseable model response, turn-budget exhaustion, a caller repeating themselves, a caller going quiet, or a caller saying they are fine.