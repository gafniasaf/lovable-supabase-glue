export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          author_id: string
          content: string
          course_id: string
          created_at: string
          expires_at: string | null
          id: string
          priority: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          course_id: string
          created_at?: string
          expires_at?: string | null
          id?: string
          priority?: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          course_id?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          priority?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "grade_analytics"
            referencedColumns: ["course_id"]
          },
        ]
      }
      assignments: {
        Row: {
          course_id: string
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          points_possible: number | null
          resource_files: Json | null
          title: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          points_possible?: number | null
          resource_files?: Json | null
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          points_possible?: number | null
          resource_files?: Json | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string
          created_at: string
          details: Json
          entity_id: string
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          actor_id: string
          created_at?: string
          details?: Json
          entity_id: string
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string
          created_at?: string
          details?: Json
          entity_id?: string
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          created_at: string
          description: string | null
          id: string
          teacher_id: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          teacher_id: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          teacher_id?: string
          title?: string
        }
        Relationships: []
      }
      discussion_forums: {
        Row: {
          assignment_id: string | null
          course_id: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          assignment_id?: string | null
          course_id?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          assignment_id?: string | null
          course_id?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "discussion_forums_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussion_forums_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "grade_analytics"
            referencedColumns: ["assignment_id"]
          },
          {
            foreignKeyName: "discussion_forums_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussion_forums_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "grade_analytics"
            referencedColumns: ["course_id"]
          },
        ]
      }
      discussion_posts: {
        Row: {
          author_id: string
          content: string
          created_at: string
          forum_id: string
          id: string
          parent_post_id: string | null
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          forum_id: string
          id?: string
          parent_post_id?: string | null
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          forum_id?: string
          id?: string
          parent_post_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "discussion_posts_forum_id_fkey"
            columns: ["forum_id"]
            isOneToOne: false
            referencedRelation: "discussion_forums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussion_posts_parent_post_id_fkey"
            columns: ["parent_post_id"]
            isOneToOne: false
            referencedRelation: "discussion_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          course_id: string
          enrolled_at: string
          id: string
          student_id: string
        }
        Insert: {
          course_id: string
          enrolled_at?: string
          id?: string
          student_id: string
        }
        Update: {
          course_id?: string
          enrolled_at?: string
          id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "grade_analytics"
            referencedColumns: ["course_id"]
          },
        ]
      }
      grade_history: {
        Row: {
          change_reason: string | null
          changed_at: string
          changed_by: string
          id: string
          new_feedback: string | null
          new_grade: number | null
          previous_feedback: string | null
          previous_grade: number | null
          submission_id: string
        }
        Insert: {
          change_reason?: string | null
          changed_at?: string
          changed_by: string
          id?: string
          new_feedback?: string | null
          new_grade?: number | null
          previous_feedback?: string | null
          previous_grade?: number | null
          submission_id: string
        }
        Update: {
          change_reason?: string | null
          changed_at?: string
          changed_by?: string
          id?: string
          new_feedback?: string | null
          new_grade?: number | null
          previous_feedback?: string | null
          previous_grade?: number | null
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_grade_history_submission"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          course_id: string | null
          created_at: string
          id: string
          read_at: string | null
          recipient_id: string
          sender_id: string
          subject: string | null
          thread_id: string | null
        }
        Insert: {
          content: string
          course_id?: string | null
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_id: string
          sender_id: string
          subject?: string | null
          thread_id?: string | null
        }
        Update: {
          content?: string
          course_id?: string | null
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
          subject?: string | null
          thread_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "grade_analytics"
            referencedColumns: ["course_id"]
          },
        ]
      }
      parent_links: {
        Row: {
          created_at: string
          id: string
          parent_id: string
          student_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          parent_id: string
          student_id: string
        }
        Update: {
          created_at?: string
          id?: string
          parent_id?: string
          student_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          role: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          role: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      rubric_criteria: {
        Row: {
          created_at: string
          description: string | null
          id: string
          order_index: number
          points: number
          rubric_id: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number
          points: number
          rubric_id: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number
          points?: number
          rubric_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "rubric_criteria_rubric_id_fkey"
            columns: ["rubric_id"]
            isOneToOne: false
            referencedRelation: "rubrics"
            referencedColumns: ["id"]
          },
        ]
      }
      rubric_grades: {
        Row: {
          criterion_id: string
          feedback: string | null
          graded_at: string
          graded_by: string
          id: string
          points_earned: number
          submission_id: string
        }
        Insert: {
          criterion_id: string
          feedback?: string | null
          graded_at?: string
          graded_by: string
          id?: string
          points_earned?: number
          submission_id: string
        }
        Update: {
          criterion_id?: string
          feedback?: string | null
          graded_at?: string
          graded_by?: string
          id?: string
          points_earned?: number
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rubric_grades_criterion_id_fkey"
            columns: ["criterion_id"]
            isOneToOne: false
            referencedRelation: "rubric_criteria"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rubric_grades_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      rubrics: {
        Row: {
          assignment_id: string
          created_at: string
          description: string | null
          id: string
          title: string
          total_points: number
          updated_at: string
        }
        Insert: {
          assignment_id: string
          created_at?: string
          description?: string | null
          id?: string
          title: string
          total_points?: number
          updated_at?: string
        }
        Update: {
          assignment_id?: string
          created_at?: string
          description?: string | null
          id?: string
          title?: string
          total_points?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rubrics_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rubrics_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "grade_analytics"
            referencedColumns: ["assignment_id"]
          },
        ]
      }
      submissions: {
        Row: {
          assignment_id: string
          auto_save_timestamp: string | null
          content: string | null
          draft_content: string | null
          extra_credit_points: number | null
          feedback: string | null
          file_attachments: Json | null
          grade: number | null
          grade_comments: string | null
          grade_override: boolean | null
          grade_scale: string | null
          graded_at: string | null
          graded_by: string | null
          id: string
          late_penalty_applied: number | null
          student_id: string
          submission_version: number | null
          submitted_at: string
          time_spent_grading: number | null
        }
        Insert: {
          assignment_id: string
          auto_save_timestamp?: string | null
          content?: string | null
          draft_content?: string | null
          extra_credit_points?: number | null
          feedback?: string | null
          file_attachments?: Json | null
          grade?: number | null
          grade_comments?: string | null
          grade_override?: boolean | null
          grade_scale?: string | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          late_penalty_applied?: number | null
          student_id: string
          submission_version?: number | null
          submitted_at?: string
          time_spent_grading?: number | null
        }
        Update: {
          assignment_id?: string
          auto_save_timestamp?: string | null
          content?: string | null
          draft_content?: string | null
          extra_credit_points?: number | null
          feedback?: string | null
          file_attachments?: Json | null
          grade?: number | null
          grade_comments?: string | null
          grade_override?: boolean | null
          grade_scale?: string | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          late_penalty_applied?: number | null
          student_id?: string
          submission_version?: number | null
          submitted_at?: string
          time_spent_grading?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      grade_analytics: {
        Row: {
          assignment_id: string | null
          assignment_title: string | null
          average_grade: number | null
          avg_grading_time: number | null
          course_id: string | null
          course_title: string | null
          grade_stddev: number | null
          graded_submissions: number | null
          late_submissions: number | null
          max_grade: number | null
          min_grade: number | null
          points_possible: number | null
          teacher_id: string | null
          total_submissions: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      dev_upsert_user_with_role: {
        Args: { p_email: string; p_password: string; p_role: string }
        Returns: string
      }
      get_grade_statistics: {
        Args: { assignment_uuid: string }
        Returns: {
          average_grade: number
          completion_rate: number
          grade_distribution: Json
          graded_submissions: number
          median_grade: number
          total_submissions: number
        }[]
      }
      get_user_role: {
        Args: { user_uuid: string }
        Returns: string
      }
      is_course_student: {
        Args: { course_uuid: string; user_uuid: string }
        Returns: boolean
      }
      is_course_teacher: {
        Args: { course_uuid: string; user_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
