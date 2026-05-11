// Continuity link-outs to the existing production ConstructLine app.
// These point at the live alpcontractorcircle.com routes that current
// members are already using. Do NOT rebuild these tools yet — link out
// only, open in a new tab, no SSO/identity in URL.

export type ConstructLineLink = {
  key: string;
  title: string;
  blurb: string;
  url: string;
};

export const CONSTRUCTLINE_LINKS: ConstructLineLink[] = [
  {
    key: "constructline",
    title: "ConstructLine Hub",
    blurb: "Entry point for the full ConstructLine workspace.",
    url: "https://alpcontractorcircle.com/portal/constructline",
  },
  {
    key: "takeoff",
    title: "Basis (Takeoffs)",
    blurb: "Project list, line items, quantities, and bid basis.",
    url: "https://alpcontractorcircle.com/portal/takeoff",
  },
  {
    key: "scheduler",
    title: "Baseline (Scheduler)",
    blurb: "CPM schedules, Gantt, and baseline comparison.",
    url: "https://alpcontractorcircle.com/portal/scheduler",
  },
  {
    key: "cost-library",
    title: "Cost Library",
    blurb: "Regional priced item catalog by CSI division.",
    url: "https://alpcontractorcircle.com/portal/cost-library",
  },
  {
    key: "labor-library",
    title: "Trade Rate Library",
    blurb: "Crew rates, labor multipliers, and trade specialties.",
    url: "https://alpcontractorcircle.com/portal/labor-library",
  },
];

export const CONSTRUCTLINE_BY_KEY = Object.fromEntries(
  CONSTRUCTLINE_LINKS.map((l) => [l.key, l]),
) as Record<string, ConstructLineLink>;
