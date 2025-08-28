-- Fix the SECURITY DEFINER view issue by recreating the grade_analytics view without SECURITY DEFINER
-- This ensures proper RLS enforcement for each user rather than the view creator

-- Drop the existing view first
DROP VIEW IF EXISTS public.grade_analytics;

-- Recreate the view without SECURITY DEFINER (uses SECURITY INVOKER by default)
CREATE VIEW public.grade_analytics AS 
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
FROM ((courses c
  LEFT JOIN assignments a ON ((c.id = a.course_id)))
  LEFT JOIN submissions s ON ((a.id = s.assignment_id)))
GROUP BY c.id, c.title, c.teacher_id, a.id, a.title, a.points_possible;

-- Enable RLS on the view to ensure proper access control
ALTER VIEW public.grade_analytics SET (security_barrier = true);

-- Create RLS policies for the view to ensure proper access control
CREATE POLICY "grade_analytics_teacher_access" ON public.grade_analytics
  FOR SELECT 
  USING (teacher_id = auth.uid());

CREATE POLICY "grade_analytics_admin_access" ON public.grade_analytics
  FOR SELECT 
  USING (get_user_role(auth.uid()) = 'admin');