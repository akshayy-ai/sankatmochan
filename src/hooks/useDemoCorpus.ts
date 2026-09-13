"use client";

import type { CrisisCase } from "@/data/mock";
import { buildDemoCorpus } from "@/lib/demoDataset";

/** How many cases the seeded corpus holds. */
export const CORPUS_SIZE = 1000;

/**
 * How many corpus cases the queue shows.
 *
 * The sidebar renders every case it is given straight to the DOM with no
 * virtualisation, so handing it a thousand rows would be slow AND useless — an
 * operator, or a judge, gets a wall they cannot navigate. A shift's worth of
 * open work is the useful thing to look at; the rest are summarised in the
 * stats view instead of being scrolled past.
 */
export const WORKING_SET = 40;

/**
 * The instant the corpus is generated relative to.
 *
 * Fixed on purpose. An earlier version took the epoch from the clock, which
 * meant the corpus had to be built inside an effect — reading the clock during
 * render gives the server and the client different data and throws a hydration
 * mismatch. That effect did not run reliably for every consumer, and whichever
 * view mounted without it sat on an empty array indefinitely.
 *
 * A constant epoch makes generation pure, so the corpus can just be a module
 * constant: present on the first render, identical on both sides of hydration,
 * with no effect, no cache and no shared mutable state to disagree about. The
 * cost is that seeded cases age from a fixed point rather than from now, which
 * is correct for demo data that is explicitly not live traffic.
 */
const EPOCH = Date.parse("2026-09-13T12:00:00.000Z");

/**
 * The seeded demo corpus. Built once at module load, deterministically.
 *
 * A thousand rows costs a few milliseconds, and being a plain constant means
 * every consumer sees the same data with no ordering hazard between them.
 */
export const DEMO_CORPUS: CrisisCase[] = buildDemoCorpus(CORPUS_SIZE, EPOCH);

/** Kept as a hook so call sites read naturally; no state is involved. */
export function useDemoCorpus(): CrisisCase[] {
  return DEMO_CORPUS;
}

/**
 * The slice of the corpus that belongs in the queue: open work, newest first.
 *
 * Cases whose dispatches are all complete are excluded — they are done, and an
 * operator scanning a queue is looking for what still needs them.
 */
export function workingSet(corpus: CrisisCase[]): CrisisCase[] {
  const actionable = corpus.filter(
    (c) =>
      c.status !== "CLOSED" && // an operator already dealt with it
      !c.dispatched?.every((d) => d.state === "complete") // every unit reported back
  );

  // Breaches first, then newest. A queue is read top-down under pressure, so the
  // cases nobody has answered belong where the eye lands, not buried by recency.
  return actionable
    .sort((a, b) => {
      if (Boolean(a.slaEscalated) !== Boolean(b.slaEscalated)) return a.slaEscalated ? -1 : 1;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    })
    .slice(0, WORKING_SET);
}
