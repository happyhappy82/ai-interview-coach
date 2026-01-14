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
      profiles: {
        Row: {
          id: string
          email: string
          role: 'user' | 'admin'
          created_at: string
        }
        Insert: {
          id: string
          email: string
          role?: 'user' | 'admin'
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'user' | 'admin'
          created_at?: string
        }
      }
      system_prompts: {
        Row: {
          id: string
          key_name: string
          content: string
          is_active: boolean
          description: string | null
        }
        Insert: {
          id?: string
          key_name: string
          content: string
          is_active?: boolean
          description?: string | null
        }
        Update: {
          id?: string
          key_name?: string
          content?: string
          is_active?: boolean
          description?: string | null
        }
      }
      companies: {
        Row: {
          id: string
          name: string
          slug: string
          logo_url: string | null
          category: 'bigtech' | 'conglomerate'
          description: string | null
          question_count: number
          display_order: number
          is_active: boolean
          evaluation_criteria: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          logo_url?: string | null
          category: 'bigtech' | 'conglomerate'
          description?: string | null
          question_count?: number
          display_order?: number
          is_active?: boolean
          evaluation_criteria?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          logo_url?: string | null
          category?: 'bigtech' | 'conglomerate'
          description?: string | null
          question_count?: number
          display_order?: number
          is_active?: boolean
          evaluation_criteria?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      company_presets: {
        Row: {
          id: string
          company_id: string
          name: string
          question_ids: string[]
          is_default: boolean
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          question_ids: string[]
          is_default?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          question_ids?: string[]
          is_default?: boolean
          created_at?: string
        }
      }
      questions: {
        Row: {
          id: string
          category: string
          title: string
          order: number
          evaluation_context: string | null
          user_id: string | null
          is_custom: boolean
          company_id: string | null
          source: string
          source_url: string | null
          crawled_at: string | null
        }
        Insert: {
          id?: string
          category: string
          title: string
          order: number
          evaluation_context?: string | null
          user_id?: string | null
          is_custom?: boolean
          company_id?: string | null
          source?: string
          source_url?: string | null
          crawled_at?: string | null
        }
        Update: {
          id?: string
          category?: string
          title?: string
          order?: number
          evaluation_context?: string | null
          user_id?: string | null
          is_custom?: boolean
          company_id?: string | null
          source?: string
          source_url?: string | null
          crawled_at?: string | null
        }
      }
      interview_results: {
        Row: {
          id: string
          user_id: string
          audio_url: string
          ai_feedback: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          audio_url: string
          ai_feedback: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          audio_url?: string
          ai_feedback?: Json
          created_at?: string
        }
      }
    }
  }
}

// 편의를 위한 타입 별칭
export type Company = Database['public']['Tables']['companies']['Row']
export type CompanyPreset = Database['public']['Tables']['company_presets']['Row']
export type Question = Database['public']['Tables']['questions']['Row']
