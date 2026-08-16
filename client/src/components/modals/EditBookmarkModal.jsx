import { useState, useEffect } from 'react'
import { X, Edit3, AlertCircle, ExternalLink } from 'lucide-react'

export default function EditBookmarkModal({
  isOpen,
  onClose,
  bookmark,
  collections = [],
  onUpdate
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [collectionId, setCollectionId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Sync initial state when modal opens with a bookmark
  useEffect(() => {
    if (!isOpen || !bookmark) return

    setTitle(bookmark.title || '')
    setDescription(bookmark.description || '')
    setCollectionId(bookmark.collection_id || '')
    setErrorMessage('')
  }, [isOpen, bookmark])

  if (!isOpen || !bookmark) return null

  const handleClose = () => {
    setErrorMessage('')
    setIsSubmitting(false)
    onClose()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    try {
      setIsSubmitting(true)
      const updatedFields = {
        title: title.trim() || bookmark.title || '',
        description: description.trim() || null,
        collection_id: collectionId || null
      }

      await onUpdate?.(bookmark.id, updatedFields)
      handleClose()
    } catch (err) {
      setErrorMessage(err.data?.message || err.message || 'Failed to update bookmark')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-[var(--rd-bg-card)] border border-[var(--rd-border)] rounded-2xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150 text-[var(--rd-text-primary)]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[var(--rd-border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-[var(--rd-accent-blue)]" />
            <h3 className="text-sm font-bold tracking-tight">Edit Bookmark</h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded-lg text-[var(--rd-text-secondary)] hover:text-[var(--rd-text-primary)] hover:bg-[var(--rd-bg-hover)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[calc(85vh-100px)] overflow-y-auto">
          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2 text-rose-500 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. TITLE (Editable) */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--rd-text-secondary)] mb-1.5">
              Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Bookmark title"
              className="w-full px-3.5 py-2.5 bg-[var(--rd-bg-main)] border border-[var(--rd-border)] focus:border-[var(--rd-accent-blue)] rounded-xl text-xs sm:text-sm text-[var(--rd-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--rd-accent-blue)]/20 transition-all"
            />
          </div>

          {/* 2. DESCRIPTION / NOTE (Editable) */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--rd-text-secondary)] mb-1.5">
              Description / Note
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add key notes, comments, or thoughts..."
              className="w-full p-3 bg-[var(--rd-bg-main)] border border-[var(--rd-border)] focus:border-[var(--rd-accent-blue)] rounded-xl text-xs text-[var(--rd-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--rd-accent-blue)]/20 transition-all resize-none"
            />
          </div>

          {/* 3. COLLECTION (Editable dropdown) */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--rd-text-secondary)] mb-1.5">
              Collection
            </label>
            <div className="relative">
              <select
                value={collectionId}
                onChange={(e) => setCollectionId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[var(--rd-bg-main)] border border-[var(--rd-border)] focus:border-[var(--rd-accent-blue)] rounded-xl text-xs sm:text-sm text-[var(--rd-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--rd-accent-blue)]/20 transition-all cursor-pointer"
              >
                <option value="">Unsorted</option>
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.parent_id ? `  ↳ ${c.name}` : c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 4. URL LINK (Strictly Read-Only) */}
          <div className="pt-2 border-t border-[var(--rd-border-subtle)]">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--rd-text-muted)] mb-1">
              URL Link (Read-Only)
            </label>
            <div className="px-3 py-2 bg-[var(--rd-bg-hover)]/60 border border-[var(--rd-border-subtle)] rounded-xl flex items-center justify-between gap-2 select-all">
              <span className="text-xs text-[var(--rd-text-secondary)] font-mono truncate">
                {bookmark.url}
              </span>
              <a
                href={bookmark.url}
                target="_blank"
                rel="noreferrer"
                className="p-1 text-[var(--rd-text-muted)] hover:text-[var(--rd-accent-blue)] transition-colors flex-shrink-0"
                title="Open Link"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-[var(--rd-border)]">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[var(--rd-text-secondary)] hover:text-[var(--rd-text-primary)] hover:bg-[var(--rd-bg-hover)] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-[var(--rd-accent-blue)] hover:bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
