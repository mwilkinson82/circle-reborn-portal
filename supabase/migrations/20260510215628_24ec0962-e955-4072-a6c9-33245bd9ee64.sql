
-- Enums
create type public.app_role as enum ('admin', 'member', 'beta');
create type public.template_category as enum ('proposals','contracts','sales','operations','finance','estimating','contractor_circle');
create type public.subscription_status as enum ('trialing','active','past_due','canceled','incomplete');

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  company text,
  headline text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "Profiles are viewable by authenticated users"
on public.profiles for select to authenticated using (true);

create policy "Users can insert own profile"
on public.profiles for insert to authenticated with check (auth.uid() = id);

create policy "Users can update own profile"
on public.profiles for update to authenticated using (auth.uid() = id);

-- User roles
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create policy "Users can view own roles"
on public.user_roles for select to authenticated
using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));

create policy "Admins manage roles"
on public.user_roles for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- Members
create table public.members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  status subscription_status not null default 'trialing',
  plan text,
  stripe_customer_id text,
  stripe_subscription_id text,
  joined_at timestamptz not null default now(),
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);
alter table public.members enable row level security;

create policy "Members view own membership"
on public.members for select to authenticated
using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));

create policy "Admins manage members"
on public.members for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- Replays
create table public.replays (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  video_url text,
  thumbnail_url text,
  duration_minutes int,
  recorded_at timestamptz not null default now(),
  tags text[] not null default '{}',
  published boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.replays enable row level security;

create policy "Authenticated can view published replays"
on public.replays for select to authenticated
using (published = true or public.has_role(auth.uid(), 'admin'));

create policy "Admins manage replays"
on public.replays for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- Templates
create table public.templates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  long_description text,
  category template_category not null,
  file_type text not null default 'pdf',
  download_url text,
  featured boolean not null default false,
  badge text,
  pages text,
  highlights text[] not null default '{}',
  published boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.templates enable row level security;

create policy "Authenticated can view published templates"
on public.templates for select to authenticated
using (published = true or public.has_role(auth.uid(), 'admin'));

create policy "Admins manage templates"
on public.templates for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- Announcements
create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  link_url text,
  link_label text,
  pinned boolean not null default false,
  published boolean not null default true,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
alter table public.announcements enable row level security;

create policy "Authenticated can view published announcements"
on public.announcements for select to authenticated
using (published = true or public.has_role(auth.uid(), 'admin'));

create policy "Admins manage announcements"
on public.announcements for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- Auto-create profile + member row on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  insert into public.members (user_id, status) values (new.id, 'trialing');
  insert into public.user_roles (user_id, role) values (new.id, 'member');
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger profiles_updated before update on public.profiles
for each row execute function public.set_updated_at();
create trigger members_updated before update on public.members
for each row execute function public.set_updated_at();

-- Seed data
insert into public.replays (title, description, duration_minutes, recorded_at, tags, thumbnail_url) values
('How Marshall Closes a $4M Bid', 'Live walkthrough of the bid review framework Marshall used on a recent commercial pursuit.', 62, now() - interval '3 days', '{Sales,Bidding}', null),
('The 3-Silo Operating Model', 'Why every contracting business breaks at the same three points and how to architect around it.', 47, now() - interval '10 days', '{Operations,Strategy}', null),
('Estimating: From Takeoff to Margin', 'A working session on pricing labor + materials with a real GC scope.', 78, now() - interval '21 days', '{Estimating,Finance}', null),
('Q&A: Hiring a First Project Manager', 'Live member Q&A on the first PM hire — comp, ramp, and accountability.', 53, now() - interval '35 days', '{Hiring,Operations}', null);

insert into public.templates (title, description, long_description, category, file_type, featured, badge, pages, highlights) values
('Subcontractor Bid Submittal Form', 'The exact form Marshall sends to every sub on a competitive bid.', 'A 2-page submittal form that forces subs to break out scope, exclusions, and unit costs in a comparable format.', 'estimating', 'pdf', true, 'Most Used', '2 pages', '{Scope clarity,Apples-to-apples comparison,Exclusion checklist}'),
('Schedule of Values Template', 'Banker-grade SOV that gets your draws approved without a fight.', 'A line-item SOV structured around how lenders actually review pay applications.', 'finance', 'xlsx', true, 'New', '1 sheet', '{Lender-friendly format,Stored materials column,Retainage schedule}'),
('EOS-Lite Operating Playbook', 'The lightweight operating system Marshall installs at $5M-$50M GCs.', 'A condensed EOS variant tuned for construction — L10s, scorecards, and rocks built for crews and PMs.', 'operations', 'pdf', true, null, '18 pages', '{Weekly L10 agenda,KPI scorecard,Quarterly rocks template}'),
('Master Subcontract Agreement', 'A defensible MSA template with the change-order language that protects you.', 'Reviewed annually by construction counsel.', 'contracts', 'docx', false, null, '12 pages', '{Change order procedures,Indemnity clause,Pay-when-paid language}'),
('Discovery Call Script', 'The first-call framework that qualifies a project in 22 minutes.', null, 'sales', 'pdf', false, null, '4 pages', '{Budget qualification,Decision process,Next-step trial close}');

insert into public.announcements (title, body, link_url, link_label, pinned, published_at) values
('Live call this Thursday: Bid Review Bootcamp', 'Marshall is opening the floor to walk through three live member bids. Bring a current pursuit.', null, null, true, now() + interval '2 days'),
('New template added: Schedule of Values', 'Banker-grade SOV is in the library. Download from Templates → Finance.', '/portal/templates', 'Open templates', false, now() - interval '1 day'),
('Discord: #estimating channel is live', 'Working room for active estimates. Drop your scope, get a sanity check from the room.', null, null, false, now() - interval '4 days');
