"use client";

/**
 * CopilotKit provider boundary for Sankatmochan.
 *
 * Wraps the app with CopilotKitProvider pointing at our runtime.
 * Must be a "use client" component so layout.tsx stays a Server Component.
 */
import { CopilotKitProvider } from "@copilotkit/react-core/v2";

export function CopilotProvider({ children }: { children: React.ReactNode }) {
  return (
    <CopilotKitProvider runtimeUrl="/api/copilotkit">
      {children}
    </CopilotKitProvider>
  );
}
