'use client'

import React, { useState } from 'react'
import { useAuth } from '../../contexts/SimpleAuthContext'
import AuthModal from '../../components/AuthModal'

export default function AccountPage() {
  const { user, isAuthenticated, loading } = useAuth()
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <>
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto text-center">
              <div className="mb-8">
                <h1 className="text-4xl font-bold mb-4">Welcome to Yield Desk</h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Create an account to start investing in tokenised fixed income products
                </p>
              </div>

              <div className="bg-card border border-border rounded-lg p-8 mb-8">
                <h2 className="text-2xl font-semibold mb-4">Get Started</h2>
                <p className="text-muted-foreground mb-6">
                  Sign up with just your username, email, and password to access your personalized dashboard, 
                  view your portfolio, and start investing in our curated selection of fixed income products.
                </p>
                
                <div className="flex justify-center">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-3 bg-brand-primary text-white rounded-md font-medium hover:bg-brand-primary/90 transition-colors"
                  >
                    Create Account
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-brand-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-2">Simple Account</h3>
                  <p className="text-sm text-muted-foreground">
                    Quick signup with username, email, and password
                  </p>
                </div>

                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-brand-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-2">Track Portfolio</h3>
                  <p className="text-sm text-muted-foreground">
                    Monitor your investments and portfolio performance
                  </p>
                </div>

                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-brand-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-2">Invest & Earn</h3>
                  <p className="text-sm text-muted-foreground">
                    Access bonds, stocks, and ETFs with competitive yields
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <AuthModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
      </>
    )
  }

  // Get user's portfolio and balance from localStorage (only if authenticated)
  const userPortfolioKey = user ? `portfolio_${user.id}` : null
  const userBalanceKey = user ? `walletBalance_${user.id}` : null
  
  const savedPortfolio = userPortfolioKey ? JSON.parse(localStorage.getItem(userPortfolioKey) || '[]') : []
  const walletBalance = userBalanceKey ? parseFloat(localStorage.getItem(userBalanceKey) || '10000') : 10000
  
  const totalPortfolioValue = savedPortfolio.reduce((total: number, position: any) => {
    return total + (position.amount * position.price)
  }, 0)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Account Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user.username}! Manage your investments and track your portfolio performance.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Account Info */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Account Information</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-brand-primary rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-lg">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">{user.username}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </div>
                </div>
                <div className="pt-4 border-t border-border">
                  <div className="text-sm text-muted-foreground mb-1">Member since</div>
                  <div className="font-medium">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Overview */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Portfolio Positions</h3>
                {savedPortfolio.length > 0 ? (
                  <div className="space-y-3">
                    {savedPortfolio.map((position: any) => (
                      <div key={position.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <div className="font-medium">{position.productName}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(position.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            ${position.amount.toLocaleString()} @ ${position.price}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Value: ${(position.amount * position.price).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-muted-foreground mb-4">No investments yet</div>
                    <a 
                      href="/markets"
                      className="inline-flex items-center px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary/90 transition-colors"
                    >
                      Start Investing
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}