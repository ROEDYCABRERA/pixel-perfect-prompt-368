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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          completion_notes: string
          instructions: string
          objective: string
          post_id: string
        }
        Insert: {
          completion_notes?: string
          instructions?: string
          objective?: string
          post_id: string
        }
        Update: {
          completion_notes?: string
          instructions?: string
          objective?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      answer_options: {
        Row: {
          id: string
          is_correct: boolean
          position: number
          question_id: string
          text: string
        }
        Insert: {
          id?: string
          is_correct?: boolean
          position?: number
          question_id: string
          text: string
        }
        Update: {
          id?: string
          is_correct?: boolean
          position?: number
          question_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "answer_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          type: Database["public"]["Enums"]["post_type"] | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          type?: Database["public"]["Enums"]["post_type"] | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          type?: Database["public"]["Enums"]["post_type"] | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          subject?: string
        }
        Relationships: []
      }
      evaluations: {
        Row: {
          instructions: string
          passing_score: number
          post_id: string
        }
        Insert: {
          instructions?: string
          passing_score?: number
          post_id: string
        }
        Update: {
          instructions?: string
          passing_score?: number
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          activities: string[]
          comprehension_questions: string[]
          duration_minutes: number
          examples: string[]
          introduction: string
          number: number
          objectives: string[]
          post_id: string
          subtopics: Json
        }
        Insert: {
          activities?: string[]
          comprehension_questions?: string[]
          duration_minutes?: number
          examples?: string[]
          introduction?: string
          number?: number
          objectives?: string[]
          post_id: string
          subtopics?: Json
        }
        Update: {
          activities?: string[]
          comprehension_questions?: string[]
          duration_minutes?: number
          examples?: string[]
          introduction?: string
          number?: number
          objectives?: string[]
          post_id?: string
          subtopics?: Json
        }
        Relationships: [
          {
            foreignKeyName: "lessons_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      podcasts: {
        Row: {
          audio_format: string | null
          audio_path: string | null
          audio_url: string | null
          cover_url: string | null
          created_at: string
          description: string
          duration_seconds: number
          episode_name: string
          episode_number: number
          id: string
          published_at: string | null
          slug: string
          status: Database["public"]["Enums"]["publish_status"]
          title: string
          updated_at: string
        }
        Insert: {
          audio_format?: string | null
          audio_path?: string | null
          audio_url?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string
          duration_seconds?: number
          episode_name?: string
          episode_number?: number
          id?: string
          published_at?: string | null
          slug: string
          status?: Database["public"]["Enums"]["publish_status"]
          title: string
          updated_at?: string
        }
        Update: {
          audio_format?: string | null
          audio_path?: string | null
          audio_url?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string
          duration_seconds?: number
          episode_name?: string
          episode_number?: number
          id?: string
          published_at?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["publish_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          body: string
          category_id: string | null
          cover_url: string | null
          created_at: string
          id: string
          position: number
          published_at: string | null
          slug: string
          status: Database["public"]["Enums"]["publish_status"]
          summary: string
          title: string
          type: Database["public"]["Enums"]["post_type"]
          updated_at: string
        }
        Insert: {
          body?: string
          category_id?: string | null
          cover_url?: string | null
          created_at?: string
          id?: string
          position?: number
          published_at?: string | null
          slug: string
          status?: Database["public"]["Enums"]["publish_status"]
          summary?: string
          title: string
          type: Database["public"]["Enums"]["post_type"]
          updated_at?: string
        }
        Update: {
          body?: string
          category_id?: string | null
          cover_url?: string | null
          created_at?: string
          id?: string
          position?: number
          published_at?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["publish_status"]
          summary?: string
          title?: string
          type?: Database["public"]["Enums"]["post_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          created_at: string
          feedback: string
          id: string
          position: number
          post_id: string
          prompt: string
        }
        Insert: {
          created_at?: string
          feedback?: string
          id?: string
          position?: number
          post_id: string
          prompt: string
        }
        Update: {
          created_at?: string
          feedback?: string
          id?: string
          position?: number
          post_id?: string
          prompt?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          external_url: string | null
          file_name: string | null
          file_url: string | null
          post_id: string
          resource_format: string
        }
        Insert: {
          external_url?: string | null
          file_name?: string | null
          file_url?: string | null
          post_id: string
          resource_format?: string
        }
        Update: {
          external_url?: string | null
          file_name?: string | null
          file_url?: string | null
          post_id?: string
          resource_format?: string
        }
        Relationships: [
          {
            foreignKeyName: "resources_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      simulators: {
        Row: {
          access_url: string | null
          builtin: string | null
          embed_url: string | null
          features: string[]
          instructions: string
          objectives: string[]
          post_id: string
          practice_activity: string
          reflection_questions: string[]
        }
        Insert: {
          access_url?: string | null
          builtin?: string | null
          embed_url?: string | null
          features?: string[]
          instructions?: string
          objectives?: string[]
          post_id: string
          practice_activity?: string
          reflection_questions?: string[]
        }
        Update: {
          access_url?: string | null
          builtin?: string | null
          embed_url?: string | null
          features?: string[]
          instructions?: string
          objectives?: string[]
          post_id?: string
          practice_activity?: string
          reflection_questions?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "simulators_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      software: {
        Row: {
          educational_use: string
          features: string[]
          install_instructions: string
          official_url: string | null
          platforms: string
          post_id: string
          practice_activity: string
          usage_instructions: string
        }
        Insert: {
          educational_use?: string
          features?: string[]
          install_instructions?: string
          official_url?: string | null
          platforms?: string
          post_id: string
          practice_activity?: string
          usage_instructions?: string
        }
        Update: {
          educational_use?: string
          features?: string[]
          install_instructions?: string
          official_url?: string | null
          platforms?: string
          post_id?: string
          practice_activity?: string
          usage_instructions?: string
        }
        Relationships: [
          {
            foreignKeyName: "software_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      videos: {
        Row: {
          comprehension_questions: string[]
          duration: string
          post_id: string
          video_file_url: string | null
          video_url: string | null
        }
        Insert: {
          comprehension_questions?: string[]
          duration?: string
          post_id: string
          video_file_url?: string | null
          video_url?: string | null
        }
        Update: {
          comprehension_questions?: string[]
          duration?: string
          post_id?: string
          video_file_url?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "videos_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_exists: { Args: never; Returns: boolean }
      admin_get_questions: { Args: { _post_id: string }; Returns: Json }
      admin_save_questions: {
        Args: { _post_id: string; _questions: Json }
        Returns: undefined
      }
      grade_answers: {
        Args: { _answers: Json; _post_id: string }
        Returns: Json
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      post_is_published: { Args: { _post_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin"
      post_type:
        | "lesson"
        | "resource"
        | "video"
        | "software"
        | "simulator"
        | "activity"
        | "evaluation"
      publish_status: "draft" | "published" | "withdrawn"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin"],
      post_type: [
        "lesson",
        "resource",
        "video",
        "software",
        "simulator",
        "activity",
        "evaluation",
      ],
      publish_status: ["draft", "published", "withdrawn"],
    },
  },
} as const
