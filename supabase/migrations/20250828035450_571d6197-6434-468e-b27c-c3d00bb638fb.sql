-- Secure the grade_analytics table with proper RLS policies
-- This ensures sensitive academic data is only accessible to authorized users

-- First, check if the table has RLS enabled and enable it if not
ALTER TABLE public.grade_analytics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "teachers_own_course_analytics" ON public.grade_analytics;
DROP POLICY IF EXISTS "admin_all_analytics_access" ON public.grade_analytics;
DROP POLICY IF EXISTS "system_analytics_management" ON public.grade_analytics;

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

-- Policy 3: Restrict insert/update/delete to admin users only
CREATE POLICY "admin_analytics_modification" ON public.grade_analytics
  FOR ALL
  TO authenticated
  USING (get_user_role(auth.uid()) = 'admin')
  WITH CHECK (get_user_role(auth.uid()) = 'admin');

-- Create a function to refresh the analytics data (admin only)
CREATE OR REPLACE FUNCTION public.refresh_grade_analytics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Security check: only admins can refresh analytics
  IF get_user_role(auth.uid()) != 'admin' THEN
    RAISE EXCEPTION 'Access denied. Only administrators can refresh analytics data.';
  END IF;
  
  -- Clear existing data
  DELETE FROM public.grade_analytics;
  
  -- Insert fresh analytics data
  INSERT INTO public.grade_analytics (
    course_id, course_title, teacher_id, assignment_id, assignment_title, 
    points_possible, total_submissions, graded_submissions, average_grade,
    min_grade, max_grade, grade_stddev, late_submissions, avg_grading_time
  )
  SELECT 
    c.id AS course_id,
    c.title AS course_title,
    c.teacher_id,
    a.id AS assignment_id,
    a.title AS assignment_title,
    a.points_possible,
    count(s.id) AS total_submissions,
    count(
      CASE
        WHEN (s.grade IS NOT NULL) THEN 1
        ELSE NULL::integer
      END) AS graded_submissions,
    avg(s.grade) AS average_grade,
    min(s.grade) AS min_grade,
    max(s.grade) AS max_grade,
    stddev(s.grade) AS grade_stddev,
    count(
      CASE
        WHEN (s.submitted_at > a.due_date) THEN 1
        ELSE NULL::integer
      END) AS late_submissions,
    avg(
      CASE
        WHEN (s.grade IS NOT NULL) THEN s.time_spent_grading
        ELSE NULL::integer
      END) AS avg_grading_time
  FROM courses c
    LEFT JOIN assignments a ON c.id = a.course_id
    LEFT JOIN submissions s ON a.id = s.assignment_id
  GROUP BY c.id, c.title, c.teacher_id, a.id, a.title, a.points_possible;
END;
$$;