'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { supabase, UserProfile, PortfolioPosition, WalletBalance } from '@/lib/supabase'

interface AuthContextType {
  user: UserProfile | null
  portfolio: PortfolioPosition[]
  walletBalance: number
  loading: boolean
  syncUserToSupabase: () => Promise<void>
  updatePortfolio: (positions: PortfolioPosition[]) => Promise<void>
  updateWalletBalance: (balance: number) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { user: privyUser, authenticated, ready } = usePrivy()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [portfolio, setPortfolio] = useState<PortfolioPosition[]>([])
  const [walletBalance, setWalletBalance] = useState<number>(10000) // Default balance
  const [loading, setLoading] = useState(true)

  // Sync Privy user to Supabase
  const syncUserToSupabase = async () => {
    if (!privyUser || !authenticated) return

    try {
      // Check if user exists in Supabase
      const { data: existingUser } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('privy_id', privyUser.id)
        .single()

      if (existingUser) {
        setUser(existingUser)
        // Load user's portfolio and balance
        await loadUserData(existingUser.id)
      } else {
        // Create new user
        const newUser: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'> = {
          privy_id: privyUser.id,
          email: privyUser.email?.address || null,
          wallet_address: privyUser.wallet?.address || null,
          first_name: privyUser.name?.firstName || null,
          last_name: privyUser.name?.lastName || null,
          phone: privyUser.phone?.number || null,
          kyc_status: 'pending',
        }

        const { data, error } = await supabase
          .from('user_profiles')
          .insert(newUser)
          .select()
          .single()

        if (error) throw error

        setUser(data)
        // Initialize with default balance
        await supabase
          .from('wallet_balances')
          .insert({
            user_id: data.id,
            balance_usd: 10000,
          })
      }
    } catch (error) {
      console.error('Error syncing user to Supabase:', error)
    }
  }

  // Load user's portfolio and wallet balance
  const loadUserData = async (userId: string) => {
    try {
      // Load portfolio
      const { data: portfolioData } = await supabase
        .from('portfolio_positions')
        .select('*')
        .eq('user_id', userId)

      setPortfolio(portfolioData || [])

      // Load wallet balance
      const { data: balanceData } = await supabase
        .from('wallet_balances')
        .select('balance_usd')
        .eq('user_id', userId)
        .single()

      if (balanceData) {
        setWalletBalance(balanceData.balance_usd)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  // Update portfolio in Supabase
  const updatePortfolio = async (positions: PortfolioPosition[]) => {
    if (!user) return

    try {
      // Delete existing positions
      await supabase
        .from('portfolio_positions')
        .delete()
        .eq('user_id', user.id)

      // Insert new positions
      if (positions.length > 0) {
        const positionsWithUserId = positions.map(pos => ({
          ...pos,
          user_id: user.id,
        }))

        await supabase
          .from('portfolio_positions')
          .insert(positionsWithUserId)
      }

      setPortfolio(positions)
    } catch (error) {
      console.error('Error updating portfolio:', error)
    }
  }

  // Update wallet balance in Supabase
  const updateWalletBalance = async (balance: number) => {
    if (!user) return

    try {
      await supabase
        .from('wallet_balances')
        .upsert({
          user_id: user.id,
          balance_usd: balance,
          updated_at: new Date().toISOString(),
        })

      setWalletBalance(balance)
    } catch (error) {
      console.error('Error updating wallet balance:', error)
    }
  }

  useEffect(() => {
    if (ready) {
      if (authenticated && privyUser) {
        syncUserToSupabase()
      } else {
        setUser(null)
        setPortfolio([])
        setWalletBalance(10000)
      }
      setLoading(false)
    }
  }, [authenticated, privyUser, ready])

  const value: AuthContextType = {
    user,
    portfolio,
    walletBalance,
    loading,
    syncUserToSupabase,
    updatePortfolio,
    updateWalletBalance,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
