// src/api/contact.ts
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

type Bindings = {
  DISCORD_WEBHOOK_URL: string;
  CF_TURNSTILE_SECRETKEY: string;
};

const contactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.email().max(254),
  subject: z.string().min(1).max(200),
  body: z.string().min(1).max(2000),
  /** Turnstile が発行するトークン */
  "cf-turnstile-response": z.string().min(1),
});

async function verifyTurnstile(
  token: string,
  secretKey: string,
  remoteip?: string,
): Promise<boolean> {
  const formData = new FormData();
  formData.append("secret", secretKey);
  formData.append("response", token);
  if (remoteip) formData.append("remoteip", remoteip);

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) return false;
  const json = (await res.json()) as { success: boolean };
  return json.success === true;
}

async function postToDiscordForum(
  webhookUrl: string,
  data: {
    name: string;
    email: string;
    subject: string;
    body: string;
  },
): Promise<Response> {
  const payload = {
    // フォーラムチャンネルのスレッド名
    thread_name: `[お問い合わせ] ${data.subject}`,
    embeds: [
      {
        title: data.subject,
        color: 0x5865f2, // Discord Blurple
        fields: [
          { name: "お名前", value: data.name, inline: true },
          { name: "メールアドレス", value: data.email, inline: true },
          {
            name: "お問い合わせ内容",
            value: data.body,
            inline: false,
          },
        ],
        footer: { text: "お問い合わせフォームより" },
        timestamp: new Date().toISOString(),
      },
    ],
  };

  return fetch(`${webhookUrl}?wait=true`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

const app = new Hono<{ Bindings: Bindings }>() //
  .post("/", zValidator("json", contactSchema), async (c) => {
    const data = c.req.valid("json");

    // 1. Turnstile 検証
    const ip =
      c.req.header("CF-Connecting-IP") ?? c.req.header("X-Forwarded-For")?.split(",")[0]?.trim();

    const turnstileOk = await verifyTurnstile(
      data["cf-turnstile-response"],
      c.env.CF_TURNSTILE_SECRETKEY,
      ip,
    );

    if (!turnstileOk) {
      return c.json({ error: "Turnstile verification failed" }, 403);
    }

    // 2. Discord フォーラムへ投稿
    const discordRes = await postToDiscordForum(c.env.DISCORD_WEBHOOK_URL, {
      name: data.name,
      email: data.email,
      subject: data.subject,
      body: data.body,
    });

    if (!discordRes.ok) {
      const errText = await discordRes.text();
      console.error("Discord webhook error", discordRes.status, errText);
      return c.json({ error: "Failed to create ticket" }, 502);
    }

    return c.json({ success: true }, 201);
  });

export default app;
