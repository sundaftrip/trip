export const VISA_DISCUSSION_TURNSTILE_ACTION = "visa_discussion";

type TurnstileResult = {
  success?: unknown;
  action?: unknown;
  hostname?: unknown;
};

export function isVisaDiscussionTurnstileResult(value: unknown, expectedHostname: string) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const result = value as TurnstileResult;
  return result.success === true
    && result.action === VISA_DISCUSSION_TURNSTILE_ACTION
    && normalizedHostname(result.hostname) === normalizedHostname(expectedHostname);
}

function normalizedHostname(value: unknown) {
  if (typeof value !== "string") return null;
  const hostname = value.trim().toLowerCase().replace(/\.$/, "");
  return hostname || null;
}
