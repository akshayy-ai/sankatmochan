"use client";

import { useMemo } from "react";
import type { CrisisCase } from "@/data/mock";
import { DEMO_CORPUS } from "@/hooks/useDemoCorpus";

/**
 * Summary of the seeded corpus.
 *
 * This is what makes a thousand cases useful instead of unscrollable: the queue
 * shows the work, this shows the shape. Every figure is computed from the cases
 * passed in — there are no constants in this file — so it stays true if the
 * corpus is regenerated at a different size.
 *
 * It is labelled as seeded data throughout. Presenting demo volume as traffic
 * this deployment handled would be the same dishonesty as the WhatsApp channel
 * that once sat in this console advertising an ingest path that did not exist.
 */

/**
 * The corpus is read from the hook here rather than passed in. Sharing one
 * module-level cache across two separate call sites proved unreliable — the
 * queue's copy populated and this one stayed empty — and a component that owns
 * the data it renders has one less thing that can silently disagree.
 */
type Props = { corpus: CrisisCase[]; liveCount: number };

const SEV_ORDER = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
const SEV_COLOR: Record<string, string> = {
  CRITICAL: "#FF4D4D",
  HIGH: "#FF9800",
  MEDIUM: "#3FD9C8",
  LOW: "#5A6572",
};

function tally<T extends string>(xs: T[]): [T, number][] {
  const m = new Map<T, number>();
  for (const x of xs) m.set(x, (m.get(x) ?? 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

function Bar({ label, n, total, color }: { label: string; n: number; total: number; color: string }) {
  const pct = total > 0 ? (n / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2 font-mono">
      <span className="text-[10px] text-text-secondary w-[104px] truncate" title={label}>{label}</span>
      <div className="flex-1 h-[6px] rounded-full bg-surface-raised overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-[10px] text-text-dim tabular-nums w-[58px] text-right">
        {n} · {pct.toFixed(1)}%
      </span>
    </div>
  );
}

function Panel({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-surface p-4 min-w-0">
      <h3 className="text-[10px] font-bold text-text-secondary tracking-wider mb-0.5">{title}</h3>
      {sub && <p className="text-[9px] text-text-dim mb-3 leading-snug">{sub}</p>}
      <div className="flex flex-col gap-1.5">{children}</div>
    </section>
  );
}

export default function ShiftStats({ corpus, liveCount }: Props) {
  // Fall back to the module constant if the prop did not arrive.
  const data = corpus.length ? corpus : DEMO_CORPUS;
  const s = useMemo(() => {
    const n = data.length;
    const langs = tally(data.map((c) => c.lang));
    const cats = tally(data.map((c) => c.category as string));
    const chans = tally(data.map((c) => c.channel as string));
    const sevs = SEV_ORDER.map((k) => [k, data.filter((c) => c.severity === k).length] as [string, number]);

    const dispatchedCases = data.filter((c) => c.dispatched?.length);
    const ackedCases = dispatchedCases.filter((c) =>
      c.dispatched!.some((d) => d.state === "accepted" || d.state === "complete")
    );
    const completeCases = dispatchedCases.filter((c) => c.dispatched!.every((d) => d.state === "complete"));
    const breached = data.filter((c) => c.slaEscalated);
    const claimed = data.filter((c) => c.claimedBy);

    const clustered = data.filter((c) => c.cluster);
    const clusterIds = new Set(clustered.map((c) => c.cluster!.id));
    const majorIds = new Set(clustered.filter((c) => c.cluster!.major).map((c) => c.cluster!.id));

    // Agency load follows from the deterministic category→agency routing table,
    // so this is a real distribution rather than an assigned one.
    const agencyLoad = tally(data.flatMap((c) => (c.dispatched ?? []).map((d) => d.agency)));

    const visitorLangs = new Set(["Japanese", "Spanish", "Arabic"]);
    const visitors = data.filter((c) => visitorLangs.has(c.lang));

    return {
      n, langs, cats, chans, sevs, dispatchedCases, ackedCases, completeCases,
      breached, claimed, clusterIds, majorIds, clustered, agencyLoad, visitors,
    };
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center font-mono text-[11px] text-text-dim">
        Building the seeded corpus…
      </div>
    );
  }

  const pct = (x: number) => ((x / s.n) * 100).toFixed(1);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-5">
      <header className="mb-4">
        <div className="flex items-baseline gap-3 flex-wrap">
          <h2 className="text-sm font-bold text-text-primary font-mono tracking-wide">SHIFT STATISTICS</h2>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-surface-raised border border-border text-text-dim tracking-wider">
            SEEDED DEMO CORPUS
          </span>
        </div>
        <p className="text-[10px] text-text-dim mt-1 leading-relaxed max-w-[760px]">
          {s.n.toLocaleString()} generated cases across {s.langs.length} languages, summarising
          what a busy shift looks like at scale. <b className="text-text-secondary">This is demo
          data, not traffic this deployment handled</b> — the {liveCount} live case
          {liveCount === 1 ? "" : "s"} in the queue are tracked separately on the Pipeline tab.
          The queue shows a working set of open cases; the rest are summarised here rather than
          scrolled past.
        </p>
      </header>

      <div className="grid grid-cols-3 gap-3 mb-3">
        {[
          { k: "DISPATCHED", v: s.dispatchedCases.length, sub: `${pct(s.dispatchedCases.length)}% of corpus` },
          { k: "ACKNOWLEDGED", v: s.ackedCases.length, sub: `${s.completeCases.length} closed out` },
          { k: "SLA BREACHED", v: s.breached.length, sub: "past deadline, nothing dispatched" },
        ].map((m) => (
          <div key={m.k} className="rounded-lg border border-border bg-surface p-3">
            <div className="text-[9px] text-text-dim tracking-wider">{m.k}</div>
            <div className="text-xl font-bold text-text-primary tabular-nums font-mono leading-tight">{m.v}</div>
            <div className="text-[9px] text-text-dim">{m.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Panel title="LANGUAGE DISTRIBUTION" sub="No language is pinned anywhere in the pipeline — the model detects what the caller uses.">
          {s.langs.map(([lang, n]) => (
            <Bar key={lang} label={lang} n={n} total={s.n} color="#3FD9C8" />
          ))}
        </Panel>

        <Panel title="SEVERITY MIX" sub="A real queue is mostly urgent-but-not-fatal. Everything critical would mean nothing is.">
          {s.sevs.map(([sev, n]) => (
            <Bar key={sev} label={sev} n={n} total={s.n} color={SEV_COLOR[sev]} />
          ))}
        </Panel>

        <Panel title="CATEGORY" sub="Category drives the SLA clock and the agency routing table.">
          {s.cats.map(([cat, n]) => (
            <Bar key={cat} label={cat} n={n} total={s.n} color="#6366f1" />
          ))}
        </Panel>

        <Panel title="INGEST CHANNEL" sub="Four working paths. SMS reaches a feature phone with no data at all.">
          {s.chans.map(([ch, n]) => (
            <Bar key={ch} label={ch} n={n} total={s.n} color="#F59E0B" />
          ))}
        </Panel>

        <Panel title="AGENCY LOAD" sub="Derived from the deterministic category → agency table, not assigned at random.">
          {s.agencyLoad.length === 0 ? (
            <span className="text-[10px] text-text-dim">Nothing dispatched.</span>
          ) : (
            s.agencyLoad.map(([a, n]) => (
              <Bar key={a} label={a} n={n} total={s.dispatchedCases.length || 1} color="#FF6B35" />
            ))
          )}
        </Panel>

        <Panel
          title="CALL-STORM CLUSTERING"
          sub="Multiple callers reporting one incident. Grouping is a view, never a merge — no case is hidden."
        >
          <div className="grid grid-cols-2 gap-2 font-mono">
            {[
              { k: "incidents grouped", v: s.clusterIds.size },
              { k: "major incidents", v: s.majorIds.size, hint: "3+ independent reports" },
              { k: "cases in a cluster", v: s.clustered.length },
              { k: "visitor-language cases", v: s.visitors.length, hint: "asked for a map pin" },
            ].map((x) => (
              <div key={x.k} className="rounded-md bg-surface-raised px-2.5 py-2">
                <div className="text-base font-bold text-teal tabular-nums leading-tight">{x.v}</div>
                <div className="text-[9px] text-text-dim leading-snug">{x.k}</div>
                {x.hint && <div className="text-[8px] text-text-dim/60">{x.hint}</div>}
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <p className="text-[9px] text-text-dim mt-4 leading-relaxed max-w-[760px]">
        Report text was written per language rather than translated from English, so the phrasing
        is what a frightened person actually types. Two templates were cut before this shipped for
        staging a real, named disaster at its actual location, and several severities were
        corrected — a domestic assault in progress had been filed MEDIUM, which would teach the
        console to deprioritise exactly the call that must not wait.
      </p>
    </div>
  );
}
