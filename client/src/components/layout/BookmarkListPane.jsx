import { useState, useRef, useEffect } from 'react'
import {
  Globe,
  Heart,
  ExternalLink,
  Plus,
  Bookmark,
  Folder,
  Edit3,
  Trash2,
  Clock,
  ChevronDown,
  LayoutGrid,
  List,
  Columns,
  Cloud,
  Inbox,
  Archive
} from 'lucide-react'
import CollectionIcon from '../common/CollectionIcon.jsx'

export default function BookmarkListPane({
  bookmarks = [],
  isLoading = false,
  viewTitle = 'All bookmarks',
  activeCollection,
  activeView = 'all',
  viewMode = 'grid', // 'grid' (moodboard) | 'masonry' | 'list'
  setViewMode,
  sortBy = 'date_desc',
  setSortBy,
  selectedBookmarkId,
  onSelectBookmark,
  onEditBookmark,
  onToggleFavorite,
  onDeleteBookmark,
  onOpenAddModal
}) {
  const [failedImages, setFailedImages] = useState({})
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false)
  const [viewDropdownOpen, setViewDropdownOpen] = useState(false)
  const [deletingBookmark, setDeletingBookmark] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const sortRef = useRef(null)
  const viewRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setSortDropdownOpen(false)
      }
      if (viewRef.current && !viewRef.current.contains(e.target)) {
        setViewDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close delete confirmation on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && deletingBookmark && !isDeleting) {
        setDeletingBookmark(null)
      }
    }
    if (deletingBookmark) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [deletingBookmark, isDeleting])

  const handleImageError = (id) => {
    setFailedImages(prev => ({ ...prev, [id]: true }))
  }

  // Format created date compactly (e.g. "4 Aug" or "12 Jan 2025")
  const formatDateCompact = (dateStr) => {
    if (!dateStr) return ''
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
    } catch {
      return ''
    }
  }

  // Render view title icon
  const renderViewIcon = () => {
    if (activeCollection) {
      return <CollectionIcon icon={activeCollection.icon || '📁'} className="w-5.5 h-5.5 flex-shrink-0" />
    }
    if (activeView === 'unsorted') {
      return <Inbox className="w-5.5 h-5.5 text-[var(--rd-text-secondary)] flex-shrink-0" />
    }
    if (activeView === 'favorites') {
      return <Heart className="w-5.5 h-5.5 text-rose-500 fill-rose-500 flex-shrink-0" />
    }
    if (activeView === 'archive') {
      return <Archive className="w-5.5 h-5.5 text-[var(--rd-text-secondary)] flex-shrink-0" />
    }
    return <Cloud className="w-5.5 h-5.5 text-[var(--rd-text-secondary)] flex-shrink-0" />
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto px-5 sm:px-8 py-5 w-full bg-[var(--rd-bg-main)]">
      {/* 1. Sub-Header: Collection / View Title & Sort Controls */}
      <div className="flex items-center justify-between pb-4 mb-1 select-none flex-shrink-0">
        {/* Left: View Icon & Strong Title */}
        <div className="flex items-center gap-3 min-w-0">
          {renderViewIcon()}
          <h2 className="text-lg sm:text-[20px] font-bold text-[var(--rd-text-primary)] tracking-tight truncate">
            {viewTitle}
          </h2>
        </div>

        {/* Right: Sort & Layout Controls */}
        <div className="flex items-center gap-2 text-[13px] text-[var(--rd-text-secondary)] flex-shrink-0">
          {/* Sort Dropdown */}
          <div className="relative" ref={sortRef}>
            <button
              type="button"
              onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
              className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg hover:text-[var(--rd-text-primary)] hover:bg-[var(--rd-bg-hover)] transition-colors cursor-pointer"
            >
              <Clock className="w-4 h-4" />
              <span>
                {sortBy === 'date_desc' ? 'By date' : sortBy === 'date_asc' ? 'Oldest' : 'By title'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[var(--rd-text-muted)]" />
            </button>

            {sortDropdownOpen && (
              <div className="absolute right-0 mt-1 w-40 bg-[var(--rd-bg-card)] border border-[var(--rd-border)] rounded-xl shadow-2xl py-1.5 z-50 text-[13px] text-[var(--rd-text-primary)] animate-in zoom-in-95 duration-100">
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
                      setSortBy?.(opt.value)
                      setSortDropdownOpen(false)
                    }}
                    className={`w-full text-left px-3.5 py-2 hover:bg-[var(--rd-bg-hover)] cursor-pointer transition-colors ${
                      sortBy === opt.value ? 'text-[var(--rd-accent-gold)] font-semibold' : ''
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* View Mode Switcher */}
          <div className="relative" ref={viewRef}>
            <button
              type="button"
              onClick={() => setViewDropdownOpen(!viewDropdownOpen)}
              className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg hover:text-[var(--rd-text-primary)] hover:bg-[var(--rd-bg-hover)] transition-colors cursor-pointer"
            >
              {viewMode === 'grid' && <LayoutGrid className="w-4 h-4" />}
              {viewMode === 'masonry' && <Columns className="w-4 h-4" />}
              {viewMode === 'list' && <List className="w-4 h-4" />}
              <span>{viewMode === 'grid' ? 'Moodboard' : viewMode === 'masonry' ? 'Masonry' : 'List'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[var(--rd-text-muted)]" />
            </button>

            {viewDropdownOpen && (
              <div className="absolute right-0 mt-1 w-40 bg-[var(--rd-bg-card)] border border-[var(--rd-border)] rounded-xl shadow-2xl py-1.5 z-50 text-[13px] text-[var(--rd-text-primary)] animate-in zoom-in-95 duration-100">
                {[
                  { value: 'grid', label: 'Moodboard', icon: LayoutGrid },
                  { value: 'masonry', label: 'Masonry', icon: Columns },
                  { value: 'list', label: 'List View', icon: List }
                ].map((opt) => {
                  const Icon = opt.icon
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setViewMode?.(opt.value)
                        setViewDropdownOpen(false)
                      }}
                      className={`w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-[var(--rd-bg-hover)] cursor-pointer transition-colors ${
                        viewMode === opt.value ? 'text-[var(--rd-accent-gold)] font-semibold' : ''
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{opt.label}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Loading Skeleton */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-xl bg-[var(--rd-bg-card)] border border-[var(--rd-border)] p-3.5 animate-pulse flex items-center gap-3.5"
            >
              <div className="w-14 h-14 bg-[var(--rd-bg-hover)] rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-[var(--rd-bg-hover)] rounded w-1/3" />
                <div className="h-3 bg-[var(--rd-bg-hover)] rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* 3. Empty State */}
      {!isLoading && (!bookmarks || bookmarks.length === 0) ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[380px]">
          <div className="w-14 h-14 rounded-2xl bg-[var(--rd-bg-card)] border border-[var(--rd-border)] flex items-center justify-center mb-3.5 text-[var(--rd-text-muted)] shadow-xs">
            <Bookmark className="w-7 h-7" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-[var(--rd-text-primary)] mb-1">
            No bookmarks here
          </h3>
          <p className="text-[13.5px] text-[var(--rd-text-secondary)] max-w-sm mb-5 leading-relaxed">
            Save web links, inspirations, and articles to organize them in Stashbox.
          </p>
          <button
            type="button"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-2 h-8.5 px-4 rounded-lg bg-[var(--rd-accent-gold)] hover:bg-[var(--rd-accent-gold-hover)] active:scale-[0.98] text-[var(--rd-accent-gold-text)] text-[13px] font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.25]" />
            <span>Add Bookmark</span>
          </button>
        </div>
      ) : null}

      {/* 4. List View */}
      {!isLoading && bookmarks && bookmarks.length > 0 && viewMode === 'list' ? (
        <div className="w-full divide-y divide-[var(--rd-border-subtle)]">
          {bookmarks.map((bm) => {
            const isSelected = selectedBookmarkId === bm.id
            const hasValidCover = bm.preview_image_url && !failedImages[bm.id]
            const collectionName = bm.collections?.name || 'Unsorted'
            const formattedDate = formatDateCompact(bm.created_at)

            return (
              <div
                key={bm.id}
                onClick={() => onSelectBookmark?.(bm)}
                className={`
                  group px-3.5 py-2.5 transition-colors cursor-pointer flex items-center justify-between gap-3.5 select-none rounded-lg
                  ${
                    isSelected
                      ? 'bg-[var(--rd-item-active-bg)] text-[var(--rd-item-active-text)] font-medium'
                      : 'hover:bg-[var(--rd-bg-hover)] text-[var(--rd-text-primary)]'
                  }
                `}
              >
                {/* Left: Thumbnail & Info */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  {/* Thumbnail Box */}
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg overflow-hidden bg-[var(--rd-bg-card)] border border-[var(--rd-border)] flex items-center justify-center flex-shrink-0">
                    {hasValidCover ? (
                      <img
                        src={bm.preview_image_url}
                        alt={bm.title || ''}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={() => handleImageError(bm.id)}
                      />
                    ) : bm.favicon_url ? (
                      <img src={bm.favicon_url} alt="" className="w-5 h-5 object-contain" />
                    ) : (
                      <Globe className="w-5 h-5 text-[var(--rd-text-muted)]" />
                    )}
                  </div>

                  {/* Title & Metadata */}
                  <div className="min-w-0 flex-1">
                    <h4 className="text-[13.5px] sm:text-[14px] font-semibold tracking-tight leading-snug truncate">
                      {bm.title || bm.url}
                    </h4>
                    <div className="flex items-center gap-2 text-[12px] text-[var(--rd-text-muted)] mt-0.5 truncate">
                      <span className="inline-flex items-center gap-1 truncate max-w-[130px]">
                        <Folder className="w-3.5 h-3.5 opacity-70 flex-shrink-0" />
                        <span className="truncate">{collectionName}</span>
                      </span>
                      <span>•</span>
                      <span className="font-mono truncate">{bm.domain}</span>
                      {formattedDate ? (
                        <>
                          <span>•</span>
                          <span>{formattedDate}</span>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Right Action Icons: [Edit] [Favorite] [Open] [Delete] */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEditBookmark?.(bm)
                    }}
                    className="p-1.5 rounded-md text-[var(--rd-text-muted)] hover:text-[var(--rd-text-primary)] hover:bg-[var(--rd-bg-hover)] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Edit Bookmark Details"
                    aria-label="Edit bookmark"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggleFavorite?.(bm.id)
                    }}
                    className={`p-1.5 rounded-md transition-opacity cursor-pointer ${
                      bm.is_favorite
                        ? 'text-rose-500 fill-rose-500'
                        : 'text-[var(--rd-text-muted)] hover:text-rose-500 opacity-0 group-hover:opacity-100'
                    }`}
                    title={bm.is_favorite ? 'Remove Favorite' : 'Add to Favorites'}
                    aria-label={bm.is_favorite ? 'Remove Favorite' : 'Add to Favorites'}
                  >
                    <Heart className={`w-4 h-4 ${bm.is_favorite ? 'fill-current' : ''}`} />
                  </button>

                  <a
                    href={bm.url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 rounded-md text-[var(--rd-text-muted)] hover:text-[var(--rd-text-primary)] hover:bg-[var(--rd-bg-hover)] opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Open Link in New Tab"
                    aria-label="Open link in new tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeletingBookmark(bm)
                    }}
                    className="p-1.5 rounded-md text-[var(--rd-text-muted)] hover:text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                    title="Delete Bookmark"
                    aria-label="Delete bookmark"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}

          <div className="pt-6 pb-2 text-center text-[12.5px] text-[var(--rd-text-muted)] select-none">
            {bookmarks.length} {bookmarks.length === 1 ? 'bookmark' : 'bookmarks'}
          </div>
        </div>
      ) : null}

      {/* 5. Moodboard (Cards Grid) & Masonry View */}
      {!isLoading && bookmarks && bookmarks.length > 0 && viewMode !== 'list' ? (
        <div className="w-full">
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4' : 'masonry-grid'}>
            {bookmarks.map((bm) => {
              const isSelected = selectedBookmarkId === bm.id
              const hasValidCover = bm.preview_image_url && !failedImages[bm.id]
              const collectionName = bm.collections?.name || 'Unsorted'
              const formattedDate = formatDateCompact(bm.created_at)

              return (
                <div
                  key={bm.id}
                  onClick={() => onSelectBookmark?.(bm)}
                  className={`
                    group relative bg-[var(--rd-bg-card)] border rounded-xl overflow-hidden cursor-pointer transition-all duration-150 flex flex-col justify-between
                    ${viewMode === 'masonry' ? 'masonry-item' : ''}
                    ${
                      isSelected
                        ? 'border-[var(--rd-accent-gold)] ring-1 ring-[var(--rd-accent-gold)]/40 shadow-sm'
                        : 'border-[var(--rd-border)] hover:border-[var(--rd-border-hover)]'
                    }
                  `}
                >
                  {/* Thumbnail / Cover Box */}
                  <div className="w-full h-44 sm:h-48 relative overflow-hidden bg-[#16171a] flex items-center justify-center flex-shrink-0">
                    {hasValidCover ? (
                      <img
                        src={bm.preview_image_url}
                        alt={bm.title || ''}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-200"
                        loading="lazy"
                        onError={() => handleImageError(bm.id)}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2 p-4 text-center select-none">
                        {bm.favicon_url ? (
                          <img src={bm.favicon_url} alt="" className="w-9 h-9 rounded object-contain" />
                        ) : (
                          <Globe className="w-8 h-8 text-[var(--rd-text-muted)]" />
                        )}
                        <span className="text-[12.5px] font-mono font-medium text-[var(--rd-text-muted)] truncate max-w-[150px]">
                          {bm.domain}
                        </span>
                      </div>
                    )}

                    {/* Hover Overlay Button Bar: [Edit] [Favorite] [Open] [Delete] */}
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 backdrop-blur-xs p-1 rounded-lg">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onEditBookmark?.(bm)
                        }}
                        className="p-1.5 rounded-md text-white hover:text-[var(--rd-accent-gold)] cursor-pointer transition-colors"
                        title="Edit Bookmark Details"
                        aria-label="Edit bookmark"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onToggleFavorite?.(bm.id)
                        }}
                        className={`p-1.5 rounded-md text-white hover:text-rose-400 cursor-pointer transition-colors ${
                          bm.is_favorite ? 'text-rose-500 fill-rose-500' : ''
                        }`}
                        title={bm.is_favorite ? 'Remove Favorite' : 'Add to Favorites'}
                        aria-label={bm.is_favorite ? 'Remove Favorite' : 'Add to Favorites'}
                      >
                        <Heart className={`w-4 h-4 ${bm.is_favorite ? 'fill-current' : ''}`} />
                      </button>
                      <a
                        href={bm.url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-md text-white hover:text-[var(--rd-accent-gold)] transition-colors"
                        title="Open Link in New Tab"
                        aria-label="Open link in new tab"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeletingBookmark(bm)
                        }}
                        className="p-1.5 rounded-md text-white hover:text-rose-400 hover:bg-rose-500/20 cursor-pointer transition-colors"
                        title="Delete Bookmark"
                        aria-label="Delete bookmark"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Lower Info Details */}
                  <div className="p-3.5 sm:p-4">
                    <h4 className="text-[14px] sm:text-[14.5px] font-bold text-[var(--rd-text-primary)] leading-snug line-clamp-2 mb-1.5 group-hover:text-[var(--rd-text-primary)] transition-colors">
                      {bm.title || bm.url}
                    </h4>

                    {/* Single-line Metadata: Collection • Domain • Date */}
                    <div className="flex items-center gap-2 text-[12px] text-[var(--rd-text-muted)] truncate">
                      <span className="inline-flex items-center gap-1.5 truncate max-w-[120px]">
                        <Folder className="w-3.5 h-3.5 opacity-70 flex-shrink-0" />
                        <span className="truncate">{collectionName}</span>
                      </span>
                      <span>•</span>
                      <span className="truncate">{bm.domain}</span>
                      {formattedDate ? (
                        <>
                          <span>•</span>
                          <span className="flex-shrink-0">{formattedDate}</span>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Bottom Total Counter */}
          <div className="pt-8 pb-4 text-center text-[12.5px] text-[var(--rd-text-muted)] select-none">
            {bookmarks.length} {bookmarks.length === 1 ? 'bookmark' : 'bookmarks'}
          </div>
        </div>
      ) : null}

      {/* 6. Bookmark Delete Confirmation Dialog */}
      {deletingBookmark && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in-0 duration-100"
          onClick={() => !isDeleting && setDeletingBookmark(null)}
        >
          <div
            className="bg-[var(--rd-bg-card)] border border-[var(--rd-border)] rounded-xl w-full max-w-sm overflow-hidden shadow-2xl p-5 select-none animate-in zoom-in-95 duration-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-500 flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-[var(--rd-text-primary)]">
                  Delete bookmark?
                </h3>
                <p className="text-xs text-[var(--rd-text-secondary)] mt-0.5">
                  This bookmark will be permanently deleted.
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-[13px] text-[var(--rd-text-secondary)] bg-[var(--rd-bg-sidebar)] p-3 rounded-lg border border-[var(--rd-border-subtle)] my-3.5 break-all">
              Are you sure you want to delete <span className="font-semibold text-[var(--rd-text-primary)]">"{deletingBookmark.title || deletingBookmark.url}"</span>?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingBookmark(null)}
                className="px-3.5 py-2 rounded-lg text-xs sm:text-[13px] font-medium text-[var(--rd-text-secondary)] hover:text-[var(--rd-text-primary)] hover:bg-[var(--rd-bg-hover)] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={async () => {
                  if (isDeleting) return
                  setIsDeleting(true)
                  try {
                    await onDeleteBookmark?.(deletingBookmark.id)
                    setDeletingBookmark(null)
                  } finally {
                    setIsDeleting(false)
                  }
                }}
                className="px-4 py-2 rounded-lg text-xs sm:text-[13px] font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
