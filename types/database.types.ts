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
      questions: {
        Row: {
          id: string
          category: string
          title: string
          order: number
        }
        Insert: {
          id?: string
          category: string
          title: string
          order: number
        }
        Update: {
          id?: string
          category?: string
          title?: string
          order?: number
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
