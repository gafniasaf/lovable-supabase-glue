-- Secure the grade_analytics table with proper RLS policies
-- This ensures sensitive academic data is only accessible to authorized users

-- Enable RLS on the table (safe to run multiple times)
ALTER TABLE public.grade_analytics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies completely to ensure clean state
DO $$ 
BEGIN
  -- Drop each policy if it exists
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'grade_analytics' AND policyname = 'teachers_own_course_analytics') THEN
    DROP POLICY "teachers_own_course_analytics" ON public.grade_analytics;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'grade_analytics' AND policyname = 'admin_all_analytics_access') THEN
    DROP POLICY "admin_all_analytics_access" ON public.grade_analytics;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'grade_analytics' AND policyname = 'admin_analytics_insert') THEN
    DROP POLICY "admin_analytics_insert" ON public.grade_analytics;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'grade_analytics' AND policyname = 'admin_analytics_update') THEN
    DROP POLICY "admin_analytics_update" ON public.grade_analytics;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'grade_analytics' AND policyname = 'admin_analytics_delete') THEN
    DROP POLICY "admin_analytics_delete" ON public.grade_analytics;
  END IF;
END $$;

-- Create secure RLS policies for grade analytics access

-- Policy 1: Teachers can only view analytics for courses they teach
CREATE POLICY "teachers_own_course_analytics" ON public.grade_analytics
  FOR SELECT 
  TO authenticated
  USING (teacher_id = auth.uid());

-- Policy 2: Admins can view all analytics data
CREATE POLICY "admin_all_analytics_access" ON public.grade_analytics
  FOR SELECT 
  TO authenticated
  USING (get_user_role(auth.uid()) = 'admin');

-- Policy 3: Only admins can insert analytics data
CREATE POLICY "admin_analytics_insert" ON public.grade_analytics
  FOR INSERT
  TO authenticated
  WITH CHECK (get_user_role(auth.uid()) = 'admin');

-- Policy 4: Only admins can update analytics data
CREATE POLICY "admin_analytics_update" ON public.grade_analytics
  FOR UPDATE
  TO authenticated
  USING (get_user_role(auth.uid()) = 'admin')
  WITH CHECK (get_user_role(auth.uid()) = 'admin');

-- Policy 5: Only admins can delete analytics data
CREATE POLICY "admin_analytics_delete" ON public.grade_analytics
  FOR DELETE
  TO authenticated
  USING (get_user_role(auth.uid()) = 'admin');