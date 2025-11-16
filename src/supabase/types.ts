export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          phone_number: string | null
          date_of_birth: string | null
          house_number: string | null
          area: string | null
          city: string | null
          state: string | null
          postal_code: string | null
          profile_complete: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name: string
          last_name: string
          phone_number?: string | null
          date_of_birth?: string | null
          house_number?: string | null
          area?: string | null
          city?: string | null
          state?: string | null
          postal_code?: string | null
          profile_complete?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          phone_number?: string | null
          date_of_birth?: string | null
          house_number?: string | null
          area?: string | null
          city?: string | null
          state?: string | null
          postal_code?: string | null
          profile_complete?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string | null
          client_info: Json
          property_details: Json
          requirements: string[]
          rooms: Json[]
          sections: Json[]
          total_cost: number
          status: 'draft' | 'in-progress' | 'completed'
          last_saved_page: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          client_info: Json
          property_details: Json
          requirements?: string[]
          rooms?: Json[]
          sections?: Json[]
          total_cost?: number
          status?: 'draft' | 'in-progress' | 'completed'
          last_saved_page?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          client_info?: Json
          property_details?: Json
          requirements?: string[]
          rooms?: Json[]
          sections?: Json[]
          total_cost?: number
          status?: 'draft' | 'in-progress' | 'completed'
          last_saved_page?: string
          created_at?: string
          updated_at?: string
        }
      }
      inquiries: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          message: string
          status: string
          property_type: string | null
          property_size: string | null
          location: string | null
          budget: string | null
          requirements: string | null
          timeline: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone: string
          message: string
          status?: string
          property_type?: string | null
          property_size?: string | null
          location?: string | null
          budget?: string | null
          requirements?: string | null
          timeline?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          message?: string
          status?: string
          property_type?: string | null
          property_size?: string | null
          location?: string | null
          budget?: string | null
          requirements?: string | null
          timeline?: string | null
          created_at?: string
        }
      }
      admin_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
        }
      }
      testimonials: {
        Row: {
          id: string
          client_name: string
          property_type: string
          location: string
          date: string
          quote: string
          project_details: string
          features: string[]
          results: string[]
          video_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_name: string
          property_type: string
          location: string
          date: string
          quote: string
          project_details: string
          features?: string[]
          results?: string[]
          video_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_name?: string
          property_type?: string
          location?: string
          date?: string
          quote?: string
          project_details?: string
          features?: string[]
          results?: string[]
          video_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      inventory: {
        Row: {
          id: string
          category: string
          subcategory: string | null
          wattage: number | null
          price_per_unit: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category: string
          subcategory?: string | null
          wattage?: number | null
          price_per_unit: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category?: string
          subcategory?: string | null
          wattage?: number | null
          price_per_unit?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      admins: {
        Row: {
          id: string
          email: string
          full_name: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
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
  }
}
