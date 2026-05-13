import { LEAD_MAGNET_DOWNLOADS } from "@/lib/resource-links";

export type LibraryTemplateCategory =
  | "proposals"
  | "contracts"
  | "sales"
  | "operations"
  | "finance"
  | "estimating"
  | "contractor_circle"
  | "leadership";

export type LibraryTemplate = {
  id: string;
  title: string;
  description: string;
  long_description: string | null;
  category: LibraryTemplateCategory;
  file_type: string;
  download_url: string | null;
  featured: boolean;
  badge: string | null;
  pages: string | null;
  highlights: string[];
  published: boolean;
  created_at: string;
};

export type LibraryReplay = {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number | null;
  recorded_at: string;
  tags: string[];
  thumbnail_url: string | null;
  video_url: string | null;
  published: boolean;
  created_at: string;
};

const cloudflareStreamUrl = (id: string) => `https://iframe.videodelivery.net/${id}`;
const cloudflareThumbnailUrl = (id: string) =>
  `https://videodelivery.net/${id}/thumbnails/thumbnail.jpg?time=1s`;

function isFragileTemplateUrl(value: string | null | undefined) {
  if (!value) return false;
  return (
    (value.includes("drive.google.com/file/") && value.includes("/copy")) ||
    value.includes("alpcontractorcircle.com/manus-storage")
  );
}

export function withTemplateLibraryFallbackUrls<T extends { download_url?: string | null }>(
  templates: T[],
) {
  return templates.map((template) => ({
    ...template,
    download_url: isFragileTemplateUrl(template.download_url)
      ? null
      : (template.download_url ?? null),
  }));
}

export const PLACEHOLDER_TEMPLATE_TITLES = new Set([
  "Schedule of Values Template",
  "EOS-Lite Operating Playbook",
  "Master Subcontract Agreement",
  "Discovery Call Script",
]);

export const PLACEHOLDER_REPLAY_TITLES = new Set([
  "How Marshall Closes a $4M Bid",
  "The 3-Silo Operating Model",
  "Estimating: From Takeoff to Margin",
  "Q&A: Hiring a First Project Manager",
]);

export const circleTemplateCatalog = [
  {
    id: "legacy-template-1",
    title: "Contractor Proposal Template",
    description:
      "10-section professional proposal with 3-tier pricing, scope of work, timeline, and built-in ALP authority positioning.",
    long_description:
      "A complete 10-section proposal template built on the ALP framework. Includes cover page, personal note, project vision, scope of work, 3-tier investment options (Essential / Signature / Estate), payment schedule, project timeline, credentials, guarantee, and signature page. Every section includes coaching notes on how to fill it in.",
    category: "proposals",
    file_type: "docx",
    download_url:
      "https://docs.google.com/document/d/17KrgZQsLo4ZBxxSu5bFUpOlMgaViD6PixxHeNbnYksM/copy",
    featured: true,
    badge: "Most Used",
    pages: "10 sections",
    highlights: [
      "3-tier pricing structure (Essential / Signature / Estate)",
      "ALP authority positioning notes throughout",
      "Complete payment schedule with milestone triggers",
      "Built-in project timeline by phase",
      "Professional signature/agreement page",
    ],
    published: true,
    created_at: "2026-04-01T12:00:00.000Z",
  },
  {
    id: "legacy-template-2",
    title: "Construction Agreement Template",
    description:
      "10-article contractor agreement covering scope, payments, change orders, warranty, and dispute resolution.",
    long_description:
      "A comprehensive construction contract template with 10 articles covering: scope of work with inclusions and exclusions, contract price and payment schedule, change order process, project schedule, materials and substitutions, permits and code compliance, warranty terms, insurance and liability, dispute resolution, and general provisions.",
    category: "contracts",
    file_type: "docx",
    download_url:
      "https://docs.google.com/document/d/1ci08CJ9aIgScwtibkLOoVoDX75pav--5gs4VTq5hxZY/copy",
    featured: false,
    badge: "Legal",
    pages: "10 articles",
    highlights: [
      "10 complete articles covering all project phases",
      "Change order process and authorization",
      "Warranty terms with response commitments",
      "Dispute resolution and contractor lien rights",
      "Professional signature page with tier selection",
    ],
    published: true,
    created_at: "2026-04-01T12:01:00.000Z",
  },
  {
    id: "legacy-template-3",
    title: "Follow-Up Email Scripts (7 Scripts)",
    description:
      "7 Authority Gap email scripts + 5 text message scripts. Covers Day 1 through Day 14 of the sales cycle.",
    long_description:
      "The complete Authority Gap follow-up system. 7 email scripts timed from same-day through Day 14, plus 5 text message scripts. Each script is built around the three pillars: Authority, Familiarity, and Trust. Includes the Case Study email, Education email, Vision email, Operational Urgency email, Decision Framework email, and the Final Follow-Up.",
    category: "sales",
    file_type: "docx",
    download_url:
      "https://docs.google.com/document/d/1HBVZ3oyuLoRQfOJeDSPtTiPjsAN-_mpndM80G4tLmL0/copy",
    featured: true,
    badge: "Authority Gap",
    pages: "7 emails + 5 texts",
    highlights: [
      "7 complete email scripts with subject lines",
      "5 text message scripts",
      "Timing guide: Day 1 through Day 14",
      "Coach's notes on when and how to use each script",
      "Built on Authority, Familiarity, and Trust framework",
    ],
    published: true,
    created_at: "2026-04-01T12:02:00.000Z",
  },
  {
    id: "legacy-template-4",
    title: "Objection Reframing Guide",
    description:
      "The 4 core objections contractors face, reframed as 'next decisions.' Includes word-for-word scripts for each.",
    long_description:
      "The ALP Objection Control system. Covers the 4 core objections: 'It's more than we expected,' 'We need to think about it,' 'Can you sharpen your pencil?', and 'I need to talk to my spouse.' Each objection includes: what they actually mean, the wrong response, the ALP response, the next decision to control, and 2–3 word-for-word scripts. Plus bonus section covering 4 additional objections.",
    category: "sales",
    file_type: "docx",
    download_url:
      "https://docs.google.com/document/d/1f0KTxAAgH1qOVyLK2hESCZFXD-kzFhpzys607TUaerc/copy",
    featured: true,
    badge: "Decision Control",
    pages: "4 core + 4 bonus",
    highlights: [
      "4 core objections with full handling scripts",
      "Wrong response vs. ALP response comparison",
      "Next decision framework for each objection",
      "4 bonus objections (lower bid, wait, more bids, payments)",
      "The Objection Control Formula: Identify → Determine → Direct",
    ],
    published: true,
    created_at: "2026-04-01T12:03:00.000Z",
  },
  {
    id: "legacy-template-5",
    title: "Bid Sheet & Estimating Template",
    description:
      "6-tab Excel estimating system with 100+ line items, 10 divisions, subcontractor bid comparison, and payment tracker.",
    long_description:
      "A comprehensive construction estimating workbook with 6 tabs: Project Summary (with 3-tier pricing), Detail Estimate (100+ line items across 10 divisions), Subcontractor Bid Comparison, Change Order Log, Payment Tracker, and Instructions. All formulas are pre-built — enter quantities and unit costs, everything calculates automatically.",
    category: "finance",
    file_type: "xlsx",
    download_url:
      "https://docs.google.com/spreadsheets/d/11Relq2cAVntdPLCV74qRCbtvN1jjE2GUowZCETHP6h8/copy",
    featured: true,
    badge: "Airtight",
    pages: "6 tabs, 100+ line items",
    highlights: [
      "100+ line items across 10 construction divisions",
      "Automatic labor, material, and subcontractor totals",
      "Overhead & profit calculator with margin controls",
      "3-tier pricing section for proposal presentation",
      "Subcontractor bid comparison + change order log",
    ],
    published: true,
    created_at: "2026-04-01T12:04:00.000Z",
  },
  {
    id: "legacy-template-6",
    title: "PM Systems Presentation",
    description:
      "Marshall's complete PM systems deck. The exact framework used to manage $2.5B+ in construction projects.",
    long_description:
      "The Project Management Systems presentation deck — Marshall's complete framework for running construction projects at scale. Covers the systems, processes, and workflows that enabled $2.5B+ in construction. Use this as a training tool for your team or as a reference for building your own PM systems.",
    category: "operations",
    file_type: "pdf",
    download_url:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663332724241/JYLdJEaFQZebZwtiasWNpQ/PMSystemsPresentation_8490e726.pdf",
    featured: false,
    badge: "Marshall's System",
    pages: "Full presentation",
    highlights: [
      "Marshall's personal PM framework from $2.5B+ in construction",
      "Systems and processes for scaling your operation",
      "Team training and workflow documentation",
      "Reference guide for building your own PM systems",
    ],
    published: true,
    created_at: "2026-04-01T12:05:00.000Z",
  },
  {
    id: "legacy-template-7",
    title: "PM Systems Spreadsheets",
    description:
      "The companion spreadsheet toolkit to the PM Systems presentation. Ready-to-use tracking tools.",
    long_description:
      "The companion spreadsheet toolkit to the PM Systems presentation deck. Includes the tracking tools, templates, and worksheets that go with Marshall's PM framework. Use alongside the presentation deck for a complete project management system.",
    category: "operations",
    file_type: "xlsx",
    download_url:
      "https://docs.google.com/spreadsheets/d/14ZB8w1j8CO3DICRXXakxNE8mKbL_agEn0qWPJ7blWPk/copy",
    featured: false,
    badge: "Marshall's System",
    pages: "Multiple sheets",
    highlights: [
      "Companion to the PM Systems presentation deck",
      "Ready-to-use tracking tools and worksheets",
      "Pair with the PDF for the complete PM system",
    ],
    published: false,
    created_at: "2026-04-01T12:06:00.000Z",
  },
  {
    id: "legacy-template-9",
    title: "Construction Checklists — Pre-Job, Daily & QC",
    description:
      "5 ready-to-use checklists covering pre-job safety, daily site management, quality control, subcontractor onboarding, and project closeout.",
    long_description:
      "Five battle-tested checklists built for contractors who run tight, professional jobsites. Covers Pre-Job Safety (site assessment, permits, PPE, crew briefing), Daily Site Management (morning setup, safety review, end-of-day closeout), Quality Control Inspection (pre-pour, framing, rough-in, finishes, final walkthrough), Subcontractor Onboarding, and Project Closeout. Print them, laminate them, put them in your truck.",
    category: "operations",
    file_type: "docx",
    download_url:
      "https://docs.google.com/document/d/14i1hWbgHjJGhQJkFidc9xSqz00FPBk3tYm6NGKm3SIo/copy",
    featured: true,
    badge: "New",
    pages: "5 checklists",
    highlights: [
      "Pre-Job Safety Checklist — site assessment, permits, PPE, crew briefing",
      "Daily Site Checklist — morning setup, coordination, end-of-day closeout",
      "Quality Control Inspection — pre-pour through final walkthrough",
      "Subcontractor Onboarding Checklist — docs, scope, site rules",
      "Project Closeout Checklist — inspections, punch list, financial closeout",
    ],
    published: true,
    created_at: "2026-04-01T12:07:00.000Z",
  },
  {
    id: "legacy-template-10",
    title: "Subcontractor & Vendor Management SOPs",
    description:
      "6 SOPs for qualifying subs, managing bids, executing contracts, processing payments, and holding subs accountable.",
    long_description:
      "Six comprehensive SOPs that turn subcontractor management from a headache into a system. Covers Subcontractor Qualification & Vetting, Bid & Scope Review (bid leveling, scope gap elimination), Subcontract Execution (required contract elements, process), Payment Management (lien waivers, retainage), Vendor & Material Procurement (POs, receiving), and Subcontractor Performance Management (accountability, termination for cause).",
    category: "operations",
    file_type: "docx",
    download_url:
      "https://docs.google.com/document/d/1mMquQmg0mxKyrgma8CnLOFehrhAngsiEKv0KEFd6hBk/copy",
    featured: true,
    badge: "New",
    pages: "6 SOPs",
    highlights: [
      "Subcontractor Qualification & Vetting — license, insurance, references",
      "Bid Leveling & Scope Gap Elimination — apples-to-apples comparison",
      "Subcontract Execution — required elements, no mobilization without signed contract",
      "Payment Management — lien waiver process, retainage protocol",
      "Performance Management — accountability, deficiency notices, termination for cause",
    ],
    published: true,
    created_at: "2026-04-01T12:08:00.000Z",
  },
  {
    id: "legacy-template-11",
    title: "Client Communication & Sales Follow-Up SOPs",
    description:
      "6 SOPs for lead response, site visits, proposal presentation, follow-up sequences, objection handling, and client communication during construction.",
    long_description:
      "Six SOPs that turn your sales process into a repeatable system. Covers Lead Response & Initial Contact (2-hour response standard, qualification questions), Site Visit & Needs Assessment (what to do, what never to do), Proposal Presentation & Delivery (three-tier pricing strategy, live presentation structure), Follow-Up Sequence (4-touch sequence with exact scripts), Objection Handling (four-step framework with scripts for price, more bids, think about it), and Client Communication During Construction (weekly updates, change orders, problem communication).",
    category: "sales",
    file_type: "docx",
    download_url:
      "https://docs.google.com/document/d/1HBVZ3oyuLoRQfOJeDSPtTiPjsAN-_mpndM80G4tLmL0/copy",
    featured: true,
    badge: "New",
    pages: "6 SOPs",
    highlights: [
      "Lead Response SOP — 2-hour response standard with exact scripts",
      "Site Visit SOP — how to run a professional needs assessment",
      "Proposal Presentation — three-tier pricing strategy and live presentation structure",
      "Follow-Up Sequence — 4-touch sequence with exact scripts for each touchpoint",
      "Objection Handling — four-step framework for price, more bids, and think about it",
    ],
    published: true,
    created_at: "2026-04-01T12:09:00.000Z",
  },
  {
    id: "legacy-template-22",
    title: "Subcontractor Agreement",
    description:
      "Complete subcontractor agreement template covering scope, payment, insurance, lien waivers, and termination provisions.",
    long_description:
      "A comprehensive subcontractor agreement built for contractors who need airtight paperwork before any sub touches a jobsite. Covers scope of work, contract price and payment schedule, insurance and indemnification requirements, lien waiver provisions, change order process, termination for cause, and dispute resolution. Built on the same framework Marshall used on $2.5B+ in construction.",
    category: "contracts",
    file_type: "docx",
    download_url:
      "https://docs.google.com/document/d/1QhSBhvGoUpz-q6uXmauYItUPLgyaZVDTTu0ReJHtk1M/copy",
    featured: false,
    badge: "Legal",
    pages: "Full agreement",
    highlights: [
      "Complete scope of work with inclusions and exclusions",
      "Payment schedule with lien waiver requirements",
      "Insurance and indemnification provisions",
      "Change order authorization process",
      "Termination for cause and dispute resolution",
    ],
    published: true,
    created_at: "2026-04-01T12:10:00.000Z",
  },
  {
    id: "legacy-template-23",
    title: "Daily Job Log / Field Report",
    description:
      "Daily field report template for tracking crew, progress, weather, materials, and issues on every jobsite.",
    long_description:
      "A professional daily job log and field report template that keeps every jobsite documented and every day on record. Tracks date, project, superintendent, weather conditions, crew count and hours, work completed by trade, materials received, equipment used, subcontractors on site, safety observations, issues and delays, and photos/attachments log. The documentation that protects you in disputes and keeps your PM system tight.",
    category: "operations",
    file_type: "docx",
    download_url:
      "https://docs.google.com/document/d/1ZqB1XsJfTvIIrblJfPQ47pzT-kkNH8tSpcbQmvg1qZE/copy",
    featured: false,
    badge: "Field Ready",
    pages: "Daily form",
    highlights: [
      "Crew count, hours, and trade breakdown",
      "Work completed by phase and trade",
      "Materials received and equipment log",
      "Issues, delays, and safety observations",
      "Photo and attachment log for documentation",
    ],
    published: true,
    created_at: "2026-04-01T12:11:00.000Z",
  },
  {
    id: "legacy-template-14",
    title: "Change Order Template",
    description:
      "Professional change order form with scope description, cost breakdown, schedule impact, and client authorization.",
    long_description:
      "The change order template that gets signed and gets paid. Covers project info, change order number and date, detailed description of scope change, reason for change (owner request, unforeseen conditions, design change), cost breakdown (labor, materials, subcontractors, overhead and profit), schedule impact in days, revised contract total, and client authorization signature. Never do extra work without a signed change order.",
    category: "contracts",
    file_type: "docx",
    download_url:
      "https://docs.google.com/document/d/1GGVY7EsAZ3bk68XxUFdHXaLnKKaowgoMzbPTx2VbqSs/copy",
    featured: false,
    badge: "Get Paid",
    pages: "Single form",
    highlights: [
      "Scope description with reason for change",
      "Full cost breakdown: labor, materials, subs, O&P",
      "Schedule impact in calendar days",
      "Revised contract total calculation",
      "Client authorization signature block",
    ],
    published: true,
    created_at: "2026-04-01T12:12:00.000Z",
  },
  {
    id: "legacy-template-15",
    title: "Client Onboarding Checklist",
    description:
      "Complete client onboarding checklist covering contract execution, pre-construction meeting, site prep, and kickoff.",
    long_description:
      "The client onboarding checklist that sets the tone for the entire project. Covers contract execution and deposit collection, pre-construction meeting agenda (project overview, schedule, communication protocol, change order process), site preparation requirements, permit status and posting, material selection deadlines, key contacts and escalation path, and project kickoff confirmation. First impressions become lasting impressions — this checklist makes sure yours is professional.",
    category: "operations",
    file_type: "docx",
    download_url:
      "https://docs.google.com/document/d/1bVZFRRw8D0zqWQfdiVugV8p9L4-7sVAIsYu7sww3EDc/copy",
    featured: false,
    badge: "Client Ready",
    pages: "Full checklist",
    highlights: [
      "Contract execution and deposit collection steps",
      "Pre-construction meeting agenda template",
      "Site preparation and permit requirements",
      "Communication protocol and escalation path",
      "Project kickoff confirmation checklist",
    ],
    published: true,
    created_at: "2026-04-01T12:13:00.000Z",
  },
  {
    id: "legacy-template-16",
    title: "Construction Punch List",
    description:
      "Spreadsheet-based punch list for tracking all outstanding items by trade, location, priority, and completion status.",
    long_description:
      "A professional punch list spreadsheet that tracks every outstanding item from rough-in through final walkthrough. Organized by trade and location, with columns for item description, responsible party, priority level (critical / standard / cosmetic), due date, and completion status. Includes a summary tab with completion percentage by trade. The tool that gets your final payment released on time.",
    category: "operations",
    file_type: "xlsx",
    download_url:
      "https://docs.google.com/spreadsheets/d/1_jwNpKsmTqHuNAN8HMwKhPBIAW3mOmK5IkZYh2rUXYw/copy",
    featured: false,
    badge: "Final Payment",
    pages: "Multi-tab spreadsheet",
    highlights: [
      "Organized by trade and location",
      "Priority levels: critical, standard, cosmetic",
      "Responsible party and due date tracking",
      "Completion status with summary tab",
      "Completion percentage by trade",
    ],
    published: true,
    created_at: "2026-04-01T12:14:00.000Z",
  },
  {
    id: "legacy-template-17",
    title: "Construction Invoice",
    description:
      "Professional construction invoice template with line-item billing, retainage tracking, and payment terms.",
    long_description:
      "A clean, professional construction invoice spreadsheet that handles line-item billing, retainage tracking, and running payment totals. Covers project info, invoice number and date, billing period, line items by phase or trade, retainage percentage and amount held, previous payments applied, current amount due, and payment terms. Looks professional, gets paid faster.",
    category: "finance",
    file_type: "xlsx",
    download_url:
      "https://docs.google.com/spreadsheets/d/1yWC3qJq0ew1Sw5P3zTigm0l-fcPqldAI_sIouHNEF0o/copy",
    featured: false,
    badge: "Get Paid",
    pages: "Invoice sheet",
    highlights: [
      "Line-item billing by phase or trade",
      "Retainage percentage and running total",
      "Previous payments applied automatically",
      "Current amount due calculation",
      "Professional layout with payment terms",
    ],
    published: true,
    created_at: "2026-04-01T12:15:00.000Z",
  },
  {
    id: "legacy-template-18",
    title: "Roles & Responsibilities Framework",
    description:
      "The organizational framework that defines who owns what — from field to office. Eliminate confusion, overlap, and dropped balls.",
    long_description:
      "The Roles & Responsibilities Framework that Marshall used to scale past $30M. Defines clear ownership for every function in a construction company — from the field (Superintendent, Foreman, Lead Carpenter) to the office (Project Manager, Estimator, Office Manager, Owner). Each role includes: primary responsibilities, decision-making authority, who they report to, and key performance indicators. The document that ends 'I thought you were handling that.'",
    category: "operations",
    file_type: "docx",
    download_url:
      "https://docs.google.com/document/d/1H5_dKbrSgwTpKD7lxK4i3dsjMJvnhCs2sg3l3f4AZHk/copy",
    featured: true,
    badge: "Scale",
    pages: "Full framework",
    highlights: [
      "Field roles: Superintendent, Foreman, Lead Carpenter",
      "Office roles: PM, Estimator, Office Manager, Owner",
      "Decision-making authority for each role",
      "Reporting structure and KPIs per role",
      "The framework that eliminates 'I thought you were handling that'",
    ],
    published: true,
    created_at: "2026-04-01T12:16:00.000Z",
  },
  {
    id: "legacy-template-19",
    title: "CPM Scheduling — The Financial Weapon",
    description:
      "Critical Path Method scheduling framework that turns project timelines into financial weapons. The exact system Marshall used to manage $2.5B+ in construction.",
    long_description:
      "CPM Scheduling: The Financial Weapon Most GCs Never Learn. This comprehensive guide covers the Critical Path Method framework for construction project scheduling. Learn how to identify the critical path, compress schedules without sacrificing quality, manage float and slack, and turn your project timeline into a competitive advantage. The scheduling system that enables faster project delivery and better cash flow management.",
    category: "operations",
    file_type: "pdf",
    download_url: "/templates/cpm-scheduling-the-financial-weapon.pdf",
    featured: false,
    badge: "Marshall's System",
    pages: "Full guide",
    highlights: [
      "Critical Path Method framework and identification",
      "Schedule compression techniques without quality loss",
      "Float and slack management strategies",
      "Cash flow optimization through scheduling",
      "The scheduling system that enables faster delivery",
    ],
    published: true,
    created_at: "2026-04-01T12:17:00.000Z",
  },
  {
    id: "legacy-template-8",
    title: "Construction SOPs Template",
    description:
      "12 comprehensive standard operating procedures for construction project management.",
    long_description:
      "A complete set of 12 battle-tested Standard Operating Procedures covering every phase of construction project management. Includes Daily Pre-Task Planning (Toolbox Talk), Material Receiving & Inspection, Equipment Daily Inspection, Subcontractor Coordination, Daily Progress Reporting, Change Order Management, RFI Processing, Safety Incident Reporting, Quality Control Inspection, Punch List Management, Project Closeout, and Document Control & Filing.",
    category: "operations",
    file_type: "docx",
    download_url:
      "https://docs.google.com/document/d/1jjzpZba5u1sQUQ1lEJR3sYsn8jspKrt3z0xDpq8xXD0/copy",
    featured: true,
    badge: "New",
    pages: "12 SOPs",
    highlights: [
      "Daily Pre-Task Planning (Toolbox Talk) with safety checklist",
      "Material Receiving & Inspection protocol",
      "Subcontractor Coordination and daily progress reporting",
      "Change Order Management and RFI Processing workflows",
      "Safety Incident Reporting, QC Inspection, and Project Closeout",
    ],
    published: true,
    created_at: "2026-04-01T12:18:00.000Z",
  },
  {
    id: "legacy-template-12",
    title: "Presentation from Call #1: EOS for Contractors",
    description:
      "Complete EOS operating system breakdown tailored for contractors. Covers the VITO, Rocks, Scorecard, L10 Meeting, IDS Process, Core Processes, and more.",
    long_description:
      "The full EOS (Entrepreneurial Operating System) framework adapted specifically for construction contractors. This comprehensive deck walks through every component of EOS including the Vision/Traction Organizer (VITO), setting and tracking Rocks, building your Scorecard with leading and lagging indicators, running effective L10 Meetings, the IDS (Identify, Discuss, Solve) problem-solving process, documenting Core Processes, and implementing the People Analyzer. Built from the ALP Contractor Circle inaugural call.",
    category: "contractor_circle",
    file_type: "pdf",
    download_url:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663332724241/JYLdJEaFQZebZwtiasWNpQ/ALP_Contractor_Circle_Inaugural_Call_FINAL_v2_a286e410.pdf",
    featured: true,
    badge: "New",
    pages: "Full Deck",
    highlights: [
      "Vision/Traction Organizer (VITO) for contractor businesses",
      "Rocks: 90-day priority setting and tracking",
      "Scorecard with leading and lagging indicators",
      "L10 Meeting structure for weekly team alignment",
      "IDS Process: Identify, Discuss, Solve",
    ],
    published: true,
    created_at: "2026-04-01T12:19:00.000Z",
  },
  {
    id: "legacy-template-13",
    title: "The Estimator's Checklist",
    description:
      "7-page construction estimating checklist covering contract review, site visits, quantity takeoff, labor calculations, subcontractor management, and final review.",
    long_description:
      "A systematic, step-by-step estimating process that ensures nothing gets missed. This 7-page checklist walks through every phase of a construction estimate: Contract Document Review, Site Visit & Field Conditions, Exclusions & Clarifications, Quantity Takeoff for major materials, Labor & Man-Hour Calculations, Subcontractor Bid Collection & Management, Equipment & Tool Requirements, General Conditions & Indirect Costs, Escalation & Market Conditions, Markup Strategy, and Final Review & Quality Check. Stop estimating from memory — start estimating from a system.",
    category: "estimating",
    file_type: "pdf",
    download_url: LEAD_MAGNET_DOWNLOADS.estimating,
    featured: true,
    badge: "New",
    pages: "7 pages",
    highlights: [
      "Contract Document Review — scope, specs, drawings, addenda",
      "Site Visit & Field Conditions assessment",
      "Quantity Takeoff — major materials by CSI division",
      "Labor & Man-Hour Calculations with crew productivity",
      "Subcontractor Bid Collection & Management",
      "General Conditions & Indirect Costs",
      "Escalation & Market Conditions pricing",
      "Final Review & Quality Check before submission",
    ],
    published: true,
    created_at: "2026-04-01T12:20:00.000Z",
  },
  {
    id: "legacy-template-20",
    title: "ALP/EOS Operating System — Complete Playbook",
    description:
      "The definitive 31-page field guide to the ALP/EOS Operating System. Every component explained in full — Vision, People, Data, Issues, Process, and Traction — built for contractor businesses.",
    long_description:
      "The ALP/EOS Operating System is the foundational business framework adopted by ALP Contractor Circle. Adapted from the Entrepreneurial Operating System (EOS) by Gino Wickman, this implementation layers Marshall Wilkinson's two decades of construction consulting experience — representing over $2.5 billion in completed construction — directly onto the EOS framework. This 31-page comprehensive guide covers all six components in full: Vision/Traction Organizer (V/TO), People (Accountability Chart & People Analyzer), Data (Weekly Scorecard), Issues (IDS — Identify, Discuss, Solve), Process (Core Process Documentation & FBA), and Traction (Rocks & L10 Meeting Pulse). Includes implementation roadmap, construction-specific applications, and a complete terminology glossary.",
    category: "operations",
    file_type: "pdf",
    download_url:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663332724241/JYLdJEaFQZebZwtiasWNpQ/ALP_EOS_Playbook_65c0ba61.pdf",
    featured: true,
    badge: "New",
    pages: "31 pages",
    highlights: [
      "Vision/Traction Organizer (V/TO) — define where you're going and how you'll get there",
      "People Component — Accountability Chart & People Analyzer for right people, right seats",
      "Data Component — Weekly Scorecard with leading and lagging indicators",
      "Issues Component — IDS process to solve problems permanently",
      "Process Component — Core Process Documentation & FBA methodology",
      "Traction Component — Rocks, L10 Meetings, and the Meeting Pulse",
      "Implementation roadmap — 12-month rollout plan for contractor businesses",
      "Construction-specific applications and terminology glossary",
    ],
    published: true,
    created_at: "2026-04-01T12:21:00.000Z",
  },
  {
    id: "legacy-template-21",
    title: "ALP/EOS Scorecard",
    description:
      "One-page field guide to the EOS Data Component. Covers Scorecard setup, leading vs. lagging indicators, finding your One Number, cascading measurables, and red flags that mean your Scorecard is broken.",
    long_description:
      "The EOS Data Component is your weekly pulse check — know your numbers, run your business. This one-page reference covers everything you need to build and maintain an effective Scorecard: the 5-15 numbers max rule, one owner per number, weekly goals that reset, 13 weeks of trailing data, and weekly L10 review. Breaks down Leading vs. Lagging indicators (your P&L tells you what happened — your Scorecard tells you what's happening), how to find your One Number (for contractors: backlog in months), cascading measurables to every seat (PM, Estimator, AR), and the red flags that mean your Scorecard is broken. Includes a sample Scorecard structure.",
    category: "operations",
    file_type: "pdf",
    download_url:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663332724241/JYLdJEaFQZebZwtiasWNpQ/eos_data_handout_Scorecard_df3edffe.pdf",
    featured: true,
    badge: "New",
    pages: "1 page",
    highlights: [
      "The Scorecard — 5-15 numbers max, one owner per number, weekly goals",
      "Leading vs. Lagging — track activities (proposals sent), not just results (revenue)",
      "Find Your One Number — for contractors, backlog in months (above 4 = healthy)",
      "Everyone Gets a Measurable — cascade numbers to every seat in the org",
      "Red Flags — vanity metrics, 30+ numbers, goals too easy, not reviewing weekly",
      "Sample Scorecard Structure with owner, measurable, goal, and 6-week trailing data",
    ],
    published: true,
    created_at: "2026-04-01T12:22:00.000Z",
  },
  {
    id: "legacy-template-24",
    title: "Subcontractor Bid Submittal Form",
    description:
      "Standardized form for collecting subcontractor bids. Covers company info, bid pricing with material + labor breakdown, schedule of work, scope, exclusions, and authorization.",
    long_description:
      "Stop chasing subs for missing info. This standardized bid submittal form forces subcontractors to give you clean, comparable bids every time. Covers company information (license, insurance, bonding), bid pricing with material vs. labor breakdown, schedule of work with phase durations and start/end dates, detailed scope description with tasks and deliverables, exclusions and clarifications (what's NOT included), terms and conditions, warranty provisions, and authorization signatures. Make a copy, brand it with your company name, and send it out with your next bid package.",
    category: "estimating",
    file_type: "docx",
    download_url:
      "https://docs.google.com/document/d/1IWR5H9w7EvJ7kNpMC8i85IH8loUfvJ8xKgHq4tio2lI/copy",
    featured: true,
    badge: "New",
    pages: "2 pages",
    highlights: [
      "Subcontractor info — license number, insurance, bonding capacity",
      "Bid pricing — material vs. labor breakdown for apples-to-apples comparison",
      "Schedule of work — phase durations with start and end dates",
      "Scope description — detailed tasks, deliverables, and specifications",
      "Exclusions & clarifications — what's NOT included in the bid",
      "Terms, warranty, and dual authorization signatures",
    ],
    published: true,
    created_at: "2026-04-01T12:23:00.000Z",
  },
  {
    id: "legacy-template-25",
    title: "ALP/EOS Vision/Traction Organizer (V/TO)",
    description:
      "The two-page strategic tool that aligns your entire leadership team on where you're going and how you're going to get there. Covers all 8 V/TO questions with a completed contractor example.",
    long_description:
      "The Vision/Traction Organizer (V/TO) is the two-page document that captures your company's entire strategic plan. Page one is Vision — where you're going. Page two is Traction — how you're going to get there. Every person on your leadership team should be able to recite the answers. If they can't, you don't have alignment — you have assumptions. This toolkit walks through all 8 questions: Core Values, Core Focus, 10-Year Target, Marketing Strategy, 3-Year Picture, 1-Year Plan, Quarterly Rocks, and Issues List. Includes a fully completed example V/TO for a mid-size general contractor (ABC Construction Co.) so you can see exactly what a finished V/TO looks like before you build your own.",
    category: "operations",
    file_type: "pdf",
    download_url:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663332724241/JYLdJEaFQZebZwtiasWNpQ/ALP_EOS_Toolkit_VITO_63e29d87.pdf",
    featured: true,
    badge: "New",
    pages: "2 pages",
    highlights: [
      "Core Values — the 3-5 non-negotiables you hire, fire, and reward on",
      "Core Focus — your Purpose and Niche that keep you from chasing shiny objects",
      "10-Year Target — one big measurable goal the whole team rallies behind",
      "Marketing Strategy — target market, three uniques, proven process, guarantee",
      "3-Year Picture & 1-Year Plan — revenue, profit, employees, key capabilities",
      "Quarterly Rocks & Issues List — 90-day priorities and the IDS process",
      "Complete example V/TO for a mid-size general contractor",
    ],
    published: true,
    created_at: "2026-04-01T12:24:00.000Z",
  },
  {
    id: "legacy-template-26",
    title: "Presentation from Call #2: Your Business is Your Biggest Asset",
    description:
      "The full deck from ALP Contractor Circle Call #2. Covers why your company is your biggest asset, real PE/M&A acquisition data by sector, valuation multiples, what private equity firms look for when they buy contractors, the ALP EOS VITO through the exit lens, and a deep dive into the People Component.",
    long_description:
      "The complete deck from ALP Contractor Circle Call #2: Your Biggest Asset. This presentation reframes the entire ALP Operating System through the lens of building a company with real market value — not just one that pays you while you run it, but one that's worth something when you're ready to step back. Covers real PE/M&A data: which construction sectors get acquired (MEP, roofing, HVAC, water/wastewater), at what multiples (4-8x EBITDA), and by whom (Dycom, TopBuild, Legence, Installed Building Products). Walks through the VITO framework with exit-lens framing, then goes deep on the People Component — Accountability Charts, the People Analyzer, GWC, and the Right Person / Right Seat matrix with real contractor examples. Includes the ALP Operating System = PE Due Diligence Checklist mapping table.",
    category: "contractor_circle",
    file_type: "pdf",
    download_url:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663332724241/JYLdJEaFQZebZwtiasWNpQ/ALP_Call2_Your_Biggest_Asset_a98da66c.pdf",
    featured: true,
    badge: "New",
    pages: "Full Deck",
    highlights: [
      "PE/M&A data — which contractors get acquired and at what multiples",
      "Sector analysis — MEP, roofing, HVAC, water/wastewater, residential trades",
      "What PE firms look for — 7 criteria that drive acquisition decisions",
      "What kills deals — 6 red flags that destroy market value",
      "VITO framework through the exit lens — every component mapped to PE value",
      "People Component deep dive — Accountability Chart, People Analyzer, GWC",
      "ALP Operating System = PE Due Diligence Checklist mapping table",
    ],
    published: true,
    created_at: "2026-04-01T12:25:00.000Z",
  },
  {
    id: "legacy-template-27",
    title: "The Three Silos Framework",
    description:
      "A strategic framework for scaling your construction business by mastering the three critical silos: Sales & Marketing, Operations & Production, and Finance & Admin.",
    long_description:
      "The Three Silos Framework is the diagnostic tool that reveals why most contractors stay stuck. Every contracting business runs on three silos: Sales & Marketing (how you get work), Operations & Production (how you deliver work), and Finance & Admin (how you keep the money). Most contractors are strong in one silo and weak in the other two — and that imbalance is what kills growth. This framework walks through each silo with diagnostic questions, failure statistics (82% of construction businesses fail due to cash flow problems, 70% of contractors undercharge by 15-30%), and the specific actions required to build a self-sustaining business engine. Includes the Warren Buffett test: 'Would you buy your own company at its current valuation?' If the answer is no, this framework shows you exactly what to fix.",
    category: "operations",
    file_type: "pdf",
    download_url: LEAD_MAGNET_DOWNLOADS.silos,
    featured: true,
    badge: "New",
    pages: "5 pages",
    highlights: [
      "Three Silos diagnostic — Sales & Marketing, Operations & Production, Finance & Admin",
      "Failure statistics — 82% fail from cash flow, 70% undercharge by 15-30%",
      "Silo-specific diagnostic questions to identify your weakest link",
      "The Warren Buffett test — would you buy your own company?",
      "Action steps to build a self-sustaining business engine",
    ],
    published: true,
    created_at: "2026-04-01T12:26:00.000Z",
  },
  {
    id: "legacy-template-28",
    title: "EOS Component Connection Map",
    description:
      "A comprehensive visual map showing how all six EOS components connect and why the build sequence matters. The architecture behind the ALP Operating System.",
    long_description:
      "The EOS Component Connection Map explains the interlocking architecture of your business operating system. This is not a menu of options — it is a sequenced build where every component relies on the one before it. The map walks through all six components in order: Vision (V/TO as the foundation), People (Accountability Chart creates the seats), Data (Scorecard tracks 5-15 leading indicators), Issues (IDS solves problems permanently), Process (Core Process Documentation), and Traction (Rocks & L10 Meeting). Each section explains the tool, why it comes in that specific order, and how it connects to the next component. Includes a critical section on what happens when you skip a step — with real-world consequences contractors see every day: managing by gut feel, finger-pointing, same problems discussed for years, best people burning out, and quarterly goals forgotten by week three.",
    category: "operations",
    file_type: "pdf",
    download_url:
      "https://alpcontractorcircle.com/manus-storage/ALP_EOS_Component_Connection_Map_0a3bdbab.pdf",
    featured: true,
    badge: "New",
    pages: "5 pages",
    highlights: [
      "Parent/Child Framework — V/TO is the foundation, everything inherits from it",
      "Six components in sequence — Vision, People, Data, Issues, Process, Traction",
      "Each component explained: the tool, why it comes in that order, and the connection",
      "What happens when you skip a step — real consequences from real contractor businesses",
      "The Bottom Line: build the V/TO first, Accountability Chart second, never skip ahead",
    ],
    published: true,
    created_at: "2026-04-01T12:27:00.000Z",
  },
  {
    id: "legacy-template-29",
    title: "Project Manager Meeting — Weekly Process & Deliverables",
    description:
      "Visual infographic of the weekly PM meeting cadence: Monday project review, One Week Look Ahead, and Friday L10 lock.",
    long_description:
      "A complete visual breakdown of the weekly Project Manager Meeting process and deliverables. Covers the three-step weekly cadence that keeps projects on track: (1) Monday Morning PM Meeting — review each project's Original Contract Value, Revised Contract Value, Cost to Date, Committed Costs, Schedule Status, and the locked One Week Look Ahead from the CPM schedule. (2) One Week Look Ahead Review — all work activities confirmed, materials scheduled and available, subcontractors locked in, manpower committed, and constraints/risks identified before the week begins. Must be locked on Friday before the Monday meeting. (3) Friday L10 Meeting & Lock — Project Managers deliver the locked One Week Look Ahead, confirmation that all subs, manpower, and materials are locked in, and clear readiness for the upcoming week. Includes the Key Rule: no work activity should appear in the One Week Look Ahead unless manpower, materials, and subcontractor commitments are locked in. Client-facing outcomes: better visibility into cost and schedule, improved weekly accountability, fewer execution gaps, and stronger readiness for the week ahead.",
    category: "operations",
    file_type: "pdf",
    download_url:
      "https://alpcontractorcircle.com/manus-storage/ProjectManagerMeetingGraphic_7d272ed6.png",
    featured: true,
    badge: "New",
    pages: "1 page infographic",
    highlights: [
      "Monday Morning PM Meeting — review OCV, RCV, Cost to Date, Committed Costs, Schedule Status",
      "One Week Look Ahead — locked on Friday, all activities, materials, subs, and manpower confirmed",
      "Friday L10 Meeting & Lock — deliverables from PMs with clear readiness confirmation",
      "Key Rule: nothing on the Look Ahead unless manpower, materials, and subs are locked in",
      "Client-Facing Outcomes: cost visibility, accountability, fewer gaps, stronger weekly readiness",
    ],
    published: true,
    created_at: "2026-04-01T12:28:00.000Z",
  },
  {
    id: "legacy-template-30",
    title: "Project Financial & Schedule Overview — Job Cost Ledger",
    description:
      "Visual infographic showing the 8 critical financial and schedule metrics every PM must track for profitable project execution.",
    long_description:
      "Your Roadmap to Profitable Project Execution. This infographic breaks down the 8 numbers that are critical for every project manager meeting. For each project, you must know: (1) Original Contract Value — the contract value at execution. (2) Total Costs to Date — what you've actually spent on the project so far. (3) Total Committed Costs — the total cost you are on the hook for to complete the project (incurred + committed). (4) Revised Contract Value — the new contract value inclusive of approved add and deduct change orders. (5) Paid to Date — exactly what you've been paid on the contract. (6) Remaining to Be Paid — the delta on the contract that's remaining to be paid to you. (7) Original Contract Duration — in weeks, months, or years. (8) CPM Schedule Remaining Duration — the actual remaining duration as reflected in the CPM inclusive of adds and deduct change orders. These numbers are critical for every project manager meeting. By understanding both the financial and time position of the job, you can quickly assess whether you're behind or ahead, identify risks early, and take focused action to protect your margin and drive the job to success. Measure It. Manage It. Execute It. Win It.",
    category: "operations",
    file_type: "pdf",
    download_url:
      "https://alpcontractorcircle.com/manus-storage/ProjectManagerDashboard_9dde9526.png",
    featured: true,
    badge: "New",
    pages: "1 page infographic",
    highlights: [
      "8 critical metrics: OCV, Costs to Date, Committed Costs, RCV, Paid to Date, Remaining, Duration, CPM Remaining",
      "Monday Morning Roadmap — understand position, identify risk, protect margin, execute with confidence",
      "Visual breakdown of each metric with clear definitions and color-coded explanations",
      "Sample project walkthrough: $24.5M Wastewater Treatment Plant with real numbers",
      "Measure It. Manage It. Execute It. Win It.",
    ],
    published: true,
    created_at: "2026-04-01T12:29:00.000Z",
  },
  {
    id: "legacy-template-31",
    title: "ALP/EOS Weekly Scorecard — L10 Measurables & Quarterly Rocks",
    description:
      "Complete EOS weekly scorecard template with 10 measurables across Controller, VP Ops, and CEO seats, plus quarterly rock review tracker.",
    long_description:
      "The ALP/EOS Weekly Scorecard is the heartbeat of your Level 10 meeting. This 2-page template shows exactly how to track the numbers that matter most — Revenue Billed, AR Over 60 Days, Cash on Hand, Active Projects on Schedule, Change Orders Pending, Safety Incidents, Bids Submitted, Bid-Hit Rate, New Qualified Prospects, and Employee Satisfaction Pulse. Each measurable has a clear owner (Controller, VP Ops, or CEO), a defined goal, and a 13-week trailing view so you can spot trends before they become problems. The rule is simple: THREE WEEKS RED = ISSUE — any number red for 3 consecutive weeks automatically drops to the Issues List for IDS. Page 2 is the Quarterly Rock Review — a structured tracker for your 90-day priorities with owner, description, and on-track/off-track status. This is the exact scorecard format used by Apex Commercial Contractors in the ALP/EOS bootcamp. Adapt the measurables to your business, but keep the discipline of tracking weekly.",
    category: "operations",
    file_type: "pdf",
    download_url:
      "https://alpcontractorcircle.com/manus-storage/Scorecard_Apex_Commercial_cdf6e910.pdf",
    featured: true,
    badge: "Bootcamp",
    pages: "2 pages",
    highlights: [
      "10 measurables across 3 seats: Controller (Revenue, AR, Cash), VP Ops (Schedule, COs, Safety), CEO (Bids, Hit Rate, Prospects, Satisfaction)",
      "13-week trailing view with color-coded red/yellow/green performance indicators",
      "Three Weeks Red = Issue rule — automatic escalation to the Issues List for IDS",
      "Quarterly Rock Review with owner, description, and on-track/off-track status",
      "Real example from Apex Commercial Contractors — adapt the measurables to your company",
    ],
    published: true,
    created_at: "2026-04-01T12:30:00.000Z",
  },
  {
    id: "legacy-template-32",
    title: "Vision/Traction Organizer (VITO) — Complete Example",
    description:
      "Full 8-page EOS Vision/Traction Organizer for a $25M commercial GC, covering Core Values through Quarterly Rocks with real targets and strategies.",
    long_description:
      "The VITO — Vision/Traction Organizer — is the single most important document in your company. This 8-page example, built for Apex Commercial Contractors, shows exactly how to complete every section of the EOS VITO for a construction company. PAGE 1: VISION — Core Values (Own It, Do What You Say, Team First, Get It Done, Safety Always), Core Focus (purpose, niche), 10-Year Target ($100M revenue, 12% net profit, 200+ employees, <5% owner involvement), and Marketing Strategy (target market, three uniques, proven process, guarantee). PAGE 2: TRACTION — 3-Year Picture ($50M, full leadership team, healthcare division at 30%, $25M single-project bonding), 1-Year Plan (7 goals from $30M revenue to implementing ALP/EOS company-wide), and Quarterly Rocks (Q2 2026: Post VP Ops listing, bid 4 healthcare projects, run L10s for 12 weeks, close out 3 lingering projects). Every layer of the VITO cascade pulls toward the layer above it — 10-Year → 3-Year → 1-Year → Quarterly Rocks. Use this as your blueprint to build your own.",
    category: "leadership",
    file_type: "pdf",
    download_url:
      "https://alpcontractorcircle.com/manus-storage/VITO_Apex_Commercial_Contractors_859f6adb.pdf",
    featured: true,
    badge: "Bootcamp",
    pages: "8 pages",
    highlights: [
      "Complete VITO example for a $25M commercial GC — every section filled out with real targets",
      "Core Values with definitions, Core Focus with niche and purpose, 10-Year Target with specific metrics",
      "Marketing Strategy: target market, three uniques, proven process, and guarantee",
      "3-Year Picture, 1-Year Plan (7 goals), and Quarterly Rocks (Q2 2026) — all connected",
      "The VITO Cascade: 10-Year → 3-Year → 1-Year → Quarterly Rocks — every layer pulls toward the one above",
    ],
    published: true,
    created_at: "2026-04-01T12:31:00.000Z",
  },
  {
    id: "legacy-template-33",
    title: "Monthly Boot Camp — Building the Machine (April 2026)",
    description:
      "Full 36-slide bootcamp deck covering ALP/EOS implementation, the VITO cascade, accountability charts, People Analyzer, mock L10 meetings, and the APP framework.",
    long_description:
      'The April 2026 ALP Contractor Circle Monthly Boot Camp slide deck — "Building the Machine: ALP/EOS Implementation, the APP Framework, and Real-World Problem Solving." This 36-page presentation covers the complete 3-hour bootcamp in 5 blocks: Block 1 — VITO & Accountability Chart Review (45 min): The VITO cascade from 10-Year Target down to Quarterly Rocks, how to build your accountability chart with the 5 major functions (Sales/Marketing, Operations, Finance, Integrator, Visionary), and why structure drives execution. Block 2 — People Analyzer Deep Dive (30 min): The EOS People Analyzer tool for evaluating whether people are in the right seats — GWC (Get It, Want It, Capacity) plus core value alignment scoring. Block 3 — Mock L10 Meeting & IDS (45 min): A live walkthrough of the Level 10 meeting format — segue, scorecard review, rock review, customer/employee headlines, to-do list, and IDS (Identify, Discuss, Solve). Block 4 — The APP Framework (25 min): Marshall\'s proprietary Accountability, Process, Performance framework for building systems that run without the owner. Block 5 — Selected member patterns and implementation discussion (25 min): questions reviewed for broad group value and turned into operating-system lessons.',
    category: "leadership",
    file_type: "pdf",
    download_url:
      "https://alpcontractorcircle.com/manus-storage/ALP_Contractor_Circle_Monthly_Boot_Camp_28fa55ce.pdf",
    featured: true,
    badge: "Bootcamp",
    pages: "36 pages",
    highlights: [
      "5 blocks: VITO & Accountability Chart, People Analyzer, Mock L10 & IDS, APP Framework, Member Topics",
      "The VITO Cascade explained: 10-Year → 3-Year → 1-Year → Quarterly Rocks with real examples",
      "EOS People Analyzer: GWC (Get It, Want It, Capacity) + core value alignment scoring",
      "Full L10 meeting walkthrough: segue, scorecard, rocks, headlines, to-do list, IDS",
      "Marshall's APP Framework: Accountability, Process, Performance — build systems that run without you",
    ],
    published: true,
    created_at: "2026-04-01T12:32:00.000Z",
  },
  {
    id: "legacy-template-34",
    title: "ALP-EOS Command Center Blueprint — Your Complete Operating System on One Page",
    description:
      "One-page visual blueprint mapping all 6 EOS components (Vision, People, Data, Issues, Process, Traction), the Golden Rules, and the Meeting Pulse rhythm.",
    long_description:
      "The ALP-EOS Command Center is your complete operating system on one page — a Contractor Circle Exclusive. This single-page blueprint maps the entire EOS framework as an interlocking architecture where every component relies on the one before it. The 6 Components: 1. VISION (Tool: VITO) — Core Values, Core Focus, 10-Year Target, Marketing Strategy, 3-Year Picture, 1-Year Plan, Quarterly Rocks, Issues List. The foundational document that defines where the company is going and how it will get there. 2. PEOPLE (Tool: Accountability Chart & People Analyzer) — One Person Per Seat, 5 Core Seats, 3-5 Accountabilities, GWC Evaluation. Structuring the organization for scalability. 3. DATA (Tool: Weekly Scorecard) — 5-15 Numbers Max, Leading Indicators, Single Ownership, Weekly Goal. Running the business on objective numbers. 4. ISSUES (Tool: Issues List & IDS Framework) — Identify root cause, Discuss perspectives, Solve with action items. 5. PROCESS (Tool: Core Process Documentation) — 20/80 Rule, 8 Core GC Processes, FBA Standard. Systematizing the business for consistency and scalability. 6. TRACTION (Tool: Rocks & L10 Meeting) — 90-Day Rocks, L10 Meeting Agenda, Weekly Discipline. The Golden Rules: The Foundation Rule (VITO first, Accountability Chart second), The Accountability Rule (one person per seat), The Scorecard Rule (no narrative — on track or off track), The Issue Rule (three weeks red = IDS'd), The Execution Rule (90% To-Do completion or it's an Issue). The Meeting Pulse: Weekly L10 (90 min), Quarterly Planning (1 Full Day Offsite), Annual Planning (2 Full Days Offsite), State of Company (Quarterly, 45 min). Architecture Note: This is not a menu of options. Every component relies on the one before it. Skip a step, and the system breaks.",
    category: "leadership",
    file_type: "pdf",
    download_url:
      "https://alpcontractorcircle.com/manus-storage/ALP_EOS_Command_Center_Blueprint_393ce9e4.pdf",
    featured: true,
    badge: "New",
    pages: "1 page",
    highlights: [
      "6 EOS Components mapped: Vision (VITO), People (Accountability Chart), Data (Scorecard), Issues (IDS), Process (Core Docs), Traction (Rocks & L10)",
      "The Golden Rules: Foundation, Accountability, Scorecard, Issue, and Execution rules for running EOS",
      "The Meeting Pulse: Weekly L10, Quarterly Planning, Annual Planning, State of Company cadence",
      "Interlocking architecture — every component relies on the one before it, skip a step and the system breaks",
    ],
    published: true,
    created_at: "2026-04-01T12:33:00.000Z",
  },
  {
    id: "legacy-template-35",
    title: "Owner Dependency Scorecard — How Reliant Is Your Business on You?",
    description:
      "10-page self-assessment scoring your business across 5 critical categories on a 1-5 dependency scale, with coaching prompts to identify where you're still the bottleneck.",
    long_description:
      "The Owner Dependency Scorecard is a practical self-assessment for contractor owners who want a company that runs without them — a Contractor Circle Exclusive. Every contractor starts as the person who does everything: sell the work, estimate the work, manage the work, pay the bills, handle the problems. But what got you here will not get you to the next level. If your business cannot function without you for 30 days, you do not own a company — you own a job. This scorecard gives you an honest, measurable picture of where you stand today. Rate your company on a scale of 1 (Total Dependency — you do this entirely yourself, it fails without you) to 5 (Zero Dependency — fully delegated to a capable leader with a documented process). The 5 Categories: 1. Vision & Leadership — Can the company set goals, resolve conflicts, and stay aligned without you driving it every day? 2. Sales & Estimating — Can the company generate leads, build relationships, estimate projects, and close deals without you? 3. Operations & Field Production — Can projects be managed, crews scheduled, quality maintained, and problems solved without you? 4. Financial Management — Can the company manage cash flow, job costing, billing, and financial decisions without you? 5. People & Culture — Can the company hire, develop, hold accountable, and retain the right people without you? Each category includes a Coach's Prompt to help you identify where you are still the final approval point, problem-solver, or safety net. Best Practice: Complete the scorecard quickly the first time — your initial reaction is usually the most accurate. Then review the lowest-scoring category and identify one practical improvement that can be delegated, documented, or systematized in the next 90 days. Important: Do not average away a weak function. One low score can still keep the owner trapped in the business.",
    category: "leadership",
    file_type: "pdf",
    download_url:
      "https://alpcontractorcircle.com/manus-storage/ALP_Owner_Dependency_Scorecard_Client_Facing_36b1deda.pdf",
    featured: true,
    badge: "New",
    pages: "10 pages",
    highlights: [
      "5 scoring categories: Vision & Leadership, Sales & Estimating, Operations & Field Production, Financial Management, People & Culture",
      "1-5 Dependency Scale: Total Dependency to Zero Dependency with detailed descriptions of what each level looks like",
      "Coach's Prompts on every category to identify where you're still the bottleneck, approval point, or safety net",
      "Best Practice: Complete quickly, review lowest score, identify one improvement to delegate or systematize in 90 days",
    ],
    published: true,
    created_at: "2026-04-01T12:34:00.000Z",
  },
] satisfies LibraryTemplate[];

export const circleReplayCatalog = [
  {
    id: "replay-2026-05-09-jermaine-warren",
    title:
      "Contractor Circle Call, Saturday, May 9th, 2026 - Special guest speaker Jermaine Warren from ICV Partners Private Equity",
    description:
      "Marshall hosted a Contractor Circle group session featuring Jermaine Warren from ICV Partners, with practical judgment on what private equity looks for in construction businesses: scalable operations, non-discretionary demand, reduced founder dependency, standardized processes, and growth-ready financial discipline.",
    duration_minutes: 120,
    recorded_at: "2026-05-09T21:00:00.000Z",
    tags: ["Contractor Circle", "Private Equity", "Enterprise Value"],
    thumbnail_url: null,
    video_url: "https://us06web.zoom.us/clips/embed/N6Y0Vi1_SL64mIQMURr14Q",
    published: true,
    created_at: "2026-05-09T21:00:00.000Z",
  },
  {
    id: "replay-2026-04-26-building-the-machine-bootcamp",
    title: "Contractor Circle Monthly Boot Camp Event - April",
    description:
      'Monthly bootcamp session focused on "Building the Machine," including VITO review, accountability charts, planning levels, quarterly rocks, hiring priorities, and the operating discipline required to scale a construction company without separate silos.',
    duration_minutes: 300,
    recorded_at: "2026-04-26T21:00:00.000Z",
    tags: ["Bootcamp", "AOS", "Implementation"],
    thumbnail_url: null,
    video_url: "https://us06web.zoom.us/clips/embed/lho53C-BRZyh-zIyuiX1bw",
    published: true,
    created_at: "2026-04-26T21:00:00.000Z",
  },
  {
    id: "replay-2026-04-12-business-asset",
    title: "Contractor Circle call #2 - Your Business is your Biggest Asset",
    description:
      "Marshall led a Contractor Circle discussion on building a business with enterprise value, including PE acquisition criteria, owner-independent operations, recurring revenue, systemized process, W-2 workforce structure, VITO through the exit lens, and the People Component.",
    duration_minutes: 180,
    recorded_at: "2026-04-12T21:00:00.000Z",
    tags: ["Contractor Circle", "Enterprise Value", "Leadership"],
    thumbnail_url: cloudflareThumbnailUrl("6ffb51a061db1e7606772c499b016119"),
    video_url: cloudflareStreamUrl("6ffb51a061db1e7606772c499b016119"),
    published: true,
    created_at: "2026-04-12T21:00:00.000Z",
  },
  {
    id: "replay-2026-03-29-inaugural-call",
    title: "Inaugural Call (Introductions & ALP/EOS)",
    description:
      "Kickoff Contractor Circle session introducing the six-component operating system for contractors: VITO, People, Data, Issues, Process, and Traction. The session frames structured decision-making, accountability charts, weekly pulse tracking, and the first implementation path.",
    duration_minutes: 120,
    recorded_at: "2026-03-29T22:59:00.000Z",
    tags: ["Contractor Circle", "EOS", "Operations"],
    thumbnail_url: cloudflareThumbnailUrl("f7aa2ae6746076f3a91ed3da28390882"),
    video_url: cloudflareStreamUrl("f7aa2ae6746076f3a91ed3da28390882"),
    published: true,
    created_at: "2026-03-29T22:59:00.000Z",
  },
  {
    id: "masterclass-sales-baseline-lesson-8",
    title: "Lesson 8 Conclusion",
    description:
      "Final ALP Outdoor Living Sales Course lesson tying the sales-control framework back to professional operator behavior and next-step execution.",
    duration_minutes: null,
    recorded_at: "2026-03-20T18:07:00.000Z",
    tags: ["Masterclass", "Sales", "Implementation"],
    thumbnail_url: cloudflareThumbnailUrl("90e9cdb2693dbb7b1355d0e6161c7453"),
    video_url: cloudflareStreamUrl("90e9cdb2693dbb7b1355d0e6161c7453"),
    published: true,
    created_at: "2026-03-20T18:07:00.000Z",
  },
  {
    id: "masterclass-sales-baseline-lesson-7",
    title: "Lesson 7 The Professional Operator Standard",
    description:
      "ALP Outdoor Living Sales Course lesson on the professional operator standard: the posture, control, and operating discipline behind a premium contractor sales process.",
    duration_minutes: null,
    recorded_at: "2026-03-20T18:06:00.000Z",
    tags: ["Masterclass", "Sales", "Operator Standard"],
    thumbnail_url: cloudflareThumbnailUrl("74faf840fe2dfde85cbaa40dadc55129"),
    video_url: cloudflareStreamUrl("74faf840fe2dfde85cbaa40dadc55129"),
    published: true,
    created_at: "2026-03-20T18:06:00.000Z",
  },
  {
    id: "masterclass-sales-baseline-lesson-6",
    title: "Lesson 6 The Controlled Exit Protocol and Gap Authority",
    description:
      "ALP Outdoor Living Sales Course lesson on controlling the exit, preserving authority, and using gap authority so the next decision stays clear.",
    duration_minutes: null,
    recorded_at: "2026-03-20T18:05:00.000Z",
    tags: ["Masterclass", "Sales", "Authority"],
    thumbnail_url: cloudflareThumbnailUrl("0aab518d4080b6bb5120737c4ecd2cbb"),
    video_url: cloudflareStreamUrl("0aab518d4080b6bb5120737c4ecd2cbb"),
    published: true,
    created_at: "2026-03-20T18:05:00.000Z",
  },
  {
    id: "masterclass-sales-baseline-lesson-5",
    title: "Lesson 5 Objections, Authority and Controlling the Next Decision",
    description:
      "ALP Outdoor Living Sales Course lesson on handling objections without surrendering control, reframing resistance, and directing the next decision.",
    duration_minutes: null,
    recorded_at: "2026-03-20T18:04:00.000Z",
    tags: ["Masterclass", "Sales", "Objections"],
    thumbnail_url: cloudflareThumbnailUrl("dde07034114fd2ac0c270f296ad9bbb1"),
    video_url: cloudflareStreamUrl("dde07034114fd2ac0c270f296ad9bbb1"),
    published: true,
    created_at: "2026-03-20T18:04:00.000Z",
  },
  {
    id: "masterclass-sales-baseline-lesson-4",
    title: "Lesson 4 Authority Pre-Framing and First Visit Control",
    description:
      "ALP Outdoor Living Sales Course lesson on setting authority before the visit and keeping the first appointment structured around the right decision.",
    duration_minutes: null,
    recorded_at: "2026-03-20T18:03:00.000Z",
    tags: ["Masterclass", "Sales", "Authority"],
    thumbnail_url: cloudflareThumbnailUrl("d5d801bb685c2ba37307cfec975a45ba"),
    video_url: cloudflareStreamUrl("d5d801bb685c2ba37307cfec975a45ba"),
    published: true,
    created_at: "2026-03-20T18:03:00.000Z",
  },
  {
    id: "masterclass-sales-baseline-lesson-3",
    title: "Lesson 3 The Decision Architecture Framework",
    description:
      "ALP Outdoor Living Sales Course lesson on decision architecture: how to structure a sales process around controlled next decisions instead of loose follow-up.",
    duration_minutes: null,
    recorded_at: "2026-03-20T18:02:00.000Z",
    tags: ["Masterclass", "Sales", "Decision Architecture"],
    thumbnail_url: cloudflareThumbnailUrl("7cc786910d9c8dd471bcbd9dea7d0f47"),
    video_url: cloudflareStreamUrl("7cc786910d9c8dd471bcbd9dea7d0f47"),
    published: true,
    created_at: "2026-03-20T18:02:00.000Z",
  },
  {
    id: "masterclass-sales-baseline-lesson-2",
    title: "Lesson 2 Why Most Outdoor Living Contractors Lose Control",
    description:
      "ALP Outdoor Living Sales Course lesson diagnosing why outdoor living contractors lose control of the buyer process and where authority starts to leak.",
    duration_minutes: null,
    recorded_at: "2026-03-20T18:01:00.000Z",
    tags: ["Masterclass", "Sales", "Control"],
    thumbnail_url: cloudflareThumbnailUrl("d08eb0b0803e5465b51140730cfcd265"),
    video_url: cloudflareStreamUrl("d08eb0b0803e5465b51140730cfcd265"),
    published: true,
    created_at: "2026-03-20T18:01:00.000Z",
  },
  {
    id: "masterclass-sales-baseline-lesson-1",
    title: "Lesson 1 The Professional Sales Baseline",
    description:
      "ALP Outdoor Living Sales Course opening lesson establishing the professional sales baseline for authority, control, qualification, and next-step discipline.",
    duration_minutes: null,
    recorded_at: "2026-03-20T18:00:00.000Z",
    tags: ["Masterclass", "Sales", "Professional Baseline"],
    thumbnail_url: cloudflareThumbnailUrl("71bc6466270cc0f24427c97176ea1c4a"),
    video_url: cloudflareStreamUrl("71bc6466270cc0f24427c97176ea1c4a"),
    published: true,
    created_at: "2026-03-20T18:00:00.000Z",
  },
] satisfies LibraryReplay[];

export function shouldUseTemplateCatalogFallback(templates: { title: string }[]) {
  return (
    templates.length < 20 ||
    templates.some((template) => PLACEHOLDER_TEMPLATE_TITLES.has(template.title))
  );
}

export function shouldUseReplayCatalogFallback(replays: { title: string }[]) {
  return (
    replays.length === 0 || replays.some((replay) => PLACEHOLDER_REPLAY_TITLES.has(replay.title))
  );
}
