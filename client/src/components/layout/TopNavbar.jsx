import { useState } from 'react'
import {
  Menu,
  Search,
  Plus,
  SlidersHorizontal,
  LayoutList,
  LayoutGrid,
  ArrowUpDown,
  X,
  Bookmark
} from 'lucide-react'

export default function TopNavbar({
  searchQuery,
  setSearchQuery,
  viewTitle = 'All bookmarks',
  viewSubtitle = '',
  itemCount = 0,
  viewMode = 'list',
  setViewMode,
  sortBy = 'date_desc',
  setSortBy,
  onOpenAddModal,
  onToggleMobileSidebar
}) {
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false)

  const sortOptions = [
    { value: 'date_desc', label: 'By date (newest)' },
    { value: 'date_asc', label: 'By date (oldest)' },
    { value: 'title_asc', label: 'By title (A-Z)' },
    { value: 'title_desc', label: 'By title (Z-A)' }
  ]

  const currentSortLabel = sortOptions.find(o => o.value === sortBy)?.label || 'By date'

  return (
    <header className="h-14 border-b border-slate-800/80 bg-[#0e121a]/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-3 sticky top-0 z-30 select-none">
      {/* Left: Mobile Toggle & View Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <h1 className="text-sm sm:text-base font-bold text-slate-100 truncate">
            {viewTitle}
          </h1>
          {itemCount !== undefined && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono font-medium hidden sm:inline-block">
              {itemCount}
            </span>
          )}
        </div>
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-md mx-2 sm:mx-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bookmarks, tags, URLs..."
            className="w-full pl-9 pr-8 py-1.5 bg-slate-900/80 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right Controls: Sort, View Switcher, Add Bookmark */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
        {/* Sort Dropdown */}
        <div className="relative hidden md:block">
          <button
            type="button"
            onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 transition-colors cursor-pointer"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate max-w-[110px]">{currentSortLabel}</span>
          </button>

          {sortDropdownOpen && (
            <div className="absolute right-0 mt-1 w-44 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl p-1 z-50 text-xs">
              {sortOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setSortBy(opt.value)
                    setSortDropdownOpen(false)
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    sortBy === opt.value
                      ? 'bg-indigo-600/20 text-indigo-300 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* View Mode Toggle (List vs Grid) */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              viewMode === 'list'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="List view"
          >
            <LayoutList className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Grid / Card view"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Add Bookmark CTA */}
        <button
          type="button"
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add</span>
        </button>
      </div>
    </header>
  )
}
