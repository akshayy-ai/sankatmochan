"use client";

import { useEffect, useState } from "react";

/**
 * Regional situational awareness — live Indian disaster news via Exa.
 *
 * An operator taking calls one at a time cannot see that the calls are
 * related. Knowing a flood is already unfolding upstream changes how the
 * third call from that district is read, and it arrives before the calls do.
 *
 * This is context, never an incident: nothing here enters the queue, because
 * a news headline is not a report from a person and must not compete with one
 * for an operator's attention.
 */

type Article = {
  title: string;
  url: string;
  publishedDate?: string;
  highlights?: string[];
};

const REFRESH_MS = 10 * 60 * 1000;

/** Headlines naming an active response are the ones an operator needs first. */
const URGENT = /(ndrf|sdrf|rescue|evacuat|red alert|imd warning|cloudburst|landslide|collapse)/i;

function timeAgo(iso?: string): string {
  if (!iso) return "";
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (!Number.isFinite(mins) || mins < 0) return "";
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export default function RegionalAlerts() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [idx, setIdx] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    const load = () =>
      fetch("/api/news")
        .then((r) => r.json())
        .then((d) => {
          if (!live) return;
          const list: Article[] = d.articles || [];
          // Active-response headlines first; they change how the next call reads.
          list.sort((a, b) => Number(URGENT.test(b.title)) - Number(URGENT.test(a.title)));
          setArticles(list.slice(0, 6));
          setFailed(!list.length);
        })
        .catch(() => live && setFailed(true));

    load();
    const id = setInterval(load, REFRESH_MS);
    return () => {
      live = false;
      clearInterval(id);
    };
  }, []);

  // Rotate rather than scroll: an operator reads this peripherally while
  // working a case, and motion they have to chase costs more than it gives.
  useEffect(() => {
    if (articles.length < 2) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % articles.length), 8000);
    return () => clearInterval(id);
  }, [articles.length]);

  // Nothing to say is said with nothing. A permanent empty strip would just
  // take a line of screen from the queue.
  if (failed || !articles.length) return null;

  const a = articles[idx];
  const urgent = URGENT.test(a.title);

  return (
    <div
      className="flex-none flex items-center gap-3 px-4 py-[6px] border-b border-border font-mono"
      style={{ background: "#0B0E13" }}
    >
      <span className="flex items-center gap-[6px] flex-none">
        <span
          className="w-[5px] h-[5px] rounded-full"
          style={{ background: urgent ? "#F2544F" : "#5B8CFF" }}
        />
        <span className="text-[8.5px] font-semibold tracking-[.12em]" style={{ color: urgent ? "#F2544F" : "#6E7A8C" }}>
          REGIONAL
        </span>
      </span>

      <a
        href={a.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[10.5px] font-sans truncate hover:underline min-w-0 flex-1"
        style={{ color: "#C3CCD8" }}
        title={a.title}
      >
        {a.title}
      </a>

      {timeAgo(a.publishedDate) && (
        <span className="text-[9px] flex-none" style={{ color: "#5A6575" }}>
          {timeAgo(a.publishedDate)}
        </span>
      )}

      <span className="text-[8.5px] flex-none" style={{ color: "#4E5A6B" }}>
        Exa · {idx + 1}/{articles.length}
      </span>

      {/* Context, not a case. Said plainly so nobody works a headline. */}
      <span className="text-[8.5px] flex-none" style={{ color: "#3B4553" }}>
        situational — not an incident
      </span>
    </div>
  );
}
