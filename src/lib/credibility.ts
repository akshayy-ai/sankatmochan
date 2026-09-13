import type { LiveCase } from "./caseStore";

/** A case as the read path serves it, with clustering already applied. */
type CaseWithCluster = LiveCase & {
  cluster?: { id: string; size: number; major: boolean };
};

/**
 * Context an operator should have before they judge a report.
 *
 * India's 112 carries a heavy load of hoax calls, and an operator working a
 * queue deserves to know when a sender has wasted their time before. But a
 * hoax filter is the most dangerous thing in this codebase, so two rules hold
 * absolutely:
 *
 *   1. It NEVER suppresses, hides, deprioritises or lowers the severity of a
 *      case. It attaches context and nothing else. Every report reaches the
 *      queue exactly as it would have.
 *   2. It is grounded in PRIOR HUMAN JUDGEMENT, not in the model's opinion of
 *      whether a story sounds plausible. The only strong signal here is that
 *      an operator has already dismissed this sender's reports before.
 *
 * WHAT IS DELIBERATELY NOT A SIGNAL — every one of these is a trait of
 * genuine emergency callers, and treating any of them as suspicious would
 * target the people least able to make themselves believed:
 *
 *   - Incoherence or contradiction. Panic sounds exactly like this.
 *   - Brevity. "मदद" is the whole message a terrified person sends.
 *   - Refusing to explain, or asking to be called back later. That is the
 *     domestic-violence and trafficking pattern, not evasion.
 *   - Repeat contact from one number. A recurring crisis recurs.
 *   - A child's voice or childlike phrasing. Children make real 112 calls,
 *     and are the least likely to be believed when they do.
 *   - No location. Many callers genuinely do not know where they are.
 */

export type Credibility = {
  /** Advisory only. Never gates anything. */
  level: "corroborated" | "normal" | "check_history";
  /** Shown to the operator verbatim. */
  note?: string;
  /** How many of this sender's earlier reports an operator dismissed. */
  priorDismissals?: number;
};

/**
 * Explicit self-declared non-emergencies only.
 *
 * This matches people SAYING they are joking or testing — nothing inferred
 * about whether an emergency sounds real. A caller who says "just testing"
 * has told us; a caller whose story sounds far-fetched has not.
 */
const SELF_DECLARED = /\b(just testing|only testing|this is a test|prank|joke|kidding|मज़ाक|मजाक|टेस्ट कर|खेल रहा)\b/i;

export function assessCredibility(
  c: CaseWithCluster,
  all: CaseWithCluster[]
): Credibility {
  // Corroboration is the one strong POSITIVE signal, and it is the only
  // direction this reasoning runs safely. Several independent people
  // describing the same incident is real evidence it happened. The inverse is
  // not true: a lone report is simply a lone report, and most real
  // emergencies are reported once.
  if (c.cluster && c.cluster.size >= 2) {
    return {
      level: "corroborated",
      note: `${c.cluster.size} independent callers describe this same incident.`,
    };
  }

  // Prior human judgement on this sender. Not the model's opinion — an
  // operator looked at those earlier reports and cleared them.
  if (c.chatId && c.chatId !== 0) {
    const priors = all.filter(
      (o) => o.id !== c.id && o.chatId === c.chatId && o.reviewedByOperator
    ).length;

    if (priors >= 2) {
      return {
        level: "check_history",
        priorDismissals: priors,
        note:
          `An operator has previously reviewed and cleared ${priors} reports from this sender. ` +
          `Treat this one on its own merits — a repeat sender can still have a real emergency, ` +
          `and people in recurring danger contact 112 repeatedly.`,
      };
    }
  }

  // The caller has said themselves that this is not real.
  const text = `${c.message} ${c.englishTranslation}`;
  if (SELF_DECLARED.test(text)) {
    return {
      level: "check_history",
      note:
        "The message itself says this is a test or a joke. Confirm before closing — " +
        "the words also appear when somebody is minimising a real situation in front of another person.",
    };
  }

  return { level: "normal" };
}
