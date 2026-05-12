-- Publish the real replay sources pulled from the old portal admin records.
-- Zoom clips use their embed URLs. Cloudflare Stream records use public iframe URLs.

DELETE FROM public.replays
WHERE title = ANY(
  ARRAY[
    'EOS for Contractors — Full Session',
    'Your Business is Your Biggest Asset — Call #2',
    'Contractor Circle with Jermaine Warren'
  ]::text[]
);

INSERT INTO public.replays (
  title,
  description,
  duration_minutes,
  recorded_at,
  tags,
  thumbnail_url,
  video_url,
  published,
  created_at
)
SELECT *
FROM (
  VALUES
    (
      'Contractor Circle Call, Saturday, May 9th, 2026 - Special guest speaker Jermaine Warren from ICV Partners Private Equity',
      'Marshall hosted a Contractor Circle group session featuring Jermaine Warren from ICV Partners, with practical judgment on what private equity looks for in construction businesses: scalable operations, non-discretionary demand, reduced founder dependency, standardized processes, and growth-ready financial discipline.',
      120,
      '2026-05-09T21:00:00.000Z'::timestamptz,
      ARRAY['Contractor Circle', 'Private Equity', 'Enterprise Value']::text[],
      NULL,
      'https://us06web.zoom.us/clips/embed/N6Y0Vi1_SL64mIQMURr14Q',
      true,
      '2026-05-09T21:00:00.000Z'::timestamptz
    ),
    (
      'Contractor Circle Monthly Boot Camp Event - April',
      'Monthly bootcamp session focused on "Building the Machine," including VITO review, accountability charts, planning levels, quarterly rocks, hiring priorities, and the operating discipline required to scale a construction company without separate silos.',
      300,
      '2026-04-26T21:00:00.000Z'::timestamptz,
      ARRAY['Bootcamp', 'AOS', 'Implementation']::text[],
      NULL,
      'https://us06web.zoom.us/clips/embed/lho53C-BRZyh-zIyuiX1bw',
      true,
      '2026-04-26T21:00:00.000Z'::timestamptz
    ),
    (
      'Contractor Circle call #2 - Your Business is your Biggest Asset',
      'Marshall led a Contractor Circle discussion on building a business with enterprise value, including PE acquisition criteria, owner-independent operations, recurring revenue, systemized process, W-2 workforce structure, VITO through the exit lens, and the People Component.',
      180,
      '2026-04-12T21:00:00.000Z'::timestamptz,
      ARRAY['Contractor Circle', 'Enterprise Value', 'Leadership']::text[],
      'https://videodelivery.net/6ffb51a061db1e7606772c499b016119/thumbnails/thumbnail.jpg?time=1s',
      'https://iframe.videodelivery.net/6ffb51a061db1e7606772c499b016119',
      true,
      '2026-04-12T21:00:00.000Z'::timestamptz
    ),
    (
      'Inaugural Call (Introductions & ALP/EOS)',
      'Kickoff Contractor Circle session introducing the six-component operating system for contractors: VITO, People, Data, Issues, Process, and Traction. The session frames structured decision-making, accountability charts, weekly pulse tracking, and the first implementation path.',
      120,
      '2026-03-29T22:59:00.000Z'::timestamptz,
      ARRAY['Contractor Circle', 'EOS', 'Operations']::text[],
      'https://videodelivery.net/f7aa2ae6746076f3a91ed3da28390882/thumbnails/thumbnail.jpg?time=1s',
      'https://iframe.videodelivery.net/f7aa2ae6746076f3a91ed3da28390882',
      true,
      '2026-03-29T22:59:00.000Z'::timestamptz
    ),
    (
      'Lesson 8 Conclusion',
      'Final ALP Outdoor Living Sales Course lesson tying the sales-control framework back to professional operator behavior and next-step execution.',
      NULL,
      '2026-03-20T18:07:00.000Z'::timestamptz,
      ARRAY['Masterclass', 'Sales', 'Implementation']::text[],
      'https://videodelivery.net/90e9cdb2693dbb7b1355d0e6161c7453/thumbnails/thumbnail.jpg?time=1s',
      'https://iframe.videodelivery.net/90e9cdb2693dbb7b1355d0e6161c7453',
      true,
      '2026-03-20T18:07:00.000Z'::timestamptz
    ),
    (
      'Lesson 7 The Professional Operator Standard',
      'ALP Outdoor Living Sales Course lesson on the professional operator standard: the posture, control, and operating discipline behind a premium contractor sales process.',
      NULL,
      '2026-03-20T18:06:00.000Z'::timestamptz,
      ARRAY['Masterclass', 'Sales', 'Operator Standard']::text[],
      'https://videodelivery.net/74faf840fe2dfde85cbaa40dadc55129/thumbnails/thumbnail.jpg?time=1s',
      'https://iframe.videodelivery.net/74faf840fe2dfde85cbaa40dadc55129',
      true,
      '2026-03-20T18:06:00.000Z'::timestamptz
    ),
    (
      'Lesson 6 The Controlled Exit Protocol and Gap Authority',
      'ALP Outdoor Living Sales Course lesson on controlling the exit, preserving authority, and using gap authority so the next decision stays clear.',
      NULL,
      '2026-03-20T18:05:00.000Z'::timestamptz,
      ARRAY['Masterclass', 'Sales', 'Authority']::text[],
      'https://videodelivery.net/0aab518d4080b6bb5120737c4ecd2cbb/thumbnails/thumbnail.jpg?time=1s',
      'https://iframe.videodelivery.net/0aab518d4080b6bb5120737c4ecd2cbb',
      true,
      '2026-03-20T18:05:00.000Z'::timestamptz
    ),
    (
      'Lesson 5 Objections, Authority and Controlling the Next Decision',
      'ALP Outdoor Living Sales Course lesson on handling objections without surrendering control, reframing resistance, and directing the next decision.',
      NULL,
      '2026-03-20T18:04:00.000Z'::timestamptz,
      ARRAY['Masterclass', 'Sales', 'Objections']::text[],
      'https://videodelivery.net/dde07034114fd2ac0c270f296ad9bbb1/thumbnails/thumbnail.jpg?time=1s',
      'https://iframe.videodelivery.net/dde07034114fd2ac0c270f296ad9bbb1',
      true,
      '2026-03-20T18:04:00.000Z'::timestamptz
    ),
    (
      'Lesson 4 Authority Pre-Framing and First Visit Control',
      'ALP Outdoor Living Sales Course lesson on setting authority before the visit and keeping the first appointment structured around the right decision.',
      NULL,
      '2026-03-20T18:03:00.000Z'::timestamptz,
      ARRAY['Masterclass', 'Sales', 'Authority']::text[],
      'https://videodelivery.net/d5d801bb685c2ba37307cfec975a45ba/thumbnails/thumbnail.jpg?time=1s',
      'https://iframe.videodelivery.net/d5d801bb685c2ba37307cfec975a45ba',
      true,
      '2026-03-20T18:03:00.000Z'::timestamptz
    ),
    (
      'Lesson 3 The Decision Architecture Framework',
      'ALP Outdoor Living Sales Course lesson on decision architecture: how to structure a sales process around controlled next decisions instead of loose follow-up.',
      NULL,
      '2026-03-20T18:02:00.000Z'::timestamptz,
      ARRAY['Masterclass', 'Sales', 'Decision Architecture']::text[],
      'https://videodelivery.net/7cc786910d9c8dd471bcbd9dea7d0f47/thumbnails/thumbnail.jpg?time=1s',
      'https://iframe.videodelivery.net/7cc786910d9c8dd471bcbd9dea7d0f47',
      true,
      '2026-03-20T18:02:00.000Z'::timestamptz
    ),
    (
      'Lesson 2 Why Most Outdoor Living Contractors Lose Control',
      'ALP Outdoor Living Sales Course lesson diagnosing why outdoor living contractors lose control of the buyer process and where authority starts to leak.',
      NULL,
      '2026-03-20T18:01:00.000Z'::timestamptz,
      ARRAY['Masterclass', 'Sales', 'Control']::text[],
      'https://videodelivery.net/d08eb0b0803e5465b51140730cfcd265/thumbnails/thumbnail.jpg?time=1s',
      'https://iframe.videodelivery.net/d08eb0b0803e5465b51140730cfcd265',
      true,
      '2026-03-20T18:01:00.000Z'::timestamptz
    ),
    (
      'Lesson 1 The Professional Sales Baseline',
      'ALP Outdoor Living Sales Course opening lesson establishing the professional sales baseline for authority, control, qualification, and next-step discipline.',
      NULL,
      '2026-03-20T18:00:00.000Z'::timestamptz,
      ARRAY['Masterclass', 'Sales', 'Professional Baseline']::text[],
      'https://videodelivery.net/71bc6466270cc0f24427c97176ea1c4a/thumbnails/thumbnail.jpg?time=1s',
      'https://iframe.videodelivery.net/71bc6466270cc0f24427c97176ea1c4a',
      true,
      '2026-03-20T18:00:00.000Z'::timestamptz
    )
) AS seeded (
  title,
  description,
  duration_minutes,
  recorded_at,
  tags,
  thumbnail_url,
  video_url,
  published,
  created_at
)
WHERE NOT EXISTS (
  SELECT 1
  FROM public.replays existing
  WHERE existing.title = seeded.title
);
