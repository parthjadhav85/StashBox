import { useState } from 'react'
import {
  X,
  ExternalLink,
  Heart,
  Trash2,
  Globe,
  Archive,
  ArchiveRestore,
  Type,
  RotateCw,
  Edit3
} from 'lucide-react'

export default function BookmarkDetailPane({
  bookmark,
  onClose,
  onEdit,
  onToggleFavorite,
  onToggleArchive,
  onRefreshMetadata,
  onDelete
}) {
  const [activeTab, setActiveTab] = useState('article') // 'article' | 'website' | 'edit'
  const [fontSize, setFontSize] = useState('md') // 'sm' | 'md' | 'lg'
  const [isDeleting, setIsDeleting] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  if (!bookmark) return null

  const handleDelete = async () => {
    if (isDeleting) return
    setIsDeleting(true)
    try {
      await onDelete?.(bookmark.id)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleRefresh = async () => {
    if (isRefreshing) return
    setIsRefreshing(true)
    try {
      await onRefreshMetadata?.(bookmark.id)
    } finally {
      setIsRefreshing(false)
    }
  }

  const cycleFontSize = () => {
    if (fontSize === 'sm') setFontSize('md')
    else if (fontSize === 'md') setFontSize('lg')
    else setFontSize('sm')
  }

  const formattedDate = bookmark.created_at
    ? new Date(bookmark.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Recently'

  const savedDateText = bookmark.created_at
    ? ` on ${new Date(bookmark.created_at).toLocaleDateString()}`
    : ''

  return (
    <aside className="w-full lg:w-[480px] xl:w-[540px] border-l border-[var(--rd-border)] bg-[var(--rd-bg-card)] flex flex-col justify-between h-[calc(100vh-44px)] overflow-hidden select-text flex-shrink-0">
      {/* Top Toolbar */}
      <div className="h-11 px-4 border-b border-[var(--rd-border)] bg-[var(--rd-toolbar-bg)] flex items-center justify-between gap-2 flex-shrink-0 select-none">
        {/* Left: View Tabs */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('article')}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'article'
                ? 'bg-[var(--rd-accent-gold)] text-[var(--rd-accent-gold-text)] shadow-2xs'
                : 'text-[var(--rd-text-secondary)] hover:text-[var(--rd-text-primary)] hover:bg-[var(--rd-bg-hover)]'
            }`}
          >
            Article
          </button>
          <a
            href={bookmark.url}
            target="_blank"
            rel="noreferrer"
            className="px-2.5 py-1 rounded-full text-xs font-medium text-[var(--rd-text-secondary)] hover:text-[var(--rd-text-primary)] hover:bg-[var(--rd-bg-hover)] transition-colors"
          >
            {bookmark.domain || 'Website'}
          </a>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1 text-[var(--rd-text-secondary)]">
          <button
            type="button"
            onClick={() => onEdit?.(bookmark)}
            className="p-1.5 rounded-lg hover:text-[var(--rd-text-primary)] hover:bg-[var(--rd-bg-hover)] transition-colors cursor-pointer"
            title="Edit Bookmark Details"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            type="button"
            disabled={isRefreshing}
            onClick={handleRefresh}
            className={`p-1.5 rounded-lg hover:text-[var(--rd-text-primary)] hover:bg-[var(--rd-bg-hover)] transition-colors cursor-pointer ${
              isRefreshing ? 'animate-spin text-[var(--rd-accent-gold)]' : ''
            }`}
            title="Refresh Page Metadata & Cover"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onToggleFavorite?.(bookmark.id)}
            className={`p-1.5 rounded-lg hover:bg-[var(--rd-bg-hover)] transition-colors cursor-pointer ${
              bookmark.is_favorite ? 'text-rose-500 fill-rose-500' : 'hover:text-rose-500'
            }`}
            title={bookmark.is_favorite ? 'Favorited' : 'Favorite'}
          >
            <Heart className={`w-4 h-4 ${bookmark.is_favorite ? 'fill-current' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => onToggleArchive?.(bookmark.id)}
            className="p-1.5 rounded-lg hover:text-[var(--rd-text-primary)] hover:bg-[var(--rd-bg-hover)] transition-colors cursor-pointer"
            title={bookmark.is_archived ? 'Restore' : 'Archive'}
          >
            {bookmark.is_archived ? <ArchiveRestore className="w-4 h-4 text-amber-500" /> : <Archive className="w-4 h-4" />}
          </button>

          <button
            type="button"
            disabled={isDeleting}
            onClick={handleDelete}
            className="p-1.5 rounded-lg hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
            title="Delete Bookmark"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-[var(--rd-border)] mx-0.5" />

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:text-[var(--rd-text-primary)] hover:bg-[var(--rd-bg-hover)] transition-colors cursor-pointer"
            title="Close inspector"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Reader Body */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
        {/* Domain & Date Eyebrow */}
        <div className="flex items-center gap-2 text-xs text-[var(--rd-text-secondary)] font-medium">
          {bookmark.favicon_url ? (
            <img src={bookmark.favicon_url} alt="" className="w-4 h-4 rounded-xs" />
          ) : (
            <Globe className="w-4 h-4" />
          )}
          <span className="font-semibold text-[var(--rd-text-primary)]">{bookmark.domain}</span>
          <span>•</span>
          <span>{formattedDate}</span>
        </div>

        {/* Large Article Headline */}
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--rd-text-primary)] leading-tight">
          {bookmark.title || bookmark.url}
        </h1>

        {/* Hero Cover Image */}
        {bookmark.preview_image_url && (
          <div className="rounded-xl overflow-hidden border border-[var(--rd-border)] bg-[var(--rd-bg-hover)]">
            <img
              src={bookmark.preview_image_url}
              alt={bookmark.title || ''}
              className="w-full h-auto object-cover max-h-96"
            />
          </div>
        )}

        {/* Article Body Content */}
        <div className={`space-y-4 text-[var(--rd-text-primary)] leading-relaxed font-sans ${
          fontSize === 'sm' ? 'text-xs' : fontSize === 'lg' ? 'text-base' : 'text-sm'
        }`}>
          {bookmark.description ? (
            <p className="text-[var(--rd-text-secondary)] leading-relaxed">
              {bookmark.description}
            </p>
          ) : null}

          <p className="text-[var(--rd-text-secondary)] text-xs italic">
            Saved to {bookmark.collections?.name || 'Unsorted'}{savedDateText}.
          </p>
        </div>
      </div>

      {/* Reader Bottom Bar */}
      <div className="h-12 px-6 border-t border-[var(--rd-border)] bg-[var(--rd-toolbar-bg)] flex items-center justify-between text-xs text-[var(--rd-text-secondary)] flex-shrink-0 select-none">
        {/* Source link */}
        <a
          href={bookmark.url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 hover:text-[var(--rd-text-primary)] transition-colors truncate max-w-[280px]"
        >
          <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{bookmark.url}</span>
        </a>

        {/* Typography adjuster */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={cycleFontSize}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-[var(--rd-bg-hover)] hover:text-[var(--rd-text-primary)] transition-colors font-bold cursor-pointer"
            title="Adjust reading font size"
          >
            <Type className="w-3.5 h-3.5" />
            <span className="text-[11px] uppercase tracking-wider">{fontSize}</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
