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
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'grade_analytics' AND policyname = 'admin_analytics_modification') THEN
    DROP POLICY "admin_analytics_modification" ON public.grade_analytics;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'grade_analytics' AND policyname = 'system_analytics_management') THEN
    DROP POLICY "system_analytics_management" ON public.grade_analytics;
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

-- Policy 3: Only admins can modify analytics data
CREATE POLICY "admin_analytics_modification" ON public.grade_analytics
  FOR INSERT, UPDATE, DELETE
  TO authenticated
  USING (get_user_role(auth.uid()) = 'admin')
  WITH CHECK (get_user_role(auth.uid()) = 'admin');