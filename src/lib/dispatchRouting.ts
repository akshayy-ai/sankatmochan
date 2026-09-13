/**
 * Which agencies an incident needs, derived from its category and severity.
 *
 * This is a deterministic table on purpose. Routing a fire to the fire brigade
 * is not a judgement call, and it must not depend on a model being reachable —
 * the moment it matters most is a mass-casualty event, which is exactly when
 * an API is slowest or down.
 *
 * The model still contributes: vision can name extra units it can see the need
 * for (a crane, NDRF for water rescue), and those are merged on top. It can
 * only ADD to this table, never remove from it.
 */

export type Agency = "POLICE" | "HOSPITAL" | "FIRE" | "NDRF" | "SDRF";

export type Recommendation = {
  agency: Agency;
  /** Why this agency, in words an operator can act on. */
  reason: string;
  /** true when this should go out first. */
  primary: boolean;
};

const LABEL: Record<Agency, string> = {
  POLICE: "Police Control",
  HOSPITAL: "Ambulance / Trauma",
  FIRE: "Fire Brigade",
  NDRF: "NDRF",
  SDRF: "SDRF",
};

export function agencyLabel(a: Agency): string {
  return LABEL[a] ?? a;
}

/**
 * Base routing by category.
 *
 * Several categories carry more than one agency, because the common real
 * failure is sending one unit to a scene that needed two — an accident needs
 * police to control the road AND an ambulance for casualties, and dispatching
 * only one of them wastes the minutes that matter.
 */
const BY_CATEGORY: Record<string, Recommendation[]> = {
  FIRE: [
    { agency: "FIRE", reason: "Active fire or smoke reported", primary: true },
    { agency: "HOSPITAL", reason: "Burns and smoke inhalation likely", primary: false },
  ],
  MEDICAL: [
    { agency: "HOSPITAL", reason: "Medical emergency reported", primary: true },
  ],
  ACCIDENT: [
    { agency: "HOSPITAL", reason: "Casualties likely at the scene", primary: true },
    { agency: "POLICE", reason: "Road control and scene management", primary: true },
  ],
  FLOOD: [
    { agency: "NDRF", reason: "Water rescue capability required", primary: true },
    { agency: "SDRF", reason: "State response for local flooding", primary: true },
  ],
  SAFETY: [
    { agency: "POLICE", reason: "Threat to personal safety reported", primary: true },
  ],
  DV: [
    { agency: "POLICE", reason: "Domestic violence — police response", primary: true },
  ],
  MISSING: [
    { agency: "POLICE", reason: "Missing person — police investigation", primary: true },
  ],
  GENERAL: [
    { agency: "POLICE", reason: "Unclassified — police to assess", primary: true },
  ],
};

/** Severity to the priority field the dispatch API expects. */
export function priorityFor(severity: string): string {
  switch (severity) {
    case "CRITICAL": return "P1";
    case "HIGH": return "P2";
    case "MEDIUM": return "P3";
    default: return "P4";
  }
}

/**
 * Recommend agencies for a case.
 *
 * `extraUnits` accepts names the vision model suggested (POLICE, AMBULANCE,
 * FIRE, RESCUE, NDRF). They are additive only.
 */
export function recommendAgencies(
  category: string,
  severity: string,
  extraUnits: string[] = []
): Recommendation[] {
  const base = BY_CATEGORY[category] ?? BY_CATEGORY.GENERAL;
  const out: Recommendation[] = base.map((r) => ({ ...r }));

  // A CRITICAL incident gets an ambulance regardless of category. At that
  // severity someone is described as in danger of dying, and no category
  // reliably predicts whether they will need one.
  if (severity === "CRITICAL" && !out.some((r) => r.agency === "HOSPITAL")) {
    out.push({
      agency: "HOSPITAL",
      reason: "CRITICAL severity — casualties possible",
      primary: false,
    });
  }

  const MAP: Record<string, Agency> = {
    POLICE: "POLICE",
    AMBULANCE: "HOSPITAL",
    HOSPITAL: "HOSPITAL",
    FIRE: "FIRE",
    RESCUE: "NDRF",
    NDRF: "NDRF",
    SDRF: "SDRF",
  };

  for (const u of extraUnits) {
    const a = MAP[String(u).toUpperCase().trim()];
    if (a && !out.some((r) => r.agency === a)) {
      out.push({ agency: a, reason: "Identified from the scene photograph", primary: false });
    }
  }

  // Primary agencies first, so the operator's eye lands on what goes now.
  return out.sort((a, b) => Number(b.primary) - Number(a.primary));
}
