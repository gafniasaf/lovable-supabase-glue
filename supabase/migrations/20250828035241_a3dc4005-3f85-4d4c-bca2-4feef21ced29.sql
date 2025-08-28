-- Secure the grade_analytics view by converting it to a table with proper RLS
-- This ensures we can apply granular access control to sensitive academic data

-- First, drop the existing view
DROP VIEW IF EXISTS public.grade_analytics;

-- Create a materialized view as a table with proper structure
CREATE TABLE public.grade_analytics (
  course_id uuid,
  course_title text,
  teacher_id uuid,
  assignment_id uuid,
  assignment_title text,
  points_possible integer,
  total_submissions bigint,
  graded_submissions bigint,
  average_grade numeric,
  min_grade integer,
  max_grade integer,
  grade_stddev numeric,
  late_submissions bigint,
  avg_grading_time numeric,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on the table
ALTER TABLE public.grade_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for secure access control
-- Teachers can only view analytics for their own courses
CREATE POLICY "teachers_own_course_analytics" ON public.grade_analytics
  FOR SELECT 
  TO authenticated
  USING (teacher_id = auth.uid());

-- Admins can view all analytics
CREATE POLICY "admin_all_analytics_access" ON public.grade_analytics
  FOR SELECT 
  TO authenticated
  USING (get_user_role(auth.uid()) = 'admin');

-- System can insert/update analytics data (for background jobs)
CREATE POLICY "system_analytics_management" ON public.grade_analytics
  FOR ALL
  TO authenticated
  USING (get_user_role(auth.uid()) IN ('admin', 'system'));

-- Create a function to refresh the analytics data
CREATE OR REPLACE FUNCTION public.refresh_grade_analytics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Clear existing data
  TRUNCATE public.grade_analytics;
  
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
  
  -- Update the timestamp
  UPDATE public.grade_analytics SET updated_at = now();
END;
$$;

-- Initial population of analytics data
SELECT public.refresh_grade_analytics();