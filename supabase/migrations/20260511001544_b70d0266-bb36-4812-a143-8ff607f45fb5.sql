DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Members view own membership" ON public.members;
DROP POLICY IF EXISTS "Admins manage members" ON public.members;
CREATE POLICY "Members view own membership"
ON public.members
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'::public.app_role
  )
);

DROP POLICY IF EXISTS "Authenticated can view published announcements" ON public.announcements;
DROP POLICY IF EXISTS "Admins manage announcements" ON public.announcements;
CREATE POLICY "Authenticated can view published announcements"
ON public.announcements
FOR SELECT
TO authenticated
USING (
  published = true
  OR EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'::public.app_role
  )
);

DROP POLICY IF EXISTS "Authenticated can view published replays" ON public.replays;
DROP POLICY IF EXISTS "Admins manage replays" ON public.replays;
CREATE POLICY "Authenticated can view published replays"
ON public.replays
FOR SELECT
TO authenticated
USING (
  published = true
  OR EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'::public.app_role
  )
);

DROP POLICY IF EXISTS "Authenticated can view published templates" ON public.templates;
DROP POLICY IF EXISTS "Admins manage templates" ON public.templates;
CREATE POLICY "Authenticated can view published templates"
ON public.templates
FOR SELECT
TO authenticated
USING (
  published = true
  OR EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'::public.app_role
  )
);

DROP POLICY IF EXISTS "Admins read leads" ON public.leads;
DROP POLICY IF EXISTS "Admins manage leads" ON public.leads;
CREATE POLICY "Admins read leads"
ON public.leads
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'::public.app_role
  )
);

DROP POLICY IF EXISTS "Users view own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins manage subscriptions" ON public.subscriptions;
CREATE POLICY "Users view own subscriptions"
ON public.subscriptions
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'::public.app_role
  )
);

DROP POLICY IF EXISTS "Admins manage pending_claims" ON public.pending_claims;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON SCHEMA private FROM authenticated;
REVOKE ALL ON FUNCTION public.has_active_subscription(uuid) FROM PUBLIC, anon, authenticated;