import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Folder,
  ChevronDown,
  ExternalLink,
  Mail
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

export default function HomePage() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#050507] text-white font-sans antialiased selection:bg-white selection:text-black flex flex-col justify-between relative">
      {/* Subtle Atmospheric Top Glow */}
      <div 
        className="pointer-events-none absolute inset-x-0 top-0 h-[480px] opacity-75 z-0"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% -10%, rgba(99, 102, 241, 0.09), rgba(168, 85, 247, 0.04) 40%, transparent 80%)'
        }}
      />

      {/* 1. Transparent Navbar (Logo + Login + Get started) */}
      <header className="w-full bg-transparent sticky top-0 z-40 transition-colors">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 h-20 flex items-center justify-between relative z-10">
          {/* Left: Official Brand Logo & Wordmark */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/favicon.svg"
              alt="Stashbox logo"
              className="w-8.5 h-8.5 rounded-lg object-contain transition-transform group-hover:scale-105"
            />
            <span className="text-[19px] font-bold tracking-tight text-[#F4F4F6]">
              Stashbox
            </span>
          </Link>

          {/* Right: Auth Links */}
          <div className="flex items-center gap-4 sm:gap-6">
            {isAuthenticated ? (
              <Link
                to="/app"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white text-black text-sm font-medium transition-all hover:bg-zinc-100 shadow-xs"
              >
                <span>Open app</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-normal text-zinc-400 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-1.5 rounded-full bg-white text-black text-sm font-medium transition-all hover:bg-zinc-100 shadow-xs"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. Middle Content: Hero Section */}
      <main className="flex-1 w-full flex flex-col justify-center py-12 sm:py-20 px-6 sm:px-8 relative z-10">
        <section className="max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 text-left space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-[48px] font-semibold tracking-[-2px] text-[#F4F4F6] leading-[1.12]">
                A better way to manage your bookmarks.
              </h1>

              <p className="text-sm sm:text-base text-zinc-400 font-normal leading-relaxed max-w-md">
                Save, organize, and keep all your links in one place.
              </p>

              {/* Primary Marketing CTA */}
              <div className="pt-2">
                <Link
                  to={isAuthenticated ? '/app' : '/signup'}
                  className="px-5 py-2.5 rounded-full bg-white text-black font-medium text-sm transition-all hover:bg-zinc-100 inline-flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <span>{isAuthenticated ? 'Open app' : 'Try It now'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Right Content Column: Zoomed-in Slice of Nested Collections */}
            <div className="lg:col-span-5 w-full max-w-md mx-auto lg:max-w-none">
              <div className="rounded-2xl border border-zinc-800/80 bg-[#0B0C10]/90 p-4.5 shadow-2xl select-none space-y-3.5 backdrop-blur-xs">
                {/* Parent Collection: Development */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                    <Folder className="w-3.5 h-3.5 text-sky-400 fill-sky-400/20" />
                    <span>Development</span>
                  </div>

                  {/* Nested Collection: Frontend */}
                  <div className="pl-4 space-y-2 border-l border-zinc-800/80 ml-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-400">
                      <ChevronDown className="w-3 h-3 text-zinc-500" />
                      <Folder className="w-3 h-3 text-indigo-400 fill-indigo-400/20" />
                      <span>Frontend</span>
                    </div>

                    {/* Bookmarks under Frontend */}
                    <div className="pl-4 space-y-1.5">
                      <div className="p-2 rounded-xl border border-zinc-800/60 bg-zinc-900/40 hover:bg-zinc-900/70 transition-colors flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-xs font-medium text-zinc-100 truncate">Vercel</div>
                          <div className="text-[10px] font-mono text-zinc-400">vercel.com</div>
                        </div>
                        <ExternalLink className="w-3 h-3 text-zinc-500 flex-shrink-0" />
                      </div>

                      <div className="p-2 rounded-xl border border-zinc-800/60 bg-zinc-900/40 hover:bg-zinc-900/70 transition-colors flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-xs font-medium text-zinc-100 truncate">React</div>
                          <div className="text-[10px] font-mono text-zinc-400">react.dev</div>
                        </div>
                        <ExternalLink className="w-3 h-3 text-zinc-500 flex-shrink-0" />
                      </div>
                    </div>

                    {/* Nested Collection: Design */}
                    <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 pt-1">
                      <ChevronDown className="w-3 h-3 text-zinc-500" />
                      <Folder className="w-3 h-3 text-rose-400 fill-rose-400/20" />
                      <span>Design</span>
                    </div>

                    {/* Bookmarks under Design */}
                    <div className="pl-4 space-y-1.5">
                      <div className="p-2 rounded-xl border border-zinc-800/60 bg-zinc-900/40 hover:bg-zinc-900/70 transition-colors flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-xs font-medium text-zinc-100 truncate">Figma</div>
                          <div className="text-[10px] font-mono text-zinc-400">figma.com</div>
                        </div>
                        <ExternalLink className="w-3 h-3 text-zinc-500 flex-shrink-0" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Parent Collection: Resources */}
                <div className="space-y-2 pt-1 border-t border-zinc-800/80">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                    <Folder className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
                    <span>Resources</span>
                  </div>

                  <div className="pl-4 ml-1.5">
                    <div className="p-2 rounded-xl border border-zinc-800/60 bg-zinc-900/40 hover:bg-zinc-900/70 transition-colors flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-zinc-100 truncate">GitHub</div>
                        <div className="text-[10px] font-mono text-zinc-400">github.com</div>
                      </div>
                      <ExternalLink className="w-3 h-3 text-zinc-500 flex-shrink-0" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 3. Footer */}
      <footer className="w-full border-t border-zinc-900/80 py-8 relative z-10 bg-transparent">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left Side: Brand Title & Copyright */}
          <div className="text-center sm:text-left">
            <h2 className="text-sm font-bold text-zinc-200 tracking-tight">Stashbox</h2>
            <p className="text-xs text-zinc-500 mt-1">
              © {new Date().getFullYear()} Stashbox
            </p>
          </div>

          {/* Right Side: Links */}
          <div className="flex items-center gap-6 text-sm text-zinc-400">
            <Link to="/about" className="text-xs hover:text-white transition-colors">
              About
            </Link>
            <a
              href="https://github.com/parthjadhav85"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors"
              aria-label="GitHub repository"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </a>
            <a
              href="mailto:parth.dev.contact@gmail.com"
              className="hover:text-white transition-colors"
              aria-label="Contact via email"
            >
              <Mail className="w-4 h-4" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
