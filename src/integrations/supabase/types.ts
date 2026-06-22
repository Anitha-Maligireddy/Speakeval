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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      career_readiness_scores: {
        Row: {
          created_at: string
          id: string
          insights: string | null
          interview_avg: number | null
          level: string
          overall_score: number
          resume_score: number | null
          scenario_avg: number | null
          speaking_avg: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          insights?: string | null
          interview_avg?: number | null
          level: string
          overall_score: number
          resume_score?: number | null
          scenario_avg?: number | null
          speaking_avg?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          insights?: string | null
          interview_avg?: number | null
          level?: string
          overall_score?: number
          resume_score?: number | null
          scenario_avg?: number | null
          speaking_avg?: number | null
          user_id?: string
        }
        Relationships: []
      }
      daily_challenges: {
        Row: {
          challenge_date: string
          completed: boolean
          created_at: string
          id: string
          points_awarded: number | null
          response: string | null
          score: number | null
          topic: string
          user_id: string
        }
        Insert: {
          challenge_date?: string
          completed?: boolean
          created_at?: string
          id?: string
          points_awarded?: number | null
          response?: string | null
          score?: number | null
          topic: string
          user_id: string
        }
        Update: {
          challenge_date?: string
          completed?: boolean
          created_at?: string
          id?: string
          points_awarded?: number | null
          response?: string | null
          score?: number | null
          topic?: string
          user_id?: string
        }
        Relationships: []
      }
      improvement_plans: {
        Row: {
          completed_tasks: number | null
          created_at: string
          id: string
          recommendations: string[] | null
          tasks: Json | null
          total_tasks: number | null
          updated_at: string
          user_id: string
          weak_areas: string[] | null
        }
        Insert: {
          completed_tasks?: number | null
          created_at?: string
          id?: string
          recommendations?: string[] | null
          tasks?: Json | null
          total_tasks?: number | null
          updated_at?: string
          user_id: string
          weak_areas?: string[] | null
        }
        Update: {
          completed_tasks?: number | null
          created_at?: string
          id?: string
          recommendations?: string[] | null
          tasks?: Json | null
          total_tasks?: number | null
          updated_at?: string
          user_id?: string
          weak_areas?: string[] | null
        }
        Relationships: []
      }
      interview_assessments: {
        Row: {
          answer: string | null
          answer_quality_score: number | null
          category: string
          communication_score: number | null
          confidence_score: number | null
          created_at: string
          feedback: string | null
          id: string
          overall_score: number | null
          professionalism_score: number | null
          question: string
          response_mode: string | null
          strengths: string[] | null
          structure_score: number | null
          suggestions: string[] | null
          user_id: string
          weaknesses: string[] | null
        }
        Insert: {
          answer?: string | null
          answer_quality_score?: number | null
          category: string
          communication_score?: number | null
          confidence_score?: number | null
          created_at?: string
          feedback?: string | null
          id?: string
          overall_score?: number | null
          professionalism_score?: number | null
          question: string
          response_mode?: string | null
          strengths?: string[] | null
          structure_score?: number | null
          suggestions?: string[] | null
          user_id: string
          weaknesses?: string[] | null
        }
        Update: {
          answer?: string | null
          answer_quality_score?: number | null
          category?: string
          communication_score?: number | null
          confidence_score?: number | null
          created_at?: string
          feedback?: string | null
          id?: string
          overall_score?: number | null
          professionalism_score?: number | null
          question?: string
          response_mode?: string | null
          strengths?: string[] | null
          structure_score?: number | null
          suggestions?: string[] | null
          user_id?: string
          weaknesses?: string[] | null
        }
        Relationships: []
      }
      mentor_chats: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      resume_assessments: {
        Row: {
          ats_score: number | null
          certifications: string[] | null
          created_at: string
          experience_summary: string | null
          extracted_text: string | null
          feedback: string | null
          file_name: string | null
          file_path: string | null
          formatting_score: number | null
          id: string
          overall_score: number | null
          projects_detected: string[] | null
          projects_score: number | null
          skills_score: number | null
          soft_skills: string[] | null
          strengths: string[] | null
          structure_score: number | null
          suggestions: string[] | null
          summary_score: number | null
          technical_skills: string[] | null
          user_id: string
          weaknesses: string[] | null
        }
        Insert: {
          ats_score?: number | null
          certifications?: string[] | null
          created_at?: string
          experience_summary?: string | null
          extracted_text?: string | null
          feedback?: string | null
          file_name?: string | null
          file_path?: string | null
          formatting_score?: number | null
          id?: string
          overall_score?: number | null
          projects_detected?: string[] | null
          projects_score?: number | null
          skills_score?: number | null
          soft_skills?: string[] | null
          strengths?: string[] | null
          structure_score?: number | null
          suggestions?: string[] | null
          summary_score?: number | null
          technical_skills?: string[] | null
          user_id: string
          weaknesses?: string[] | null
        }
        Update: {
          ats_score?: number | null
          certifications?: string[] | null
          created_at?: string
          experience_summary?: string | null
          extracted_text?: string | null
          feedback?: string | null
          file_name?: string | null
          file_path?: string | null
          formatting_score?: number | null
          id?: string
          overall_score?: number | null
          projects_detected?: string[] | null
          projects_score?: number | null
          skills_score?: number | null
          soft_skills?: string[] | null
          strengths?: string[] | null
          structure_score?: number | null
          suggestions?: string[] | null
          summary_score?: number | null
          technical_skills?: string[] | null
          user_id?: string
          weaknesses?: string[] | null
        }
        Relationships: []
      }
      scenario_assessments: {
        Row: {
          clarity_score: number | null
          communication_score: number | null
          created_at: string
          emotional_intelligence_score: number | null
          feedback: string | null
          id: string
          overall_score: number | null
          problem_solving_score: number | null
          professionalism_score: number | null
          response: string | null
          response_mode: string | null
          scenario: string
          strengths: string[] | null
          suggestions: string[] | null
          user_id: string
          weaknesses: string[] | null
        }
        Insert: {
          clarity_score?: number | null
          communication_score?: number | null
          created_at?: string
          emotional_intelligence_score?: number | null
          feedback?: string | null
          id?: string
          overall_score?: number | null
          problem_solving_score?: number | null
          professionalism_score?: number | null
          response?: string | null
          response_mode?: string | null
          scenario: string
          strengths?: string[] | null
          suggestions?: string[] | null
          user_id: string
          weaknesses?: string[] | null
        }
        Update: {
          clarity_score?: number | null
          communication_score?: number | null
          created_at?: string
          emotional_intelligence_score?: number | null
          feedback?: string | null
          id?: string
          overall_score?: number | null
          problem_solving_score?: number | null
          professionalism_score?: number | null
          response?: string | null
          response_mode?: string | null
          scenario?: string
          strengths?: string[] | null
          suggestions?: string[] | null
          user_id?: string
          weaknesses?: string[] | null
        }
        Relationships: []
      }
      speaking_assessments: {
        Row: {
          clarity_score: number | null
          confidence_score: number | null
          created_at: string
          duration_seconds: number | null
          feedback: string | null
          fluency_score: number | null
          grammar_score: number | null
          id: string
          overall_score: number | null
          relevance_score: number | null
          strengths: string[] | null
          suggestions: string[] | null
          topic: string
          transcript: string | null
          user_id: string
          vocabulary_score: number | null
          weaknesses: string[] | null
        }
        Insert: {
          clarity_score?: number | null
          confidence_score?: number | null
          created_at?: string
          duration_seconds?: number | null
          feedback?: string | null
          fluency_score?: number | null
          grammar_score?: number | null
          id?: string
          overall_score?: number | null
          relevance_score?: number | null
          strengths?: string[] | null
          suggestions?: string[] | null
          topic: string
          transcript?: string | null
          user_id: string
          vocabulary_score?: number | null
          weaknesses?: string[] | null
        }
        Update: {
          clarity_score?: number | null
          confidence_score?: number | null
          created_at?: string
          duration_seconds?: number | null
          feedback?: string | null
          fluency_score?: number | null
          grammar_score?: number | null
          id?: string
          overall_score?: number | null
          relevance_score?: number | null
          strengths?: string[] | null
          suggestions?: string[] | null
          topic?: string
          transcript?: string | null
          user_id?: string
          vocabulary_score?: number | null
          weaknesses?: string[] | null
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          current_streak: number
          last_activity_date: string | null
          longest_streak: number
          total_assessments: number
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          current_streak?: number
          last_activity_date?: string | null
          longest_streak?: number
          total_assessments?: number
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          current_streak?: number
          last_activity_date?: string | null
          longest_streak?: number
          total_assessments?: number
          total_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
