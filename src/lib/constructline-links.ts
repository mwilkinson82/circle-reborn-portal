// Continuity link-outs to the existing production ConstructLine app.
// These point at the live alpcontractorcircle.com routes that current
// members are already using. Do NOT rebuild these tools yet — link out
// only, open in a new tab, no SSO/identity in URL.

export type ConstructLineLink = {
  key: string;
  title: string;
  promise: string;
  blurb: string;
  bestUsedFor: string;
  supportNote: string;
  url: string;
};

export const CONSTRUCTLINE_LINKS: ConstructLineLink[] = [
  {
    key: "constructline",
    title: "ConstructLine Hub",
    promise: "Run the pursuit.",
    blurb:
      "Entry point for live pursuits, bid continuity, project records, and connected field tools.",
    bestUsedFor: "Live pursuits, bid continuity, and project records.",
    supportNote:
      "Use this when the work needs field execution support, not operating-system setup.",
    url: "https://alpcontractorcircle.com/portal/constructline",
  },
  {
    key: "takeoff",
    title: "Basis (Takeoffs)",
    promise: "Quantify the work.",
    blurb:
      "Use when an estimate, scope, quantity, or line-item review is the problem in front of you.",
    bestUsedFor: "Scopes, quantities, line items, and estimate review.",
    supportNote:
      "Bring unclear estimate decisions into Bring One Issue when they need group-session judgment.",
    url: "https://alpcontractorcircle.com/portal/takeoff",
  },
  {
    key: "scheduler",
    title: "Baseline (Scheduler)",
    promise: "Plan the work.",
    blurb:
      "Use when durations, sequencing, milestones, Gantt logic, or CPM schedule clarity is needed.",
    bestUsedFor: "Durations, sequencing, milestones, and schedule logic.",
    supportNote: "Use Baseline to clarify the plan; use AOS to run the company rhythm around it.",
    url: "https://alpcontractorcircle.com/portal/scheduler",
  },
  {
    key: "cost-library",
    title: "Cost Library",
    promise: "Price with memory.",
    blurb: "Use when pricing, assemblies, item costs, or historical trade memory are needed.",
    bestUsedFor: "Assemblies, item costs, price references, and historical cost memory.",
    supportNote:
      "Use pricing evidence here, then carry leadership decisions into a session or AOS.",
    url: "https://alpcontractorcircle.com/portal/cost-library",
  },
  {
    key: "labor-library",
    title: "Trade Rate Library",
    promise: "Know the labor.",
    blurb:
      "Use when crew rates, trade multipliers, labor assumptions, or regional rate checks are needed.",
    bestUsedFor: "Crew rates, trade multipliers, labor assumptions, and regional rate checks.",
    supportNote:
      "Use rate clarity to support the bid; use Contractor Circle for the operating decision.",
    url: "https://alpcontractorcircle.com/portal/labor-library",
  },
];

export const CONSTRUCTLINE_BY_KEY = Object.fromEntries(
  CONSTRUCTLINE_LINKS.map((l) => [l.key, l]),
) as Record<string, ConstructLineLink>;
