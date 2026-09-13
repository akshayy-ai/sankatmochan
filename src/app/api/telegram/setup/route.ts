import { NextRequest, NextResponse } from "next/server";

/**
 * Telegram webhook setup — call this once to register the webhook URL.
 *
 * GET /api/telegram/setup?url=https://your-domain.vercel.app
 *
 * This tells Telegram to send all bot messages to /api/telegram/webhook
 */
export async function GET(req: NextRequest) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN not set" }, { status: 500 });
  }

  // Use provided URL or try to detect from request
  const baseUrl = req.nextUrl.searchParams.get("url") ||
    `${req.nextUrl.protocol}//${req.nextUrl.host}`;
  const webhookUrl = `${baseUrl}/api/telegram/webhook`;

  // Set the webhook
  const res = await fetch(
    `https://api.telegram.org/bot${token}/setWebhook`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ["message"],
        drop_pending_updates: true,
      }),
    }
  );

  const data = await res.json();

  // Also set bot commands
  await fetch(`https://api.telegram.org/bot${token}/setMyCommands`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      commands: [
        { command: "start", description: "Start — report an emergency" },
        { command: "help", description: "How to use this bot" },
      ],
    }),
  });

  return NextResponse.json({
    success: data.ok,
    webhookUrl,
    telegramResponse: data,
    instructions: [
      "1. Webhook registered! The bot is now live.",
      "2. Open Telegram and search for your bot",
      "3. Send /start to begin",
      "4. Send an emergency message in any language",
      "5. The bot will classify, translate, and create a case",
    ],
  });
}
