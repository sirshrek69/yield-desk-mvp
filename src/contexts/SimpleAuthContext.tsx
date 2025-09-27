'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface User {
  id: string
  username: string
  email: string
  createdAt: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => void
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
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on app start
    const savedUser = localStorage.getItem('currentUser')
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
      } catch (error) {
        console.error('Error parsing saved user:', error)
        localStorage.removeItem('currentUser')
      }
    }
    setLoading(false)
  }, [])

  const register = async (username: string, email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      // Get existing users from localStorage
      const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
      
      // Check if username or email already exists
      const userExists = existingUsers.find((u: any) => u.username === username || u.email === email)
      if (userExists) {
        return { success: false, message: 'Username or email already exists' }
      }

      // Create new user
      const newUser: User = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        username,
        email,
        createdAt: new Date().toISOString()
      }

      // Save user data (in real app, password would be hashed)
      const userData = {
        ...newUser,
        password // In real app, this would be hashed
      }

      // Add to users database
      const updatedUsers = [...existingUsers, userData]
      localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers))

      // Log user in immediately
      setUser(newUser)
      localStorage.setItem('currentUser', JSON.stringify(newUser))

      return { success: true, message: 'Account created successfully!' }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, message: 'Registration failed. Please try again.' }
    }
  }

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      // Get existing users from localStorage
      const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
      
      // Find user by email and password
      const userData = existingUsers.find((u: any) => u.email === email && u.password === password)
      
      if (!userData) {
        return { success: false, message: 'Invalid email or password' }
      }

      // Remove password from user object for security
      const { password: _, ...userWithoutPassword } = userData
      setUser(userWithoutPassword)
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword))

      return { success: true, message: 'Login successful!' }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, message: 'Login failed. Please try again.' }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('currentUser')
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
