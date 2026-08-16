import { useState, useRef, useEffect } from 'react'
import {
  Menu,
  Search,
  X,
  Clock,
  ChevronDown,
  LayoutGrid,
  List,
  Columns,
  ArrowUpDown,
  Plus
} from 'lucide-react'
import CollectionIcon from '../common/CollectionIcon.jsx'

export default function TopNavbar({
  searchQuery,
  setSearchQuery,
  viewTitle = 'All bookmarks',
  activeCollection,
  itemCount = 0,
  viewMode = 'masonry', // 'masonry' | 'list' | 'grid'
  setViewMode,
  sortBy = 'date_desc',
  setSortBy,
  onOpenAddModal,
  onToggleMobileSidebar,
  searchInputRef
}) {
  const [viewDropdownOpen, setViewDropdownOpen] = useState(false)
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false)
  const viewRef = useRef(null)
  const sortRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (viewRef.current && !viewRef.current.contains(e.target)) {
        setViewDropdownOpen(false)
      }
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setSortDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isMac = typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/i.test(navigator?.platform || navigator?.userAgent || '')
  const shortcutLabel = isMac ? '⌘K' : 'Ctrl K'

  return (
    <header className="border-b border-[var(--rd-border)] bg-[var(--rd-toolbar-bg)] select-none sticky top-0 z-30">
      <div className="h-14 px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Collection Icon & Search Bar */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-lg text-[var(--rd-text-secondary)] hover:text-[var(--rd-text-primary)] hover:bg-[var(--rd-bg-hover)] transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Collection Icon Badge */}
          {activeCollection ? (
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-white shadow-xs"
              style={{ backgroundColor: activeCollection.color || '#3b82f6' }}
            >
              <CollectionIcon
                icon={activeCollection.icon || 'folder'}
                color="#ffffff"
                className="w-4 h-4"
              />
            </div>
          ) : null}

          {/* Polished Primary Search Bar */}
          <div className="relative flex-1 max-w-md lg:max-w-lg">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--rd-text-muted)]">
              <Search className="w-4 h-4" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search in ${viewTitle}...`}
              className="w-full h-9 pl-9 pr-14 bg-[var(--rd-bg-main)]/60 hover:bg-[var(--rd-bg-main)] focus:bg-[var(--rd-bg-card)] border border-[var(--rd-border)] focus:border-[var(--rd-accent-blue)] focus:ring-2 focus:ring-[var(--rd-accent-blue)]/20 rounded-xl text-xs sm:text-[13px] text-[var(--rd-text-primary)] placeholder-[var(--rd-text-muted)] focus:outline-none transition-all shadow-2xs"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--rd-text-muted)] hover:text-[var(--rd-text-primary)] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-medium text-[var(--rd-text-muted)] bg-[var(--rd-bg-hover)] border border-[var(--rd-border)] rounded-md">
                  {shortcutLabel}
                </kbd>
              </div>
            )}
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {/* Quick Add button */}
          <button
            type="button"
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 h-8 px-3.5 rounded-lg bg-[var(--rd-accent-blue)] hover:bg-blue-600 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>

          {/* Sort Dropdown */}
          <div className="relative" ref={sortRef}>
            <button
              type="button"
              onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
              className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-medium text-[var(--rd-text-secondary)] hover:text-[var(--rd-text-primary)] hover:bg-[var(--rd-bg-hover)] border border-transparent hover:border-[var(--rd-border)] transition-colors cursor-pointer"
              title="Sort bookmarks"
            >
              <Clock className="w-4 h-4" />
              <span className="hidden md:inline text-xs">
                {sortBy === 'date_desc' ? 'By date' : sortBy === 'date_asc' ? 'Oldest' : 'By title'}
              </span>
              <ChevronDown className="w-3 h-3 text-[var(--rd-text-muted)]" />
            </button>

            {sortDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-44 bg-[var(--rd-bg-card)] border border-[var(--rd-border)] rounded-xl shadow-xl p-1.5 z-50 text-xs">
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--rd-text-muted)]">
                  Sort By
                </div>
                {[
                  { value: 'date_desc', label: 'Newest First' },
                  { value: 'date_asc', label: 'Oldest First' },
                  { value: 'title_asc', label: 'Title (A-Z)' },
                  { value: 'title_desc', label: 'Title (Z-A)' }
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setSortBy(opt.value)
                      setSortDropdownOpen(false)
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                      sortBy === opt.value
                        ? 'bg-[var(--rd-accent-blue)] text-white font-semibold'
                        : 'text-[var(--rd-text-primary)] hover:bg-[var(--rd-bg-hover)]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* View Selector (Raindrop Style) */}
          <div className="relative" ref={viewRef}>
            <button
              type="button"
              onClick={() => setViewDropdownOpen(!viewDropdownOpen)}
              className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-medium text-[var(--rd-text-secondary)] hover:text-[var(--rd-text-primary)] hover:bg-[var(--rd-bg-hover)] border border-transparent hover:border-[var(--rd-border)] transition-colors cursor-pointer"
            >
              {viewMode === 'masonry' && <Columns className="w-3.5 h-3.5" />}
              {viewMode === 'list' && <List className="w-3.5 h-3.5" />}
              {viewMode === 'grid' && <LayoutGrid className="w-3.5 h-3.5" />}
              <span className="capitalize hidden sm:inline">{viewMode}</span>
              <ChevronDown className="w-3 h-3 text-[var(--rd-text-muted)]" />
            </button>

            {viewDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-40 bg-[var(--rd-bg-card)] border border-[var(--rd-border)] rounded-xl shadow-xl p-1.5 z-50 text-xs">
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--rd-text-muted)]">
                  Layout
                </div>
                {[
                  { value: 'list', label: 'List View', icon: List },
                  { value: 'masonry', label: 'Masonry', icon: Columns },
                  { value: 'grid', label: 'Cards Grid', icon: LayoutGrid }
                ].map((opt) => {
                  const Icon = opt.icon
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setViewMode(opt.value)
                        setViewDropdownOpen(false)
                      }}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                        viewMode === opt.value
                          ? 'bg-[var(--rd-accent-blue)] text-white font-semibold'
                          : 'text-[var(--rd-text-primary)] hover:bg-[var(--rd-bg-hover)]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{opt.label}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
