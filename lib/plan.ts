export type Plan = "basic" | "pro";

export const PLAN: Plan =
  (process.env.NEXT_PUBLIC_PLAN ?? "basic") === "pro" ? "pro" : "basic";

export const PLAN_FEATURES: Record<string, Plan> = {
  theme_vibrant: "pro",
  theme_bold: "pro",
};

export function isFeatureEnabled(feature: string): boolean {
  const required = PLAN_FEATURES[feature];
  if (!required) return true;
  if (required === "pro" && PLAN !== "pro") return false;
  return true;
}

export const PLAN_LABEL: Record<Plan, string> = {
  basic: "Basic",
  pro: "Pro",
};
