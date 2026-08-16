import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api, getToken, setToken, clearToken } from '../api/api.js'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [token, setAuthToken] = useState(getToken())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const checkAuth = useCallback(async () => {
    const savedToken = getToken()
    if (!savedToken) {
      setUser(null)
      setProfile(null)
      setAuthToken(null)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const res = await api.auth.getMe()
      setUser(res.user || null)
      setProfile(res.profile || null)
      setAuthToken(savedToken)
      setError(null)
    } catch (err) {
      console.warn('Session check failed or expired:', err.message)
      clearToken()
      setUser(null)
      setProfile(null)
      setAuthToken(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const login = async (email, password) => {
    setError(null)
    try {
      const res = await api.auth.login({ email, password })
      const accessToken = res.session?.access_token
      if (accessToken) {
        setToken(accessToken)
        setAuthToken(accessToken)
      }
      setUser(res.user || null)
      setProfile(res.user?.user_metadata || null)
      return res
    } catch (err) {
      const message = err.data?.message || err.message || 'Login failed'
      setError(message)
      throw err
    }
  }

  const signup = async (email, password, displayName) => {
    setError(null)
    try {
      const res = await api.auth.signup({ email, password, displayName })
      const accessToken = res.session?.access_token
      if (accessToken) {
        setToken(accessToken)
        setAuthToken(accessToken)
        setUser(res.user || null)
        setProfile(res.user?.user_metadata || null)
      }
      return res
    } catch (err) {
      const message = err.data?.message || err.message || 'Registration failed'
      setError(message)
      throw err
    }
  }

  const logout = async () => {
    try {
      if (token) {
        await api.auth.logout().catch(() => {})
      }
    } finally {
      clearToken()
      setUser(null)
      setProfile(null)
      setAuthToken(null)
      setError(null)
    }
  }

  const updateDisplayName = async (displayName) => {
    try {
      const res = await api.auth.updateProfile({ displayName })
      if (res.profile) {
        setProfile(res.profile)
      }
      return res
    } catch (err) {
      const message = err.data?.message || err.message || 'Failed to update profile'
      setError(message)
      throw err
    }
  }

  const value = {
    user,
    profile,
    token,
    isAuthenticated: Boolean(user && token),
    isLoading,
    error,
    login,
    signup,
    logout,
    updateDisplayName,
    checkAuth
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
