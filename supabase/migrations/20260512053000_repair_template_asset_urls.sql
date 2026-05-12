-- Repair member library asset URLs from the current template export and old portal file storage.

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
SET download_url = 'https://drive.google.com/drive/folders/1Kl3c8oVS8K-BnQmy5G-M1dJ4k7X7Zghw?usp=sharing'
WHERE download_url LIKE 'https://drive.google.com/file/%/copy';
