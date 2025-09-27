'use client'

import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { usePrivy } from '@privy-io/react-auth'

export default function UserDashboard() {
  const { user, portfolio, walletBalance, loading } = useAuth()
  const { user: privyUser } = usePrivy()

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const totalPortfolioValue = portfolio.reduce((total, position) => {
    return total + (position.amount * position.price)
  }, 0)

  return (
    <div className="bg-background border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Account Dashboard</h2>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-muted-foreground">
            {user.kyc_status === 'approved' ? 'Verified' : 'Pending Verification'}
          </span>
        </div>
      </div>

      {/* User Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <h3 className="font-medium text-foreground">Profile Information</h3>
          <div className="space-y-2 text-sm">
            {user.first_name && user.last_name && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span>{user.first_name} {user.last_name}</span>
              </div>
            )}
            {user.email && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span>{user.email}</span>
              </div>
            )}
            {user.wallet_address && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Wallet:</span>
                <span className="font-mono text-xs">
                  {user.wallet_address.slice(0, 8)}...{user.wallet_address.slice(-8)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium text-foreground">Account Status</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">KYC Status:</span>
              <span className={`capitalize ${
                user.kyc_status === 'approved' ? 'text-green-600' :
                user.kyc_status === 'rejected' ? 'text-red-600' : 'text-yellow-600'
              }`}>
                {user.kyc_status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Account Type:</span>
              <span>Individual</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Member Since:</span>
              <span>{new Date(user.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="text-sm text-muted-foreground mb-1">Wallet Balance</div>
          <div className="text-2xl font-semibold">
            ${walletBalance.toLocaleString()}
          </div>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="text-sm text-muted-foreground mb-1">Portfolio Value</div>
          <div className="text-2xl font-semibold">
            ${totalPortfolioValue.toLocaleString()}
          </div>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="text-sm text-muted-foreground mb-1">Total Assets</div>
          <div className="text-2xl font-semibold">
            ${(walletBalance + totalPortfolioValue).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Portfolio Positions */}
      {portfolio.length > 0 && (
        <div>
          <h3 className="font-medium text-foreground mb-4">Portfolio Positions</h3>
          <div className="space-y-2">
            {portfolio.map((position) => (
              <div key={position.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <div className="font-medium">{position.product_name}</div>
                  <div className="text-sm text-muted-foreground">{position.product_category}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {position.amount} @ ${position.price}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ${(position.amount * position.price).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
