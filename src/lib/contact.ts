import { z } from "astro/zod";

export const contactFieldsSchema = z.object({
  name: z
    .string()
    .min(1, "お名前を入力してください。")
    .max(20, "20文字以内で入力してください。"),
  email: z
    .string()
    .trim()
    .min(1, "メールアドレスは必須です")
    .email("有効なメールアドレスを入力してください"),
  subject: z
    .string()
    .trim()
    .min(1, "件名を入力してください。")
    .max(50, "50文字以内で入力してください。"),
  body: z
    .string()
    .min(1, "お問い合わせ内容を入力してください。")
    .max(800, "800文字以内で入力してください。"),
});

export const contactSchema = contactFieldsSchema.extend({
  "cf-turnstile-response": z.string().min(1, "Turnstile の検証が必要です。"),
});

export type ContactInput = z.infer<typeof contactSchema>;

export interface ContactArtifactsInput {
  uid: string;
  masked: boolean;
  data: Pick<ContactInput, "name" | "email" | "subject" | "body">;
}

function createGmailUrl(uid: string): string {
  const query = `subject:"[${uid}]"`;
  return `https://mail.google.com/mail/u/0/#search/${encodeURIComponent(query)}`;
}

export function getClientIp(headers: Headers): string | undefined {
  const connectingIp = headers.get("CF-Connecting-IP")?.trim();
  if (connectingIp) {
    return connectingIp;
  }

  const forwardedFor = headers.get("X-Forwarded-For");
  return forwardedFor?.split(",")[0]?.trim() || undefined;
}

export function buildContactArtifacts(input: ContactArtifactsInput) {
  const gmailUrl = createGmailUrl(input.uid);

  return {
    gmailUrl,
    email: {
      subject: `${input.data.subject} [${input.uid}]`,
      text: `お名前: ${input.data.name}\nメアド: ${input.data.email}\n件名: ${input.data.subject}\n\n${input.data.body}`,
    },
    discordPayload: {
      thread_name: input.data.subject,
      embeds: [
        {
          title: `問い合わせ [${input.uid}]`,
          color: input.masked ? 0xed4245 : 0x5865f2,
          fields: [
            {
              name: "お名前",
              value: input.masked ? "********" : input.data.name,
              inline: true,
            },
            {
              name: "メールアドレス",
              value: input.masked ? "********" : input.data.email,
              inline: true,
            },
            { name: "メール", value: gmailUrl, inline: false },
            {
              name: "お問い合わせ内容",
              value: input.masked ? "⚠️ メールを参照" : input.data.body,
              inline: false,
            },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    },
  };
}
