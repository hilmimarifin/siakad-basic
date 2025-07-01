import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          password_hash: string
          role: 'admin' | 'principal' | 'teacher'
          full_name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          role: 'admin' | 'principal' | 'teacher'
          full_name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          role?: 'admin' | 'principal' | 'teacher'
          full_name?: string
          created_at?: string
          updated_at?: string
        }
      }
      classes: {
        Row: {
          id: string
          name: string
          grade_level: string
          homeroom_teacher_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          grade_level: string
          homeroom_teacher_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          grade_level?: string
          homeroom_teacher_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      students: {
        Row: {
          id: string
          student_id: string
          full_name: string
          date_of_birth: string
          gender: 'male' | 'female'
          address: string
          phone: string | null
          parent_name: string
          parent_phone: string
          class_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          full_name: string
          date_of_birth: string
          gender: 'male' | 'female'
          address: string
          phone?: string | null
          parent_name: string
          parent_phone: string
          class_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          full_name?: string
          date_of_birth?: string
          gender?: 'male' | 'female'
          address?: string
          phone?: string | null
          parent_name?: string
          parent_phone?: string
          class_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          student_id: string
          amount: number
          payment_date: string
          month: string
          year: number
          status: 'paid' | 'unpaid' | 'partial'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          amount: number
          payment_date: string
          month: string
          year: number
          status: 'paid' | 'unpaid' | 'partial'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          amount?: number
          payment_date?: string
          month?: string
          year?: number
          status?: 'paid' | 'unpaid' | 'partial'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}