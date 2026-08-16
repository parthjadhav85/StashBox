import { Link } from 'react-router-dom'
import {
  Bookmark,
  Folder,
  Zap,
  ArrowRight,
  Mail,
  User,
  GraduationCap,
  Code,
  Layers
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

export default function AboutPage() {
  const { isAuthenticated } = useAuth()

  const techStack = [
    'React',
    'JavaScript',
    'Vite',
    'Tailwind CSS',
    'Node.js',
    'Express',
    'Supabase',
    'PostgreSQL'
  ]

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#0A0D14] text-white font-sans antialiased selection:bg-white selection:text-black flex flex-col justify-between relative">
      {/* 1. Transparent Navbar */}
      <header className="w-full bg-transparent sticky top-0 z-40 transition-colors">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 h-20 flex items-center justify-between">
          {/* Left: Official Brand Logo & Wordmark */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/favicon.svg"
              alt="Stashbox logo"
              className="w-8.5 h-8.5 rounded-lg object-contain transition-transform group-hover:scale-105"
            />
            <span className="text-[19px] font-bold tracking-tight text-white">
              Stashbox
            </span>
          </Link>

          {/* Right: Auth Links */}
          <div className="flex items-center gap-4 sm:gap-6">
            {isAuthenticated ? (
              <Link
                to="/app"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white text-black text-sm font-medium transition-opacity hover:opacity-90 shadow-xs"
              >
                <span>Open app</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-normal text-neutral-400 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-1.5 rounded-full bg-white text-black text-sm font-medium transition-opacity hover:opacity-90 shadow-xs"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. Main Content */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-6 sm:px-8 py-12 sm:py-16 space-y-16">
        {/* Section 1: About StashBox */}
        <section className="space-y-4">
          <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-semibold tracking-[-1.5px] text-white leading-[1.15]">
            About StashBox
          </h1>
          <p className="text-base sm:text-lg text-neutral-300 font-normal leading-relaxed">
            StashBox is a bookmark management system designed to help users save, organize, and manage useful web links in one place.
          </p>
          <p className="text-sm sm:text-base text-neutral-400 font-normal leading-relaxed">
            It provides a clean, focused workspace where you can save important URLs, organize them into structured collections, and quickly access the links you want to keep without noise or distractions.
          </p>
        </section>

        {/* Section 2: How It Works */}
        <section className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
            How It Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {/* Step 1: Save */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#111622] p-5 sm:p-6 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <Bookmark className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-base font-semibold text-white">Save</h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Save useful URLs and bookmarks you want to keep.
              </p>
            </div>

            {/* Step 2: Organize */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#111622] p-5 sm:p-6 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Folder className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-base font-semibold text-white">Organize</h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Organize your bookmarks so related links stay easy to manage.
              </p>
            </div>

            {/* Step 3: Access */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#111622] p-5 sm:p-6 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Zap className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-base font-semibold text-white">Access</h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Quickly access your saved links whenever you need them.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: About the Developer */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
            About the Developer
          </h2>
          <div className="rounded-2xl border border-white/[0.08] bg-[#111622] p-6 sm:p-8 space-y-4">
            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
              StashBox was developed by Parth Jadhav, a Third-Year Computer Science (TYCS) student, as a university-level project.
            </p>
            <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
              The project was created to explore practical web application development and build a simple, useful solution for bookmark management.
            </p>
          </div>
        </section>

        {/* Section 4: Project Information */}
        <section className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
            Project Information
          </h2>
          <div className="rounded-2xl border border-white/[0.08] bg-[#111622] p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-500">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Project Type</span>
                </div>
                <div className="text-sm sm:text-base font-medium text-white">
                  University Project
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-500">
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Purpose</span>
                </div>
                <div className="text-sm sm:text-base font-medium text-white">
                  Bookmark Management System
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-500">
                  <User className="w-3.5 h-3.5" />
                  <span>Developer</span>
                </div>
                <div className="text-sm sm:text-base font-medium text-white">
                  Parth Jadhav
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-500">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Program</span>
                </div>
                <div className="text-sm sm:text-base font-medium text-white">
                  Third-Year Computer Science (TYCS)
                </div>
              </div>
            </div>

            {/* Technologies */}
            <div className="pt-4 border-t border-white/[0.06] space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-500">
                <Code className="w-3.5 h-3.5" />
                <span>Technologies</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {techStack.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-white/[0.05] border border-white/[0.08] text-neutral-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Call to Action */}
        <section className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl border border-white/[0.08] bg-[#111622]">
          <div className="text-center sm:text-left space-y-1">
            <h3 className="text-base sm:text-lg font-semibold text-white">
              Ready to organize your bookmarks?
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400">
              Start saving and managing your links with StashBox today.
            </p>
          </div>
          <Link
            to={isAuthenticated ? '/app' : '/signup'}
            className="px-5 py-2.5 rounded-full bg-white text-black font-medium text-sm transition-opacity hover:opacity-90 inline-flex items-center gap-2 shadow-xs cursor-pointer flex-shrink-0"
          >
            <span>{isAuthenticated ? 'Open app' : 'Try It now'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </section>
      </main>

      {/* 3. Footer */}
      <footer className="w-full border-t border-white/[0.06] py-8 mt-12">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left Side: Brand Title & Copyright */}
          <div className="text-center sm:text-left">
            <h2 className="text-sm font-bold text-white tracking-tight">Stashbox</h2>
            <p className="text-xs text-neutral-500 mt-1">
              © {new Date().getFullYear()} Stashbox
            </p>
          </div>

          {/* Right Side: Links */}
          <div className="flex items-center gap-6 text-sm text-neutral-400">
            <Link to="/about" className="text-xs hover:text-white transition-colors">
              About
            </Link>
            <a
              href="https://github.com"
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
              href="mailto:contact@stashbox.dev"
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
