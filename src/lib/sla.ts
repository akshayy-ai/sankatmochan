/**
 * SLA windows, shared by the countdown an operator watches and the sweeper
 * that escalates on breach.
 *
 * Deliberately its own module with no imports: the browser needs this number
 * and the server needs it, and they must be the same one. Putting it beside
 * the case store would drag node:sqlite into the client bundle.
 */
const SLA_MINUTES: Record<string, number> = {
  CRITICAL: 8,
  HIGH: 15,
  MEDIUM: 30,
  LOW: 60,
};

export function slaMinutesFor(severity: string): number {
  return SLA_MINUTES[severity] ?? 30;
}
