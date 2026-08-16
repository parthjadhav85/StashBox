import { useState } from 'react'
import {
  Globe,
  Heart,
  ExternalLink,
  Plus,
  Bookmark,
  Folder,
  Edit3
} from 'lucide-react'

export default function BookmarkListPane({
  bookmarks = [],
  isLoading = false,
  viewMode = 'masonry', // 'masonry' | 'list' | 'grid'
  selectedBookmarkId,
  onSelectBookmark,
  onEditBookmark,
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
      <div className="flex-1 p-4 sm:p-6 w-full overflow-y-auto">
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="rounded-xl bg-[var(--rd-bg-card)] border border-[var(--rd-border)] p-3 sm:p-4 animate-pulse flex items-center gap-3.5"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[var(--rd-bg-hover)] rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-[var(--rd-bg-hover)] rounded w-1/3" />
                <div className="h-3 bg-[var(--rd-bg-hover)] rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!bookmarks || bookmarks.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[450px]">
        <div className="w-16 h-16 rounded-2xl bg-[var(--rd-bg-card)] border border-[var(--rd-border)] flex items-center justify-center mb-4 text-[var(--rd-text-muted)] shadow-xs">
          <Bookmark className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-[var(--rd-text-primary)] mb-1">
          No bookmarks here
        </h3>
        <p className="text-xs text-[var(--rd-text-secondary)] max-w-sm mb-6">
          Save your favorite products, articles, inspirations, and websites to organize them in Stashbox.
        </p>
        <button
          type="button"
          onClick={onOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--rd-accent-blue)] hover:bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Bookmark</span>
        </button>
      </div>
    )
  }

  // 1. Natural, Clean List View (Starts naturally after sidebar without huge gap)
  if (viewMode === 'list') {
    return (
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 w-full">
        <div className="w-full divide-y divide-[var(--rd-border-subtle)]">
          {bookmarks.map((bm) => {
            const isSelected = selectedBookmarkId === bm.id
            const hasValidCover = bm.preview_image_url && !failedImages[bm.id]
            const collectionName = bm.collections?.name || 'Unsorted'

            return (
              <div
                key={bm.id}
                onClick={() => onSelectBookmark?.(bm)}
                className={`
                  group px-3 sm:px-4 py-3 sm:py-3.5 transition-all duration-150 cursor-pointer flex items-center justify-between gap-3.5 select-none rounded-xl
                  ${
                    isSelected
                      ? 'bg-[var(--rd-accent-active)] text-white shadow-sm'
                      : 'hover:bg-[var(--rd-bg-hover)] text-[var(--rd-text-primary)]'
                  }
                `}
              >
                {/* Left: Thumbnail & Info */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  {/* Thumbnail Box */}
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-[var(--rd-bg-card)] border border-[var(--rd-border)] flex items-center justify-center flex-shrink-0 shadow-2xs">
                    {hasValidCover ? (
                      <img
                        src={bm.preview_image_url}
                        alt={bm.title || ''}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        loading="lazy"
                        onError={() => handleImageError(bm.id)}
                      />
                    ) : bm.favicon_url ? (
                      <img src={bm.favicon_url} alt="" className="w-6 h-6 sm:w-6.5 sm:h-6.5 object-contain" />
                    ) : (
                      <Globe className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-[var(--rd-text-muted)]'}`} />
                    )}
                  </div>

                  {/* Title & Metadata */}
                  <div className="min-w-0 flex-1">
                    <h4 className={`text-sm sm:text-[14.5px] font-semibold tracking-tight leading-snug truncate ${isSelected ? 'text-white' : 'text-[var(--rd-text-primary)]'}`}>
                      {bm.title || bm.url}
                    </h4>
                    
                    <div className="flex items-center gap-2 text-xs mt-1 truncate">
                      {/* Collection badge */}
                      <span className={`inline-flex items-center gap-1 font-medium ${isSelected ? 'text-white/90' : 'text-[var(--rd-text-secondary)]'}`}>
                        <Folder className="w-3.5 h-3.5 opacity-70" />
                        <span>{collectionName}</span>
                      </span>

                      <span className="opacity-40">•</span>

                      {/* Domain */}
                      <span className={isSelected ? 'text-white/80' : 'text-[var(--rd-text-muted)] font-mono text-[11px]'}>
                        {bm.domain}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Action Icons */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEditBookmark?.(bm)
                    }}
                    className={`p-1.5 sm:p-2 rounded-lg transition-colors cursor-pointer ${
                      isSelected
                        ? 'text-white/70 hover:text-white hover:bg-white/20'
                        : 'text-[var(--rd-text-muted)] hover:text-[var(--rd-text-primary)] hover:bg-[var(--rd-bg-card)] opacity-0 group-hover:opacity-100'
                    }`}
                    title="Edit Bookmark Details"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggleFavorite?.(bm.id)
                    }}
                    className={`p-1.5 sm:p-2 rounded-lg transition-colors cursor-pointer ${
                      bm.is_favorite
                        ? 'text-rose-500 fill-rose-500'
                        : isSelected
                        ? 'text-white/70 hover:text-white hover:bg-white/20'
                        : 'text-[var(--rd-text-muted)] hover:text-rose-500 hover:bg-[var(--rd-bg-card)] opacity-0 group-hover:opacity-100'
                    }`}
                    title={bm.is_favorite ? 'Remove Favorite' : 'Add to Favorites'}
                  >
                    <Heart className={`w-4 h-4 ${bm.is_favorite ? 'fill-current' : ''}`} />
                  </button>

                  <a
                    href={bm.url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                      isSelected
                        ? 'text-white/80 hover:text-white hover:bg-white/20'
                        : 'text-[var(--rd-text-muted)] hover:text-[var(--rd-text-primary)] hover:bg-[var(--rd-bg-card)] opacity-0 group-hover:opacity-100'
                    }`}
                    title="Open Link in New Tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            )
          })}

          {/* Bottom Counter */}
          <div className="pt-6 pb-4 text-center text-xs font-medium text-[var(--rd-text-muted)] select-none">
            {bookmarks.length} {bookmarks.length === 1 ? 'bookmark' : 'bookmarks'}
          </div>
        </div>
      </div>
    )
  }

  // 2. Full-Width Clean Masonry & Cards Grid View
  return (
    <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-[var(--rd-bg-main)] w-full">
      <div className="w-full">
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4' : 'masonry-grid'}>
          {bookmarks.map((bm) => {
            const isSelected = selectedBookmarkId === bm.id
            const hasValidCover = bm.preview_image_url && !failedImages[bm.id]
            const collectionName = bm.collections?.name || 'Unsorted'

            return (
              <div
                key={bm.id}
                onClick={() => onSelectBookmark?.(bm)}
                className={`
                  group relative bg-[var(--rd-bg-card)] border rounded-2xl overflow-hidden cursor-pointer transition-all duration-150 flex flex-col justify-between
                  ${viewMode === 'masonry' ? 'masonry-item' : ''}
                  ${
                    isSelected
                      ? 'border-[var(--rd-accent-blue)] ring-2 ring-[var(--rd-accent-blue)]/30 shadow-lg'
                      : 'border-[var(--rd-border)] hover:border-[var(--rd-text-secondary)] hover:shadow-md'
                  }
                `}
              >
                {/* Cover Image */}
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
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-xs p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onEditBookmark?.(bm)
                        }}
                        className="p-1.5 rounded-lg text-white hover:text-blue-400 cursor-pointer"
                        title="Edit Bookmark Details"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onToggleFavorite?.(bm.id)
                        }}
                        className={`p-1.5 rounded-lg text-white hover:text-rose-400 cursor-pointer ${
                          bm.is_favorite ? 'text-rose-500 fill-rose-500' : ''
                        }`}
                        title={bm.is_favorite ? 'Remove Favorite' : 'Add to Favorites'}
                      >
                        <Heart className={`w-3.5 h-3.5 ${bm.is_favorite ? 'fill-current' : ''}`} />
                      </button>
                      <a
                        href={bm.url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-lg text-white hover:text-blue-400"
                        title="Open Link"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-[var(--rd-bg-hover)] border-b border-[var(--rd-border)] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {bm.favicon_url ? (
                        <img src={bm.favicon_url} alt="" className="w-5 h-5 rounded" />
                      ) : (
                        <Globe className="w-5 h-5 text-[var(--rd-text-muted)]" />
                      )}
                      <span className="text-xs font-mono font-medium text-[var(--rd-text-secondary)]">
                        {bm.domain}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onEditBookmark?.(bm)
                        }}
                        className="p-1.5 rounded-lg hover:bg-black/10 text-[var(--rd-text-muted)] hover:text-[var(--rd-text-primary)] cursor-pointer"
                        title="Edit Bookmark Details"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onToggleFavorite?.(bm.id)
                        }}
                        className={`p-1.5 rounded-lg hover:bg-black/10 cursor-pointer ${
                          bm.is_favorite ? 'text-rose-500' : 'text-[var(--rd-text-muted)]'
                        }`}
                        title={bm.is_favorite ? 'Remove Favorite' : 'Add to Favorites'}
                      >
                        <Heart className={`w-3.5 h-3.5 ${bm.is_favorite ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Text Information */}
                <div className="p-3.5 sm:p-4">
                  <h4 className="text-[13px] sm:text-sm font-bold text-[var(--rd-text-primary)] line-clamp-2 leading-snug mb-1.5 group-hover:text-[var(--rd-accent-blue)] transition-colors">
                    {bm.title || bm.url}
                  </h4>

                  {bm.description && (
                    <p className="text-xs text-[var(--rd-text-secondary)] line-clamp-2 leading-relaxed mb-3">
                      {bm.description}
                    </p>
                  )}

                  {/* Footer Metadata */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-[var(--rd-border-subtle)] text-[11px] text-[var(--rd-text-muted)]">
                    <div className="flex items-center gap-1.5 truncate">
                      {bm.favicon_url && (
                        <img src={bm.favicon_url} alt="" className="w-3.5 h-3.5 rounded-xs flex-shrink-0" />
                      )}
                      <span className="truncate">{bm.domain}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-[var(--rd-bg-hover)] text-[var(--rd-text-secondary)] font-medium truncate max-w-[120px]">
                      {collectionName}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom Counter */}
        <div className="pt-8 pb-4 text-center text-xs font-medium text-[var(--rd-text-muted)] select-none">
          {bookmarks.length} {bookmarks.length === 1 ? 'bookmark' : 'bookmarks'}
        </div>
      </div>
    </div>
  )
}
