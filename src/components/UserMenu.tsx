"use client";

/**
 * UserMenu — shows the authenticated operator's identity from Auth0
 * with a sign-out option. Falls back to mock data if no session.
 */
import { useEffect, useState } from "react";

type UserInfo = {
  name: string;
  email: string;
  picture?: string;
  initials: string;
};

export default function UserMenu() {
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    fetch("/auth/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          const name = data.user.name || data.user.email?.split("@")[0] || "Operator";
          setUser({
            name,
            email: data.user.email || "",
            picture: data.user.picture,
            initials: name
              .split(" ")
              .map((w: string) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase(),
          });
        }
      })
      .catch(() => {
        // No auth session — use fallback
      });
  }, []);

  if (!user) {
    // Fallback — show mock operator (for when Auth0 isn't configured)
    return (
      <div className="flex items-center gap-[9px] px-4 border-l border-border">
        <div className="flex">
          {["RK", "SP", "AM"].map((initials, i) => (
            <div
              key={initials}
              className="w-[23px] h-[23px] rounded-full flex items-center justify-center text-[9px] font-semibold border border-surface"
              style={{
                background: i === 0 ? "#1C2531" : i === 1 ? "#22303D" : "#1C2531",
                color: "#9FB0C4",
                marginLeft: i > 0 ? "-7px" : 0,
              }}
            >
              {initials}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="text-[10.5px] font-medium text-text-primary font-sans leading-none">
            R. Kulkarni
          </div>
          <div className="text-[8.5px] text-text-dim leading-none">
            OP-2291 · 3 ON DESK
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-[9px] px-4 border-l border-border">
      {user.picture ? (
        <img
          src={user.picture}
          alt={user.name}
          className="w-[26px] h-[26px] rounded-full border border-border"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div
          className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-[10px] font-semibold"
          style={{ background: "#1C2531", color: "#3FD9C8" }}
        >
          {user.initials}
        </div>
      )}
      <div className="flex flex-col gap-0.5">
        <div className="text-[10.5px] font-medium text-text-primary font-sans leading-none">
          {user.name}
        </div>
        <div className="text-[8.5px] text-text-dim leading-none flex items-center gap-1.5">
          <span>OPERATOR</span>
          <span>·</span>
          <a
            href="/auth/logout"
            className="hover:text-text-secondary transition-colors"
            style={{ color: "#6B7A8D" }}
          >
            Sign out
          </a>
        </div>
      </div>
    </div>
  );
}
