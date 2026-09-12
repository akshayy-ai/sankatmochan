"use client";

/**
 * Login page — operator authentication via Auth0.
 * Emergency console theme matching the main dashboard.
 */
export default function LoginPage() {
  return (
    <div
      className="h-screen flex items-center justify-center font-mono"
      style={{ background: "#070A0E" }}
    >
      <div className="text-center max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: "#3FD9C8" }}
          >
            <span className="text-[18px] font-bold" style={{ color: "#07110F" }}>
              सं
            </span>
          </div>
          <div>
            <div
              className="text-[16px] font-semibold tracking-[.14em] font-sans"
              style={{ color: "#E6EAF0" }}
            >
              SANKATMOCHAN
            </div>
            <div
              className="text-[9px] tracking-[.14em]"
              style={{ color: "#6B7A8D" }}
            >
              112 EMERGENCY RESPONSE CONSOLE
            </div>
          </div>
        </div>

        {/* Status */}
        <div
          className="mb-6 px-4 py-3 rounded-lg border text-[11px]"
          style={{
            background: "#0D1117",
            borderColor: "#1C2531",
            color: "#8A95A6",
          }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "#3FD9C8" }}
            />
            <span style={{ color: "#3FD9C8" }}>SYSTEM ONLINE</span>
          </div>
          <div>Operator authentication required to access the emergency console.</div>
        </div>

        {/* Auth0 Login Button */}
        <a
          href="/auth/login"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-lg text-[12px] font-semibold tracking-wide transition-all hover:scale-105"
          style={{
            background: "#3FD9C8",
            color: "#07110F",
          }}
        >
          🔐 Operator Sign In
        </a>

        {/* Footer */}
        <div className="mt-8 text-[9px]" style={{ color: "#4A5568" }}>
          <div>Secured by Auth0 · Pune Emergency Response Center</div>
          <div className="mt-1">Shift B · 3 Operators On Desk</div>
        </div>
      </div>
    </div>
  );
}
