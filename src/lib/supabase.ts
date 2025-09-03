import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      accounts: {
        Row: {
          id: string
          user_id: string
          account_number: string
          balance: number
          transactions: any[] | null
          loans: any[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          account_number: string
          balance: number
          transactions?: any[] | null
          loans?: any[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          account_number?: string
          balance?: number
          transactions?: any[] | null
          loans?: any[] | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

