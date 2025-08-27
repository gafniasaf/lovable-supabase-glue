import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  type: 'assignment' | 'submission' | 'grade' | 'enrollment';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  entityId?: string;
  courseId?: string;
}

export const useRealTimeNotifications = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]); // Keep only 50 notifications

    // Show toast for new notifications
    toast({
      title: notification.title,
      description: notification.message,
    });
  }, [toast]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }, []);

  const clearNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user || !profile) return;

    const channels: any[] = [];

    // Listen for new assignments (students only)
    if (profile.role === 'student') {
      const assignmentsChannel = supabase
        .channel('assignments-realtime')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'assignments'
          },
          async (payload) => {
            // Check if student is enrolled in the course
            const { data: enrollment } = await supabase
              .from('enrollments')
              .select('id')
              .eq('course_id', payload.new.course_id)
              .eq('student_id', user.id)
              .single();

            if (enrollment) {
              // Get course title
              const { data: course } = await supabase
                .from('courses')
                .select('title')
                .eq('id', payload.new.course_id)
                .single();

              addNotification({
                type: 'assignment',
                title: 'New Assignment Available',
                message: `"${payload.new.title}" has been posted in ${course?.title || 'your course'}`,
                entityId: payload.new.id,
                courseId: payload.new.course_id,
              });
            }
          }
        )
        .subscribe();

      channels.push(assignmentsChannel);
    }

    // Listen for new submissions (teachers only)
    if (profile.role === 'teacher') {
      const submissionsChannel = supabase
        .channel('submissions-realtime')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'submissions'
          },
          async (payload) => {
            // Get assignment info
            const { data: assignment } = await supabase
              .from('assignments')
              .select('title, course_id')
              .eq('id', payload.new.assignment_id)
              .single();

            if (!assignment) return;

            // Get course info
            const { data: course } = await supabase
              .from('courses')
              .select('title, teacher_id')
              .eq('id', assignment.course_id)
              .single();

            // Check if this is the teacher's course
            if (course?.teacher_id === user.id) {
              // Get student name
              const { data: student } = await supabase
                .from('profiles')
                .select('first_name, last_name')
                .eq('id', payload.new.student_id)
                .single();

              const studentName = student ? 
                `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'A student' : 'A student';

              addNotification({
                type: 'submission',
                title: 'New Submission Received',
                message: `${studentName} submitted "${assignment?.title}" in ${course?.title}`,
                entityId: payload.new.id,
                courseId: assignment?.course_id,
              });
            }
          }
        )
        .subscribe();

      channels.push(submissionsChannel);
    }

    // Listen for grade updates (students only)
    if (profile.role === 'student') {
      const gradesChannel = supabase
        .channel('grades-realtime')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'submissions'
          },
          async (payload) => {
            // Check if this is the student's submission and grade was added
            if (payload.new.student_id === user.id && 
                payload.new.grade !== null && 
                payload.old.grade === null) {
              
              // Get assignment info
              const { data: assignment } = await supabase
                .from('assignments')
                .select('title, points_possible')
                .eq('id', payload.new.assignment_id)
                .single();

              addNotification({
                type: 'grade',
                title: 'Assignment Graded',
                message: `Your submission for "${assignment?.title}" has been graded: ${payload.new.grade}/${assignment?.points_possible || '?'} points`,
                entityId: payload.new.id,
              });
            }
          }
        )
        .subscribe();

      channels.push(gradesChannel);
    }

    // Listen for new enrollments (teachers only)
    if (profile.role === 'teacher') {
      const enrollmentsChannel = supabase
        .channel('enrollments-realtime')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'enrollments'
          },
          async (payload) => {
            // Get course info
            const { data: course } = await supabase
              .from('courses')
              .select('title, teacher_id')
              .eq('id', payload.new.course_id)
              .single();

            // Check if this is the teacher's course
            if (course?.teacher_id === user.id) {
              // Get student name
              const { data: student } = await supabase
                .from('profiles')
                .select('first_name, last_name')
                .eq('id', payload.new.student_id)
                .single();

              const studentName = student ? 
                `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'A student' : 'A student';

              addNotification({
                type: 'enrollment',
                title: 'New Student Enrolled',
                message: `${studentName} enrolled in your course "${course?.title}"`,
                entityId: payload.new.id,
                courseId: payload.new.course_id,
              });
            }
          }
        )
        .subscribe();

      channels.push(enrollmentsChannel);
    }

    // Cleanup function
    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, [user, profile, addNotification]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    clearNotification,
    addNotification,
  };
};