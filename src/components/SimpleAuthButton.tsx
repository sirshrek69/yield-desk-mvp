'use client'

import React, { useState } from 'react'
import { useAuth } from '../contexts/SimpleAuthContext'
import AuthModal from './AuthModal'

export default function SimpleAuthButton() {
  const { user, isAuthenticated, logout, loading } = useAuth()
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-primary"></div>
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    )
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center space-x-4">
        {/* User Info */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {user.username.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="hidden md:block">
            <div className="text-sm font-medium text-gray-900">
              {user.username}
            </div>
            <div className="text-xs text-gray-500">
              {user.email}
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="px-4 py-2 text-sm border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 rounded-md transition-colors"
        >
          Sign Out
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-2 bg-brand-primary text-white rounded-md font-medium hover:bg-brand-primary/90 transition-colors"
        >
          Sign In
        </button>
      </div>

      <AuthModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  )
}
