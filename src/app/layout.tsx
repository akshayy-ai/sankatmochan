import type { Metadata } from "next";
import { CopilotProvider } from "@/components/CopilotProvider";
import "@copilotkit/react-core/v2/styles.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "SANKATMOCHAN · संकटमोचन — India 112 Multilingual Response Grid",
  description:
    "Multilingual emergency response platform. Any language, over SMS, Telegram, photo and phone call — built for India's 22 official languages and the visitors who speak none of them.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&family=Noto+Sans+Devanagari:wght@400;500;600&family=Noto+Sans+Telugu:wght@400;500;600&family=Noto+Sans+Tamil:wght@400;500&family=Noto+Sans+Oriya:wght@400;500&family=Noto+Sans+Bengali:wght@400;500&family=Noto+Sans+Gujarati:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full overflow-hidden font-mono">
        <CopilotProvider>{children}</CopilotProvider>
      </body>
    </html>
  );
}
