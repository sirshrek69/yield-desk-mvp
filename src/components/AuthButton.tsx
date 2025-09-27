'use client'

import React from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useAuth } from '@/contexts/AuthContext'

export default function AuthButton() {
  const { login, logout, authenticated, user } = usePrivy()
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-primary"></div>
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    )
  }

  if (authenticated && user) {
    return (
      <div className="flex items-center space-x-4">
        {/* User Info */}
        <div className="flex items-center space-x-2">
          {user.wallet?.address ? (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">
                {user.wallet.address.slice(0, 6)}...{user.wallet.address.slice(-4)}
              </span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium">
                {user.email?.address || 'User'}
              </span>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="px-4 py-2 text-sm border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
        >
          Logout
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-3">
      <button
        onClick={login}
        className="px-6 py-2 bg-brand-primary text-white rounded-md font-medium hover:bg-brand-primary/90 transition-colors"
      >
        Connect Wallet
      </button>
    </div>
  )
}
