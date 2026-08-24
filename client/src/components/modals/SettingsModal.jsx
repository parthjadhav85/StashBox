import { useState } from 'react'
import { X, Sun, Moon, Monitor, User, LogOut } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

export default function SettingsModal({ isOpen, onClose }) {
  const { theme, setTheme } = useTheme()
  const { user, profile, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('appearance')

  if (!isOpen) return null

  const displayName = profile?.display_name || user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User'
  const email = user?.email || ''

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-[var(--rd-bg-card)] border border-[var(--rd-border)] rounded-2xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150 text-[var(--rd-text-primary)]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[var(--rd-border)] flex items-center justify-between">
          <h3 className="text-sm font-bold tracking-tight">Settings</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-[var(--rd-text-secondary)] hover:text-[var(--rd-text-primary)] hover:bg-[var(--rd-bg-hover)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Layout: Tabs on Left, Content on Right */}
        <div className="flex flex-col sm:flex-row min-h-[320px]">
          {/* Left Tabs */}
          <div className="w-full sm:w-40 border-b sm:border-b-0 sm:border-r border-[var(--rd-border)] p-2 space-y-1 bg-[var(--rd-bg-sidebar)]">
            <button
              type="button"
              onClick={() => setActiveTab('appearance')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer ${
                activeTab === 'appearance'
                  ? 'bg-[var(--rd-bg-card)] text-[var(--rd-text-primary)] shadow-xs font-semibold'
                  : 'text-[var(--rd-text-secondary)] hover:text-[var(--rd-text-primary)] hover:bg-[var(--rd-bg-hover)]'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Appearance</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('account')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer ${
                activeTab === 'account'
                  ? 'bg-[var(--rd-bg-card)] text-[var(--rd-text-primary)] shadow-xs font-semibold'
                  : 'text-[var(--rd-text-secondary)] hover:text-[var(--rd-text-primary)] hover:bg-[var(--rd-bg-hover)]'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Account</span>
            </button>
          </div>

          {/* Right Content */}
          <div className="flex-1 p-5 overflow-y-auto">
            {activeTab === 'appearance' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--rd-text-secondary)] mb-1">
                    Theme
                  </h4>
                  <p className="text-xs text-[var(--rd-text-muted)] mb-3">
                    Choose how Stashbox appears on your device.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {/* Light */}
                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                      theme === 'light'
                        ? 'border-[var(--rd-accent-gold)] ring-2 ring-[var(--rd-accent-gold)]/20 bg-[var(--rd-accent-gold)]/5'
                        : 'border-[var(--rd-border)] hover:border-[var(--rd-text-secondary)] bg-[var(--rd-bg-main)]'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-800 shadow-xs">
                      <Sun className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium">Light</span>
                  </button>

                  {/* Dark */}
                  <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                      theme === 'dark'
                        ? 'border-[var(--rd-accent-gold)] ring-2 ring-[var(--rd-accent-gold)]/20 bg-[var(--rd-accent-gold)]/5'
                        : 'border-[var(--rd-border)] hover:border-[var(--rd-text-secondary)] bg-[var(--rd-bg-main)]'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#222326] border border-[#33353a] flex items-center justify-center text-slate-200 shadow-xs">
                      <Moon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium">Dark</span>
                  </button>

                  {/* System */}
                  <button
                    type="button"
                    onClick={() => setTheme('system')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                      theme === 'system'
                        ? 'border-[var(--rd-accent-gold)] ring-2 ring-[var(--rd-accent-gold)]/20 bg-[var(--rd-accent-gold)]/5'
                        : 'border-[var(--rd-border)] hover:border-[var(--rd-text-secondary)] bg-[var(--rd-bg-main)]'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-[var(--rd-bg-sidebar)] border border-[var(--rd-border)] flex items-center justify-center text-[var(--rd-text-primary)] shadow-xs">
                      <Monitor className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium">System</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'account' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--rd-text-secondary)] mb-1">
                    Profile Details
                  </h4>
                  <p className="text-xs text-[var(--rd-text-muted)]">
                    Managed through Stashbox Supabase Authentication.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--rd-bg-sidebar)] border border-[var(--rd-border)] space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[var(--rd-text-secondary)]">Name:</span>
                    <span className="font-semibold">{displayName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--rd-text-secondary)]">Email:</span>
                    <span className="font-mono text-[11px]">{email}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--rd-border)]">
                  <button
                    type="button"
                    onClick={() => {
                      onClose()
                      logout()
                    }}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
