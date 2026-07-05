import type { TurnstileStatus } from "@/composables/useTurnstile";
import { contactFieldsSchema } from "./contact.ts";

export interface ContactFormFields {
  name: string;
  email: string;
  subject: string;
  body: string;
}

export interface ContactFieldErrors {
  name: string;
  email: string;
  subject: string;
  body: string;
}

const EMPTY_ERRORS: ContactFieldErrors = {
  name: "",
  email: "",
  subject: "",
  body: "",
};

export function validateContactForm(
  fields: ContactFormFields,
): ContactFieldErrors {
  const parsed = contactFieldsSchema.safeParse(fields);
  if (parsed.success) {
    return { ...EMPTY_ERRORS };
  }

  const errors: ContactFieldErrors = { ...EMPTY_ERRORS };
  for (const issue of parsed.error.issues) {
    const key = issue.path[0];
    if (
      typeof key === "string" &&
      key in errors &&
      !errors[key as keyof ContactFieldErrors]
    ) {
      errors[key as keyof ContactFieldErrors] = issue.message;
    }
  }

  return errors;
}

export function hasContactFormErrors(errors: ContactFieldErrors): boolean {
  return Object.values(errors).some(Boolean);
}

export function getTurnstileErrorMessage(
  status?: TurnstileStatus | null,
  errorCode?: string | null,
): string {
  if (status === "error") {
    return errorCode
      ? `確認中にエラーが発生しました。再試行してください。 (code: ${errorCode})`
      : "確認中にエラーが発生しました。再試行してください。";
  }

  if (status === "expired") {
    return "期限切れしました。再度チャレンジを完了してください。";
  }

  return "チャレンジを完了してから送信してください。";
}
