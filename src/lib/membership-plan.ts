import { FOUNDING_PLAN_KEYS, LEGACY_FOUNDING_PLAN_KEY } from "@/lib/membership-price-ids";

const FOUNDING_PLAN_IDS = new Set(FOUNDING_PLAN_KEYS);

const PLAN_LABELS: Record<string, string> = {
  [LEGACY_FOUNDING_PLAN_KEY]: "Founding Circle",
  price_1TDR3aJdDAUSVXbNPYG3DK9Y: "Circle Monthly",
  price_1TDR3aJdDAUSVXbNZOY6EXF3: "Founding Circle",
  price_1TDR3aJdDAUSVXbNWVzFLblo: "Founding Circle",
  price_1TC5NlJdDAUSVXbNPThxV7uS: "Founding Circle",
  comped: "Comped Circle",
};

export function isFoundingPlan(plan: string | null | undefined): boolean {
  return !!plan && FOUNDING_PLAN_IDS.has(plan);
}

export function formatMembershipPlan(plan: string | null | undefined): string {
  if (!plan) return "Circle";
  if (PLAN_LABELS[plan]) return PLAN_LABELS[plan];
  if (plan.startsWith("price_")) return "Circle Membership";
  return titleCase(plan.replace(/[_-]/g, " "));
}

export function titleCase(value: string): string {
  return value
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
