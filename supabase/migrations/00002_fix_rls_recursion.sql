-- Fix infinite recursion in RLS policies by using a SECURITY DEFINER function

-- 1. Create a function that bypasses RLS to get the user's role
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS user_role
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;

-- 2. Drop the existing recursive policies
DROP POLICY IF EXISTS "Admins and teachers can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Admins and teachers can manage exams" ON public.exams;
DROP POLICY IF EXISTS "Admins and teachers can manage questions" ON public.questions;
DROP POLICY IF EXISTS "Teachers and admins can view all answers" ON public.answers;
DROP POLICY IF EXISTS "Teachers and admins can view audit logs" ON public.audit_logs;

-- 3. Recreate them using the safe function
CREATE POLICY "Admins and teachers can view all profiles"
  ON public.users FOR SELECT
  USING (public.get_auth_role() IN ('admin', 'teacher'));

CREATE POLICY "Admins and teachers can manage exams"
  ON public.exams FOR ALL
  USING (public.get_auth_role() IN ('admin', 'teacher'));

CREATE POLICY "Admins and teachers can manage questions"
  ON public.questions FOR ALL
  USING (public.get_auth_role() IN ('admin', 'teacher'));

CREATE POLICY "Teachers and admins can view all answers"
  ON public.answers FOR SELECT
  USING (public.get_auth_role() IN ('admin', 'teacher'));

CREATE POLICY "Teachers and admins can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.get_auth_role() IN ('admin', 'teacher'));
