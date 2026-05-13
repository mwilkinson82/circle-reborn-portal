-- Repair member library asset URLs from the current template export.

UPDATE public.templates
SET download_url = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663332724241/JYLdJEaFQZebZwtiasWNpQ/Construction_Estimating_Checklist_ee83b54a.pdf'
WHERE title = 'The Estimator''s Checklist';

UPDATE public.templates
SET download_url = 'https://alpcontractorcircle.com/manus-storage/ALP_Three_Silos_Framework_v3_3ba50529.pdf'
WHERE title = 'The Three Silos Framework';

UPDATE public.templates
SET download_url = 'https://alpcontractorcircle.com/manus-storage/ALP_EOS_Component_Connection_Map_0a3bdbab.pdf'
WHERE title = 'EOS Component Connection Map';

UPDATE public.templates
SET download_url = 'https://docs.google.com/document/d/1HBVZ3oyuLoRQfOJeDSPtTiPjsAN-_mpndM80G4tLmL0/copy'
WHERE title = 'Follow-Up Email Scripts (7 Scripts)';

UPDATE public.templates
SET download_url = 'https://docs.google.com/document/d/1f0KTxAAgH1qOVyLK2hESCZFXD-kzFhpzys607TUaerc/copy'
WHERE title = 'Objection Reframing Guide';

UPDATE public.templates
SET download_url = NULL,
    published = false
WHERE title = 'PM Systems Spreadsheets';

UPDATE public.templates
SET download_url = '/templates/cpm-scheduling-the-financial-weapon.pdf'
WHERE title = 'CPM Scheduling — The Financial Weapon';
