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
  viewTitle = 'All',
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

  return (
    <header className="border-b border-[var(--rd-border)] bg-[var(--rd-toolbar-bg)] select-none sticky top-0 z-30">
      {/* Top Main Row */}
      <div className="h-11 px-3 sm:px-4 flex items-center justify-between gap-3">
        {/* Left: Mobile Toggle & Collection Icon & Search Bar */}
        <div className="flex items-center gap-2 flex-1 max-w-xl">
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-1.5 rounded-lg text-[var(--rd-text-secondary)] hover:text-[var(--rd-text-primary)] hover:bg-[var(--rd-bg-hover)] transition-colors cursor-pointer"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Collection Icon Badge */}
          {activeCollection ? (
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 text-white shadow-xs"
              style={{ backgroundColor: activeCollection.color || '#3b82f6' }}
            >
              <CollectionIcon
                icon={activeCollection.icon || 'folder'}
                color="#ffffff"
                className="w-3.5 h-3.5"
              />
            </div>
          ) : null}

          {/* Search Box */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-[var(--rd-text-muted)]">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search in ${viewTitle}...`}
              className="w-full pl-8 pr-7 py-1 bg-transparent hover:bg-[var(--rd-bg-hover)] focus:bg-[var(--rd-bg-card)] border border-transparent focus:border-[var(--rd-border)] rounded-md text-xs text-[var(--rd-text-primary)] placeholder-[var(--rd-text-muted)] focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-2 flex items-center text-[var(--rd-text-muted)] hover:text-[var(--rd-text-primary)] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Quick Add button */}
          <button
            type="button"
            onClick={onOpenAddModal}
            className="flex items-center gap-1 h-7 px-2.5 rounded-md bg-[var(--rd-accent-blue)] hover:bg-blue-600 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add</span>
          </button>

          {/* Sort Dropdown */}
          <div className="relative" ref={sortRef}>
            <button
              type="button"
              onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
              className="p-1.5 rounded-md text-[var(--rd-text-secondary)] hover:text-[var(--rd-text-primary)] hover:bg-[var(--rd-bg-hover)] transition-colors cursor-pointer"
              title="Sort bookmarks"
            >
              <Clock className="w-4 h-4" />
            </button>

            {sortDropdownOpen && (
              <div className="absolute right-0 mt-1 w-40 bg-[var(--rd-bg-card)] border border-[var(--rd-border)] rounded-xl shadow-xl p-1 z-50 text-xs">
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase text-[var(--rd-text-muted)]">
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
              className="flex items-center gap-1.5 h-7 px-2 rounded-md text-xs font-medium text-[var(--rd-text-secondary)] hover:text-[var(--rd-text-primary)] hover:bg-[var(--rd-bg-hover)] transition-colors cursor-pointer"
            >
              <span className="capitalize">{viewMode}</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {viewDropdownOpen && (
              <div className="absolute right-0 mt-1 w-36 bg-[var(--rd-bg-card)] border border-[var(--rd-border)] rounded-xl shadow-xl p-1 z-50 text-xs">
                {[
                  { id: 'masonry', label: 'Masonry', icon: Columns },
                  { id: 'list', label: 'List View', icon: List },
                  { id: 'grid', label: 'Cards Grid', icon: LayoutGrid }
                ].map((v) => {
                  const Icon = v.icon
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => {
                        setViewMode(v.id)
                        setViewDropdownOpen(false)
                      }}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                        viewMode === v.id
                          ? 'bg-[var(--rd-accent-blue)] text-white font-semibold'
                          : 'text-[var(--rd-text-primary)] hover:bg-[var(--rd-bg-hover)]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{v.label}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sub-Header Metadata / Stats bar (Matching Screenshot 2 & 3) */}
      <div className="h-6 px-4 bg-[var(--rd-bg-main)] border-t border-[var(--rd-border-subtle)] flex items-center text-[11px] text-[var(--rd-text-secondary)] font-mono gap-3 overflow-x-auto whitespace-nowrap">
        <span>{itemCount} {itemCount === 1 ? 'bookmark' : 'bookmarks'}</span>
        <span className="opacity-40">•</span>
        <span>{viewTitle}</span>
      </div>
    </header>
  )
}
