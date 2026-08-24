import { Menu, Search, X, Plus } from 'lucide-react'

export default function TopNavbar({
  searchQuery,
  setSearchQuery,
  viewTitle = 'All bookmarks',
  onOpenAddModal,
  onToggleMobileSidebar,
  searchInputRef
}) {
  const isMac = typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/i.test(navigator?.platform || navigator?.userAgent || '')
  const shortcutLabel = isMac ? '⌘K' : 'Ctrl K'

  return (
    <header className="border-b border-[var(--rd-border)] bg-[var(--rd-toolbar-bg)] select-none sticky top-0 z-30 flex-shrink-0">
      <div className="h-13 px-4 sm:px-6 flex items-center justify-between gap-3">
        {/* Left: Mobile Toggle & Substantial Search Bar */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-1.5 rounded-lg text-[var(--rd-text-secondary)] hover:text-[var(--rd-text-primary)] hover:bg-[var(--rd-bg-hover)] transition-colors cursor-pointer"
            aria-label="Toggle mobile menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Calibrated Primary Search Bar */}
          <div className="relative w-full max-w-sm sm:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--rd-text-muted)]">
              <Search className="w-4 h-4" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search in ${viewTitle}...`}
              className="w-full h-9 pl-9.5 pr-14 bg-[var(--rd-bg-sidebar)] hover:bg-[var(--rd-bg-hover)] focus:bg-[var(--rd-bg-sidebar)] border border-[var(--rd-border)] focus:border-[var(--rd-accent-gold)] focus:ring-1 focus:ring-[var(--rd-accent-gold)]/30 rounded-lg text-[13.5px] text-[var(--rd-text-primary)] placeholder-[var(--rd-text-muted)] focus:outline-none transition-all shadow-2xs"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[var(--rd-text-muted)] hover:text-[var(--rd-text-primary)] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-medium text-[var(--rd-text-muted)] bg-[var(--rd-bg-card)] border border-[var(--rd-border)] rounded-md">
                  {shortcutLabel}
                </kbd>
              </div>
            )}
          </div>
        </div>

        {/* Right: Primary + Add CTA Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 h-8.5 px-3.5 rounded-lg bg-[var(--rd-accent-gold)] hover:bg-[var(--rd-accent-gold-hover)] active:scale-[0.98] text-[var(--rd-accent-gold-text)] text-[13px] font-semibold shadow-xs transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--rd-accent-gold)]/30"
          >
            <Plus className="w-4 h-4 stroke-[2.25]" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </header>
  )
}
