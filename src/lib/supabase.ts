import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface UserProfile {
  id: string
  privy_id: string
  email?: string
  wallet_address?: string
  first_name?: string
  last_name?: string
  phone?: string
  kyc_status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
}

export interface PortfolioPosition {
  id: string
  user_id: string
  product_id: string
  product_name: string
  product_category: string
  amount: number
  price: number
  timestamp: string
  status: 'committed' | 'active' | 'matured'
}

export interface WalletBalance {
  id: string
  user_id: string
  balance_usd: number
  updated_at: string
}
