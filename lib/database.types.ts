export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      feedback: {
        Row: {
          id: string
          name: string | null
          email: string | null
          feedback: string
          starred?: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name?: string | null
          email?: string | null
          feedback: string
          starred?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          email?: string | null
          feedback?: string
          starred?: boolean
          created_at?: string
        }
        Relationships: []
      }
      monastery_feedback: {
        Row: {
          id: string
          monastery_id: string
          user_name: string | null
          user_email: string | null
          feedback_type: string
          subject: string
          feedback_content: string
          admin_status: 'pending' | 'cleared'
          admin_notes: string | null
          created_at: string
          reviewed_at: string | null
          reviewed_by: string | null
        }
        Insert: {
          id?: string
          monastery_id: string
          user_name?: string | null
          user_email?: string | null
          feedback_type: string
          subject: string
          feedback_content: string
          admin_status?: 'pending' | 'cleared'
          admin_notes?: string | null
          created_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
        }
        Update: {
          id?: string
          monastery_id?: string
          user_name?: string | null
          user_email?: string | null
          feedback_type?: string
          subject?: string
          feedback_content?: string
          admin_status?: 'pending' | 'cleared'
          admin_notes?: string | null
          created_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "monastery_feedback_monastery_id_fkey"
            columns: ["monastery_id"]
            isOneToOne: false
            referencedRelation: "monasteries"
            referencedColumns: ["id"]
          }
        ]
      }
      monasteries: {
        Row: {
          address: string | null
          beginner_friendly: boolean | null
          center_type: string
          community_size: string | null
          description: string | null
          dietary_info: string | null
          email: string | null
          gender_policy: string | null
          id: string
          involvement_method: string | null
          languages_spoken: string[] | null
          latitude: number | null
          length_of_stay: string | null
          longitude: number | null
          name: string
          ordination_possible: boolean | null
          pending: boolean
          phone: string | null
          photos: string[] | null
          practices: string[] | null
          price_details: string | null
          price_model: string | null
          setting: string | null
          teachers: string[] | null
          traditions: string[] | null
          vehicle: string
          website: string | null
        }
        Insert: {
          address?: string | null
          beginner_friendly?: boolean | null
          center_type: string
          community_size?: string | null
          description?: string | null
          dietary_info?: string | null
          email?: string | null
          gender_policy?: string | null
          id?: string
          involvement_method?: string | null
          languages_spoken?: string[] | null
          latitude?: number | null
          length_of_stay?: string | null
          longitude?: number | null
          name: string
          ordination_possible?: boolean | null
          pending?: boolean
          phone?: string | null
          photos?: string[] | null
          practices?: string[] | null
          price_details?: string | null
          price_model?: string | null
          setting?: string | null
          teachers?: string[] | null
          traditions?: string[] | null
          vehicle: string
          website?: string | null
        }
        Update: {
          address?: string | null
          beginner_friendly?: boolean | null
          center_type?: string
          community_size?: string | null
          description?: string | null
          dietary_info?: string | null
          email?: string | null
          gender_policy?: string | null
          id?: string
          involvement_method?: string | null
          languages_spoken?: string[] | null
          latitude?: number | null
          length_of_stay?: string | null
          longitude?: number | null
          name?: string
          ordination_possible?: boolean | null
          pending?: boolean
          phone?: string | null
          photos?: string[] | null
          practices?: string[] | null
          price_details?: string | null
          price_model?: string | null
          setting?: string | null
          teachers?: string[] | null
          traditions?: string[] | null
          vehicle?: string
          website?: string | null
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
