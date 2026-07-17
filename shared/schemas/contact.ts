import { z } from "zod";

const noControlCharacters = (value: string) =>
  ![...value].some((character) => {
    const codePoint = character.codePointAt(0) ?? 0;
    return codePoint < 32 || codePoint === 127;
  });

export const contactFieldsSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "お名前を入力してください。")
      .max(20, "20文字以内で入力してください。")
      .refine(noControlCharacters, "お名前に制御文字は使用できません。"),
    email: z
      .string()
      .trim()
      .min(1, "メールアドレスは必須です。")
      .max(254, "メールアドレスが長すぎます。")
      .email("有効なメールアドレスを入力してください。"),
    subject: z
      .string()
      .trim()
      .min(1, "件名を入力してください。")
      .max(50, "50文字以内で入力してください。")
      .refine(noControlCharacters, "件名に改行や制御文字は使用できません。"),
    body: z
      .string()
      .trim()
      .min(1, "お問い合わせ内容を入力してください。")
      .max(800, "800文字以内で入力してください。"),
  })
  .strict();

export const contactSchema = contactFieldsSchema
  .extend({
    "cf-turnstile-response": z
      .string()
      .trim()
      .min(1, "Turnstile の検証が必要です。")
      .max(2048, "Turnstile token が長すぎます。"),
  })
  .strict();

export type ContactFields = z.infer<typeof contactFieldsSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
