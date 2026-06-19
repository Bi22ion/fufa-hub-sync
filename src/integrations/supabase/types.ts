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
      blog_posts: {
        Row: {
          author: string | null
          body: string | null
          created_at: string
          excerpt: string | null
          hero: string | null
          id: string
          published: boolean
          published_at: string
          slug: string
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          body?: string | null
          created_at?: string
          excerpt?: string | null
          hero?: string | null
          id?: string
          published?: boolean
          published_at?: string
          slug: string
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          body?: string | null
          created_at?: string
          excerpt?: string | null
          hero?: string | null
          id?: string
          published?: boolean
          published_at?: string
          slug?: string
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      competitions: {
        Row: {
          color: string
          description: string | null
          id: string
          name: string
          season: string | null
          short: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          color?: string
          description?: string | null
          id?: string
          name: string
          season?: string | null
          short: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          color?: string
          description?: string | null
          id?: string
          name?: string
          season?: string | null
          short?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      live_streams: {
        Row: {
          category: string | null
          id: string
          is_active: boolean
          is_auto: boolean
          is_fallback: boolean
          label: string
          priority: number
          source_type: string
          updated_at: string
          url: string
        }
        Insert: {
          category?: string | null
          id?: string
          is_active?: boolean
          is_auto?: boolean
          is_fallback?: boolean
          label: string
          priority?: number
          source_type?: string
          updated_at?: string
          url: string
        }
        Update: {
          category?: string | null
          id?: string
          is_active?: boolean
          is_auto?: boolean
          is_fallback?: boolean
          label?: string
          priority?: number
          source_type?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          away: string
          away_score: number
          competition_slug: string
          home: string
          home_score: number
          id: string
          kickoff: string
          status: string
          updated_at: string
          venue: string | null
        }
        Insert: {
          away: string
          away_score?: number
          competition_slug: string
          home: string
          home_score?: number
          id?: string
          kickoff: string
          status?: string
          updated_at?: string
          venue?: string | null
        }
        Update: {
          away?: string
          away_score?: number
          competition_slug?: string
          home?: string
          home_score?: number
          id?: string
          kickoff?: string
          status?: string
          updated_at?: string
          venue?: string | null
        }
        Relationships: []
      }
      news: {
        Row: {
          body: string | null
          excerpt: string | null
          hero: string | null
          id: string
          published_at: string
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          excerpt?: string | null
          hero?: string | null
          id?: string
          published_at?: string
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          excerpt?: string | null
          hero?: string | null
          id?: string
          published_at?: string
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      programs: {
        Row: {
          competition_slug: string | null
          description: string | null
          end_time: string
          id: string
          match_id: string | null
          start_time: string
          stream_id: string | null
          thumbnail: string | null
          title: string
          type: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          competition_slug?: string | null
          description?: string | null
          end_time: string
          id?: string
          match_id?: string | null
          start_time: string
          stream_id?: string | null
          thumbnail?: string | null
          title: string
          type?: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          competition_slug?: string | null
          description?: string | null
          end_time?: string
          id?: string
          match_id?: string | null
          start_time?: string
          stream_id?: string | null
          thumbnail?: string | null
          title?: string
          type?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "programs_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "programs_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "live_streams"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      ticker_headlines: {
        Row: {
          id: string
          is_active: boolean
          sort_order: number
          text: string
          updated_at: string
        }
        Insert: {
          id?: string
          is_active?: boolean
          sort_order?: number
          text: string
          updated_at?: string
        }
        Update: {
          id?: string
          is_active?: boolean
          sort_order?: number
          text?: string
          updated_at?: string
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
          role: Database["public"]["Enums"]["app_role"]
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
      videos: {
        Row: {
          competition_slug: string | null
          duration: string | null
          id: string
          published_at: string
          sort_order: number
          thumbnail: string | null
          title: string
          updated_at: string
          youtube_id: string
        }
        Insert: {
          competition_slug?: string | null
          duration?: string | null
          id?: string
          published_at?: string
          sort_order?: number
          thumbnail?: string | null
          title: string
          updated_at?: string
          youtube_id: string
        }
        Update: {
          competition_slug?: string | null
          duration?: string | null
          id?: string
          published_at?: string
          sort_order?: number
          thumbnail?: string | null
          title?: string
          updated_at?: string
          youtube_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      any_admin_exists: { Args: never; Returns: boolean }
      claim_first_admin: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
