import { useState } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import {
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  X
} from 'lucide-react'

export default function AuthCard({ initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [showForgotNotice, setShowForgotNotice] = useState(false)

  const { login, signup, isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/app'

  if (isAuthenticated && !isLoading) {
    return <Navigate to="/app" replace />
  }

  const handleTabChange = (newMode) => {
    setMode(newMode)
    setErrorMessage('')
    setSuccessMessage('')
    setShowForgotNotice(false)
  }

  const validateEmail = (val) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    const cleanEmail = email.trim()

    if (!cleanEmail) {
      setErrorMessage('Please enter your email address.')
      return
    }

    if (!validateEmail(cleanEmail)) {
      setErrorMessage('Please enter a valid email address.')
      return
    }

    if (!password) {
      setErrorMessage('Please enter your password.')
      return
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.')
      return
    }

    try {
      setIsSubmitting(true)
      if (mode === 'login') {
        await login(cleanEmail, password)
        navigate(from, { replace: true })
      } else {
        const derivedName = cleanEmail.split('@')[0]
        const res = await signup(cleanEmail, password, derivedName)
        if (res?.session?.access_token) {
          navigate(from, { replace: true })
        } else {
          setSuccessMessage('Account created successfully. You can now log in.')
          setMode('login')
        }
      }
    } catch (err) {
      const msg = err.data?.message || err.message || ''
      if (msg.toLowerCase().includes('invalid login credentials') || msg.toLowerCase().includes('invalid credentials')) {
        setErrorMessage('Invalid email or password. Please check your credentials.')
      } else if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('user already exists')) {
        setErrorMessage('An account with this email already exists.')
      } else {
        setErrorMessage(msg || (mode === 'login' ? 'Login failed. Please try again.' : 'Registration failed. Please try again.'))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#fafafa] dark:bg-[#0E1117] text-[#171717] dark:text-[#ededed] font-sans antialiased transition-colors flex flex-col items-center justify-center p-4 sm:p-6 select-none">
      <div className="w-full max-w-[400px] sm:max-w-[420px] mx-auto">
        {/* Standalone Centered Card */}
        <div className="bg-white dark:bg-[#161B22] border border-black/[0.08] dark:border-white/[0.08] rounded-2xl p-6 sm:p-7 shadow-xs">
          {/* Segmented Control Tabs */}
          <div className="bg-black/[0.04] dark:bg-white/[0.06] p-1 rounded-xl flex items-center mb-6">
            <button
              type="button"
              onClick={() => handleTabChange('login')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white dark:bg-[#21262D] text-[#171717] dark:text-white shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('signup')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white dark:bg-[#21262D] text-[#171717] dark:text-white shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-rose-600 dark:text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5 text-emerald-600 dark:text-emerald-400 text-xs">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Forgot Password Helper Notice */}
          {showForgotNotice && (
            <div className="mb-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs relative">
              <button
                type="button"
                onClick={() => setShowForgotNotice(false)}
                className="absolute top-2.5 right-2.5 text-blue-400 hover:text-blue-600 dark:hover:text-blue-200 cursor-pointer"
                aria-label="Close notice"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <p className="font-medium pr-4">Password Reset</p>
              <p className="mt-0.5 text-[11px] text-blue-500 dark:text-blue-300">
                Please contact your workspace administrator or re-create your account if needed.
              </p>
            </div>
          )}

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label
                htmlFor="auth-email"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Email address
              </label>
              <input
                id="auth-email"
                type="email"
                required
                autoComplete="email"
                disabled={isSubmitting}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-3 py-2 bg-white dark:bg-[#0E1117] border border-black/[0.1] dark:border-white/[0.12] rounded-xl text-xs sm:text-sm text-[#171717] dark:text-[#ededed] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#171717] dark:focus:border-white transition-colors disabled:opacity-50"
              />
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="auth-password"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  Password
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setShowForgotNotice(true)}
                    className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-[#171717] dark:hover:text-white transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  disabled={isSubmitting}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-3 pr-10 py-2 bg-white dark:bg-[#0E1117] border border-black/[0.1] dark:border-white/[0.12] rounded-xl text-xs sm:text-sm text-[#171717] dark:text-[#ededed] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#171717] dark:focus:border-white transition-colors disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-[#171717] dark:bg-white text-white dark:text-[#171717] text-xs sm:text-sm font-medium transition-opacity hover:opacity-90 cursor-pointer disabled:opacity-50 shadow-2xs"
              >
                {isSubmitting
                  ? mode === 'login'
                    ? 'Signing in...'
                    : 'Creating account...'
                  : mode === 'login'
                  ? 'Log In'
                  : 'Create an account'}
              </button>
            </div>
          </form>

          {/* Card Footer Divider & Mode Switcher */}
          <div className="mt-5 pt-4 border-t border-black/[0.06] dark:border-white/[0.06] text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {mode === 'login' ? (
                <>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => handleTabChange('signup')}
                    className="font-semibold text-[#171717] dark:text-white hover:underline cursor-pointer ml-0.5"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => handleTabChange('login')}
                    className="font-semibold text-[#171717] dark:text-white hover:underline cursor-pointer ml-0.5"
                  >
                    Login
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
