import { Link } from 'react-router-dom'
import {
  Bookmark,
  Sun,
  Moon,
  ArrowRight,
  Folder,
  ChevronDown,
  ExternalLink
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function HomePage() {
  const { resolvedTheme, setTheme } = useTheme()
  const { isAuthenticated } = useAuth()

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <div className="min-h-screen w-full overflow-y-auto bg-[#fafafa] dark:bg-[#0E1117] text-[#171717] dark:text-[#ededed] font-sans antialiased transition-colors selection:bg-[#171717] selection:text-white dark:selection:bg-white dark:selection:text-[#171717] flex flex-col justify-between">
      {/* 1. Navbar */}
      <header className="w-full border-b border-black/[0.06] dark:border-white/[0.08] bg-white/80 dark:bg-[#0E1117]/80 backdrop-blur-md sticky top-0 z-40 transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-6 h-6 rounded bg-[#171717] dark:bg-white text-white dark:text-[#171717] flex items-center justify-center transition-transform group-hover:scale-105">
              <Bookmark className="w-3.5 h-3.5 fill-current stroke-current" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-[#171717] dark:text-white">
              Stashbox
            </span>
          </Link>

          {/* Right Navigation */}
          <div className="flex items-center gap-3 sm:gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-[#171717] dark:hover:text-white transition-colors"
            >
              GitHub
            </a>

            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 rounded text-slate-500 dark:text-slate-400 hover:text-[#171717] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              title={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} mode`}
              aria-label="Toggle theme"
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {isAuthenticated ? (
              <Link
                to="/app"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#171717] dark:bg-white text-white dark:text-[#171717] text-xs sm:text-sm font-medium transition-opacity hover:opacity-90 shadow-2xs"
              >
                <span>Open app</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-[#171717] dark:hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-3.5 py-1.5 rounded-full bg-[#171717] dark:bg-white text-white dark:text-[#171717] text-xs sm:text-sm font-medium transition-opacity hover:opacity-90 shadow-2xs"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. Main Hero Section: Left Copy + Right Zoomed-In Nested Visual */}
      <main className="flex-1 w-full flex flex-col justify-center py-12 sm:py-20 px-4 sm:px-6">
        <section className="max-w-5xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 text-left space-y-4">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] text-[11px] font-mono tracking-wider uppercase text-slate-600 dark:text-slate-400">
                <span>Bookmark manager</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-[48px] font-semibold tracking-[-2px] text-[#171717] dark:text-white leading-[1.12]">
                Save what matters.
                <br />
                Find it when you need it.
              </h1>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-normal leading-relaxed max-w-md">
                A simple, focused place to save and organize the websites worth keeping.
              </p>

              {/* Primary Marketing CTA */}
              <div className="pt-2">
                <Link
                  to={isAuthenticated ? '/app' : '/signup'}
                  className="px-5 py-2.5 rounded-full bg-[#171717] dark:bg-white text-white dark:text-[#171717] font-medium text-xs sm:text-sm transition-opacity hover:opacity-90 inline-flex items-center gap-2 shadow-2xs"
                >
                  <span>{isAuthenticated ? 'Open app' : 'Get started'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Right Content Column: Zoomed-in Slice of Nested Collections (~40% width) */}
            <div className="lg:col-span-5 w-full max-w-md mx-auto lg:max-w-none">
              <div className="rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#161B22] p-4 shadow-xs select-none space-y-3.5">
                {/* Parent Collection: Development */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    <Folder className="w-3.5 h-3.5 text-blue-500 fill-blue-500/20" />
                    <span>Development</span>
                  </div>

                  {/* Nested Collection: Frontend */}
                  <div className="pl-4 space-y-2 border-l border-slate-200 dark:border-slate-800 ml-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      <Folder className="w-3.5 h-3.5 text-indigo-500 fill-indigo-500/20" />
                      <span>Frontend</span>
                    </div>

                    {/* Bookmarks under Frontend */}
                    <div className="pl-4 space-y-1.5">
                      <div className="p-2 rounded-lg border border-black/[0.05] dark:border-white/[0.06] bg-slate-50/70 dark:bg-[#1C2128] flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-xs font-medium text-slate-900 dark:text-white truncate">Vercel</div>
                          <div className="text-[10px] font-mono text-slate-400">vercel.com</div>
                        </div>
                        <ExternalLink className="w-3 h-3 text-slate-300 dark:text-slate-600 flex-shrink-0" />
                      </div>

                      <div className="p-2 rounded-lg border border-black/[0.05] dark:border-white/[0.06] bg-slate-50/70 dark:bg-[#1C2128] flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-xs font-medium text-slate-900 dark:text-white truncate">React</div>
                          <div className="text-[10px] font-mono text-slate-400">react.dev</div>
                        </div>
                        <ExternalLink className="w-3 h-3 text-slate-300 dark:text-slate-600 flex-shrink-0" />
                      </div>
                    </div>

                    {/* Nested Collection: Design */}
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 pt-1">
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      <Folder className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
                      <span>Design</span>
                    </div>

                    {/* Bookmarks under Design */}
                    <div className="pl-4 space-y-1.5">
                      <div className="p-2 rounded-lg border border-black/[0.05] dark:border-white/[0.06] bg-slate-50/70 dark:bg-[#1C2128] flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-xs font-medium text-slate-900 dark:text-white truncate">Figma</div>
                          <div className="text-[10px] font-mono text-slate-400">figma.com</div>
                        </div>
                        <ExternalLink className="w-3 h-3 text-slate-300 dark:text-slate-600 flex-shrink-0" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Parent Collection: Resources */}
                <div className="space-y-2 pt-1 border-t border-black/[0.04] dark:border-white/[0.06]">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    <Folder className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/20" />
                    <span>Resources</span>
                  </div>

                  <div className="pl-4 ml-1.5">
                    <div className="p-2 rounded-lg border border-black/[0.05] dark:border-white/[0.06] bg-slate-50/70 dark:bg-[#1C2128] flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-slate-900 dark:text-white truncate">GitHub</div>
                        <div className="text-[10px] font-mono text-slate-400">github.com</div>
                      </div>
                      <ExternalLink className="w-3 h-3 text-slate-300 dark:text-slate-600 flex-shrink-0" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 3. Minimal Footer */}
      <footer className="border-t border-black/[0.06] dark:border-white/[0.08] bg-[#fafafa] dark:bg-[#0E1117] py-6 text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#171717] dark:bg-white text-white dark:text-[#171717] flex items-center justify-center">
              <Bookmark className="w-2.5 h-2.5 fill-current stroke-current" />
            </div>
            <span className="font-semibold text-[#171717] dark:text-white">Stashbox</span>
            <span className="text-slate-400 dark:text-slate-500">© {new Date().getFullYear()} Stashbox</span>
          </div>

          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[#171717] dark:hover:text-white transition-colors"
          >
            GitHub
          </a>
        </div>
      </footer>
    </div>
  )
}
