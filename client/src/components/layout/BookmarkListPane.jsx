import { useState } from 'react'
import {
  Globe,
  Heart,
  ExternalLink,
  Plus,
  Bookmark
} from 'lucide-react'

export default function BookmarkListPane({
  bookmarks = [],
  isLoading = false,
  viewMode = 'masonry', // 'masonry' | 'list' | 'grid'
  selectedBookmarkId,
  onSelectBookmark,
  onToggleFavorite,
  onToggleArchive,
  onOpenAddModal
}) {
  const [failedImages, setFailedImages] = useState({})

  const handleImageError = (id) => {
    setFailedImages(prev => ({ ...prev, [id]: true }))
  }

  if (isLoading) {
    return (
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
        <div className="masonry-grid">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="masonry-item rounded-xl bg-[var(--rd-bg-card)] border border-[var(--rd-border)] p-3 animate-pulse space-y-3"
            >
              <div
                className="w-full bg-[var(--rd-bg-hover)] rounded-lg"
                style={{ height: `${120 + (i % 3) * 60}px` }}
              />
              <div className="h-4 bg-[var(--rd-bg-hover)] rounded w-3/4" />
              <div className="h-3 bg-[var(--rd-bg-hover)] rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!bookmarks || bookmarks.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[400px]">
        <div className="w-16 h-16 rounded-2xl bg-[var(--rd-bg-card)] border border-[var(--rd-border)] flex items-center justify-center mb-4 text-[var(--rd-text-muted)] shadow-xs">
          <Bookmark className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-[var(--rd-text-primary)] mb-1">
          No bookmarks here
        </h3>
        <p className="text-xs text-[var(--rd-text-secondary)] max-w-sm mb-5">
          Save your favorite products, articles, inspirations, and websites to organize them in Stashbox.
        </p>
        <button
          type="button"
          onClick={onOpenAddModal}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--rd-accent-blue)] hover:bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Bookmark</span>
        </button>
      </div>
    )
  }

  // 1. Compact List View (Raindrop Screenshot 4 Replica)
  if (viewMode === 'list') {
    return (
      <div className="flex-1 overflow-y-auto divide-y divide-[var(--rd-border-subtle)] bg-[var(--rd-bg-main)]">
        {bookmarks.map((bm) => {
          const isSelected = selectedBookmarkId === bm.id
          const hasValidCover = bm.preview_image_url && !failedImages[bm.id]

          return (
            <div
              key={bm.id}
              onClick={() => onSelectBookmark?.(bm)}
              className={`
                group px-4 py-2.5 transition-colors cursor-pointer flex items-center justify-between gap-3 select-none
                ${
                  isSelected
                    ? 'bg-[var(--rd-accent-active)] text-white'
                    : 'hover:bg-[var(--rd-bg-hover)] text-[var(--rd-text-primary)]'
                }
              `}
            >
              {/* Left: Thumbnail & Info */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-11 h-11 rounded-lg overflow-hidden bg-[var(--rd-bg-card)] border border-[var(--rd-border)] flex items-center justify-center flex-shrink-0">
                  {hasValidCover ? (
                    <img
                      src={bm.preview_image_url}
                      alt={bm.title || ''}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={() => handleImageError(bm.id)}
                    />
                  ) : bm.favicon_url ? (
                    <img src={bm.favicon_url} alt="" className="w-5 h-5 rounded" />
                  ) : (
                    <Globe className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-[var(--rd-text-muted)]'}`} />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className={`text-xs font-semibold truncate ${isSelected ? 'text-white' : 'text-[var(--rd-text-primary)]'}`}>
                    {bm.title || bm.url}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] mt-0.5 truncate">
                    <span className={isSelected ? 'text-white/80' : 'text-[var(--rd-text-secondary)]'}>
                      {bm.domain}
                    </span>
                    {bm.collections?.name && (
                      <>
                        <span className="opacity-40">•</span>
                        <span className={isSelected ? 'text-white/90 font-medium' : 'text-[var(--rd-accent-blue)] font-medium'}>
                          {bm.collections.name}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Action Icons */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleFavorite?.(bm.id)
                  }}
                  className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                    bm.is_favorite
                      ? 'text-rose-500 fill-rose-500'
                      : isSelected
                      ? 'text-white/70 hover:text-white'
                      : 'text-[var(--rd-text-muted)] hover:text-rose-500 opacity-0 group-hover:opacity-100'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${bm.is_favorite ? 'fill-current' : ''}`} />
                </button>

                <a
                  href={bm.url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className={`p-1.5 rounded-md transition-colors ${
                    isSelected
                      ? 'text-white/80 hover:text-white'
                      : 'text-[var(--rd-text-muted)] hover:text-[var(--rd-text-primary)] opacity-0 group-hover:opacity-100'
                  }`}
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // 2. Masonry & Cards Grid View (Raindrop Screenshots 1, 2, 3 Replica)
  return (
    <div className="flex-1 p-3 sm:p-5 overflow-y-auto bg-[var(--rd-bg-main)]">
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5' : 'masonry-grid'}>
        {bookmarks.map((bm) => {
          const isSelected = selectedBookmarkId === bm.id
          const hasValidCover = bm.preview_image_url && !failedImages[bm.id]

          return (
            <div
              key={bm.id}
              onClick={() => onSelectBookmark?.(bm)}
              className={`
                group relative bg-[var(--rd-bg-card)] border rounded-xl overflow-hidden cursor-pointer transition-all duration-150 flex flex-col justify-between
                ${viewMode === 'masonry' ? 'masonry-item' : ''}
                ${
                  isSelected
                    ? 'border-[var(--rd-accent-blue)] ring-2 ring-[var(--rd-accent-blue)]/30 shadow-lg'
                    : 'border-[var(--rd-border)] hover:border-[var(--rd-text-secondary)] hover:shadow-md'
                }
              `}
            >
              {/* Cover Image (Real Scraped Page Image) */}
              {hasValidCover ? (
                <div className="w-full relative overflow-hidden bg-[var(--rd-bg-hover)]">
                  <img
                    src={bm.preview_image_url}
                    alt={bm.title || ''}
                    className="w-full h-auto object-cover max-h-72 group-hover:scale-102 transition-transform duration-200"
                    loading="lazy"
                    onError={() => handleImageError(bm.id)}
                  />
                  {/* Hover Overlay Button Bar */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-xs p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onToggleFavorite?.(bm.id)
                      }}
                      className={`p-1 rounded text-white hover:text-rose-400 cursor-pointer ${
                        bm.is_favorite ? 'text-rose-500 fill-rose-500' : ''
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${bm.is_favorite ? 'fill-current' : ''}`} />
                    </button>
                    <a
                      href={bm.url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1 rounded text-white hover:text-blue-400"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-[var(--rd-bg-hover)] border-b border-[var(--rd-border)] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {bm.favicon_url ? (
                      <img src={bm.favicon_url} alt="" className="w-5 h-5 rounded" />
                    ) : (
                      <Globe className="w-5 h-5 text-[var(--rd-text-muted)]" />
                    )}
                    <span className="text-xs font-mono font-medium text-[var(--rd-text-secondary)]">
                      {bm.domain}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggleFavorite?.(bm.id)
                    }}
                    className={`p-1 rounded hover:bg-black/10 cursor-pointer ${
                      bm.is_favorite ? 'text-rose-500' : 'text-[var(--rd-text-muted)]'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${bm.is_favorite ? 'fill-current' : ''}`} />
                  </button>
                </div>
              )}

              {/* Text Information */}
              <div className="p-3">
                <h4 className="text-xs font-bold text-[var(--rd-text-primary)] line-clamp-2 leading-snug mb-1 group-hover:text-[var(--rd-accent-blue)] transition-colors">
                  {bm.title || bm.url}
                </h4>

                {bm.description && (
                  <p className="text-[11px] text-[var(--rd-text-secondary)] line-clamp-2 leading-relaxed mb-2">
                    {bm.description}
                  </p>
                )}

                {/* Footer Metadata */}
                <div className="flex items-center justify-between pt-2 border-t border-[var(--rd-border-subtle)] text-[10px] text-[var(--rd-text-muted)]">
                  <div className="flex items-center gap-1.5 truncate">
                    {bm.favicon_url && (
                      <img src={bm.favicon_url} alt="" className="w-3.5 h-3.5 rounded-xs flex-shrink-0" />
                    )}
                    <span className="truncate">{bm.domain}</span>
                  </div>
                  {bm.collections?.name && (
                    <span className="px-1.5 py-0.5 rounded bg-[var(--rd-bg-hover)] text-[var(--rd-text-secondary)] font-medium truncate max-w-[100px]">
                      {bm.collections.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
