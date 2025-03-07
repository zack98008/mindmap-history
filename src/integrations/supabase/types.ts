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
      element_relationships: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          source_id: string | null
          target_id: string | null
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          source_id?: string | null
          target_id?: string | null
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          source_id?: string | null
          target_id?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "element_relationships_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "historical_elements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "element_relationships_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "historical_elements"
            referencedColumns: ["id"]
          },
        ]
      }
      historical_elements: {
        Row: {
          created_at: string | null
          date: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          tags: string[] | null
          type: string
          updated_at: string | null
          user_id: string | null
          year: number | null
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          tags?: string[] | null
          type: string
          updated_at?: string | null
          user_id?: string | null
          year?: number | null
        }
        Update: {
          created_at?: string | null
          date?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          tags?: string[] | null
          type?: string
          updated_at?: string | null
          user_id?: string | null
          year?: number | null
        }
        Relationships: []
      }
      map_elements: {
        Row: {
          created_at: string | null
          element_id: string | null
          id: string
          layer: number | null
          map_id: string | null
          x_position: number | null
          y_position: number | null
        }
        Insert: {
          created_at?: string | null
          element_id?: string | null
          id?: string
          layer?: number | null
          map_id?: string | null
          x_position?: number | null
          y_position?: number | null
        }
        Update: {
          created_at?: string | null
          element_id?: string | null
          id?: string
          layer?: number | null
          map_id?: string | null
          x_position?: number | null
          y_position?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "map_elements_element_id_fkey"
            columns: ["element_id"]
            isOneToOne: false
            referencedRelation: "historical_elements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "map_elements_map_id_fkey"
            columns: ["map_id"]
            isOneToOne: false
            referencedRelation: "user_maps"
            referencedColumns: ["id"]
          },
        ]
      }
      map_relationships: {
        Row: {
          created_at: string | null
          id: string
          map_id: string | null
          relationship_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          map_id?: string | null
          relationship_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          map_id?: string | null
          relationship_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "map_relationships_map_id_fkey"
            columns: ["map_id"]
            isOneToOne: false
            referencedRelation: "user_maps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "map_relationships_relationship_id_fkey"
            columns: ["relationship_id"]
            isOneToOne: false
            referencedRelation: "element_relationships"
            referencedColumns: ["id"]
          },
        ]
      }
      user_maps: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          user_id?: string | null
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
