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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      apartments: {
        Row: {
          area: number
          complex_id: string | null
          created_at: string
          floor: number | null
          id: string
          is_available: boolean | null
          layout_url: string | null
          price: number
          price_per_sqm: number | null
          rooms: number
          total_floors: number | null
        }
        Insert: {
          area: number
          complex_id?: string | null
          created_at?: string
          floor?: number | null
          id?: string
          is_available?: boolean | null
          layout_url?: string | null
          price: number
          price_per_sqm?: number | null
          rooms: number
          total_floors?: number | null
        }
        Update: {
          area?: number
          complex_id?: string | null
          created_at?: string
          floor?: number | null
          id?: string
          is_available?: boolean | null
          layout_url?: string | null
          price?: number
          price_per_sqm?: number | null
          rooms?: number
          total_floors?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "apartments_complex_id_fkey"
            columns: ["complex_id"]
            isOneToOne: false
            referencedRelation: "residential_complexes"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      collection_items: {
        Row: {
          collection_id: string | null
          complex_id: string | null
          created_at: string
          id: string
        }
        Insert: {
          collection_id?: string | null
          complex_id?: string | null
          created_at?: string
          id?: string
        }
        Update: {
          collection_id?: string | null
          complex_id?: string | null
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_items_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_items_complex_id_fkey"
            columns: ["complex_id"]
            isOneToOne: false
            referencedRelation: "residential_complexes"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      developers: {
        Row: {
          city_id: string | null
          created_at: string
          description: string | null
          id: string
          logo_url: string | null
          name: string
          projects_count: number | null
          rating: number | null
          slug: string
          years_on_market: number | null
        }
        Insert: {
          city_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          projects_count?: number | null
          rating?: number | null
          slug: string
          years_on_market?: number | null
        }
        Update: {
          city_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          projects_count?: number | null
          rating?: number | null
          slug?: string
          years_on_market?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "developers_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          apartment_id: string | null
          complex_id: string | null
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          apartment_id?: string | null
          complex_id?: string | null
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          apartment_id?: string | null
          complex_id?: string | null
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_apartment_id_fkey"
            columns: ["apartment_id"]
            isOneToOne: false
            referencedRelation: "apartments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_complex_id_fkey"
            columns: ["complex_id"]
            isOneToOne: false
            referencedRelation: "residential_complexes"
            referencedColumns: ["id"]
          },
        ]
      }
      news: {
        Row: {
          category: string | null
          city_id: string | null
          complex_id: string | null
          content: string | null
          created_at: string
          developer_id: string | null
          excerpt: string | null
          id: string
          image_url: string | null
          is_promo: boolean | null
          published_at: string | null
          slug: string
          title: string
        }
        Insert: {
          category?: string | null
          city_id?: string | null
          complex_id?: string | null
          content?: string | null
          created_at?: string
          developer_id?: string | null
          excerpt?: string | null
          id?: string
          image_url?: string | null
          is_promo?: boolean | null
          published_at?: string | null
          slug: string
          title: string
        }
        Update: {
          category?: string | null
          city_id?: string | null
          complex_id?: string | null
          content?: string | null
          created_at?: string
          developer_id?: string | null
          excerpt?: string | null
          id?: string
          image_url?: string | null
          is_promo?: boolean | null
          published_at?: string | null
          slug?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_complex_id_fkey"
            columns: ["complex_id"]
            isOneToOne: false
            referencedRelation: "residential_complexes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_developer_id_fkey"
            columns: ["developer_id"]
            isOneToOne: false
            referencedRelation: "developers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email_notifications: boolean | null
          full_name: string | null
          id: string
          new_complexes_alerts: boolean | null
          phone: string | null
          preferred_city_id: string | null
          price_alerts: boolean | null
          push_notifications: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email_notifications?: boolean | null
          full_name?: string | null
          id?: string
          new_complexes_alerts?: boolean | null
          phone?: string | null
          preferred_city_id?: string | null
          price_alerts?: boolean | null
          push_notifications?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email_notifications?: boolean | null
          full_name?: string | null
          id?: string
          new_complexes_alerts?: boolean | null
          phone?: string | null
          preferred_city_id?: string | null
          price_alerts?: boolean | null
          push_notifications?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_preferred_city_id_fkey"
            columns: ["preferred_city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      residential_complexes: {
        Row: {
          address: string | null
          city_id: string | null
          completion_date: string | null
          created_at: string
          description: string | null
          developer_id: string | null
          district: string | null
          features: string[] | null
          gallery: string[] | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          price_from: number | null
          price_to: number | null
          rating: number | null
          reviews_count: number | null
          slug: string
        }
        Insert: {
          address?: string | null
          city_id?: string | null
          completion_date?: string | null
          created_at?: string
          description?: string | null
          developer_id?: string | null
          district?: string | null
          features?: string[] | null
          gallery?: string[] | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          price_from?: number | null
          price_to?: number | null
          rating?: number | null
          reviews_count?: number | null
          slug: string
        }
        Update: {
          address?: string | null
          city_id?: string | null
          completion_date?: string | null
          created_at?: string
          description?: string | null
          developer_id?: string | null
          district?: string | null
          features?: string[] | null
          gallery?: string[] | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          price_from?: number | null
          price_to?: number | null
          rating?: number | null
          reviews_count?: number | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "residential_complexes_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "residential_complexes_developer_id_fkey"
            columns: ["developer_id"]
            isOneToOne: false
            referencedRelation: "developers"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          author_name: string
          complex_id: string | null
          created_at: string
          developer_id: string | null
          id: string
          is_verified: boolean | null
          rating: number
          text: string | null
        }
        Insert: {
          author_name: string
          complex_id?: string | null
          created_at?: string
          developer_id?: string | null
          id?: string
          is_verified?: boolean | null
          rating: number
          text?: string | null
        }
        Update: {
          author_name?: string
          complex_id?: string | null
          created_at?: string
          developer_id?: string | null
          id?: string
          is_verified?: boolean | null
          rating?: number
          text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_complex_id_fkey"
            columns: ["complex_id"]
            isOneToOne: false
            referencedRelation: "residential_complexes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_developer_id_fkey"
            columns: ["developer_id"]
            isOneToOne: false
            referencedRelation: "developers"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_searches: {
        Row: {
          city_id: string | null
          created_at: string
          districts: string[] | null
          id: string
          max_price: number | null
          min_price: number | null
          name: string
          rooms: number[] | null
          user_id: string
        }
        Insert: {
          city_id?: string | null
          created_at?: string
          districts?: string[] | null
          id?: string
          max_price?: number | null
          min_price?: number | null
          name: string
          rooms?: number[] | null
          user_id: string
        }
        Update: {
          city_id?: string | null
          created_at?: string
          districts?: string[] | null
          id?: string
          max_price?: number | null
          min_price?: number | null
          name?: string
          rooms?: number[] | null
          user_id?: string
        }
        Relationships: []
      }
      view_history: {
        Row: {
          complex_id: string
          id: string
          user_id: string
          viewed_at: string
        }
        Insert: {
          complex_id: string
          id?: string
          user_id: string
          viewed_at?: string
        }
        Update: {
          complex_id?: string
          id?: string
          user_id?: string
          viewed_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
