import { useState, useEffect } from 'react'
import { X, Globe, AlertCircle, Bookmark, CheckCircle2 } from 'lucide-react'

// Helper to validate whether a string is an actual HTTP/HTTPS URL
const isValidHttpUrl = (string) => {
  if (!string || typeof string !== 'string') return false
  const trimmed = string.trim()
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) return false
  try {
    const parsed = new URL(trimmed)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export default function AddBookmarkModal({
  isOpen,
  onClose,
  collections = [],
  onAdd
}) {
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [collectionId, setCollectionId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isClipboardAutofilled, setIsClipboardAutofilled] = useState(false)

  // Clipboard URL Autofill: check clipboard once when modal opens
  useEffect(() => {
    if (!isOpen) return

    let isMounted = true

    const checkClipboardForUrl = async () => {
      // Only attempt if browser supports clipboard API
      if (!navigator?.clipboard?.readText) return

      try {
        const text = await navigator.clipboard.readText()
        if (isMounted && isValidHttpUrl(text)) {
          // Never overwrite if user has already entered a URL
          setUrl((currentUrl) => {
            if (!currentUrl.trim()) {
              setIsClipboardAutofilled(true)
              return text.trim()
            }
            return currentUrl
          })
        }
      } catch {
        // Silently ignore clipboard permission errors or unavailable clipboard
      }
    }

    checkClipboardForUrl()

    return () => {
      isMounted = false
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleClose = () => {
    setUrl('')
    setTitle('')
    setDescription('')
    setCollectionId('')
    setErrorMessage('')
    setIsClipboardAutofilled(false)
    setIsSubmitting(false)
    onClose()
  }

  const handleUrlChange = (e) => {
    setIsClipboardAutofilled(false)
    setUrl(e.target.value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    if (!url.trim()) {
      setErrorMessage('Please enter a valid URL.')
      return
    }

    try {
      setIsSubmitting(true)
      await onAdd?.({
        url: url.trim(),
        title: title.trim() || undefined,
        description: description.trim() || undefined,
        collection_id: collectionId || null
      })
      handleClose()
    } catch (err) {
      setErrorMessage(err.data?.message || err.message || 'Failed to save bookmark')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
      />

      <div className="relative w-full max-w-md bg-[var(--rd-bg-card)] border border-[var(--rd-border)] rounded-2xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150 text-[var(--rd-text-primary)]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[var(--rd-border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-[var(--rd-accent-blue)]" />
            <h3 className="text-sm font-bold tracking-tight">Save Bookmark</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-md text-[var(--rd-text-secondary)] hover:text-[var(--rd-text-primary)] hover:bg-[var(--rd-bg-hover)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2 text-rose-500 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--rd-text-secondary)]">
                URL Link *
              </label>
              {isClipboardAutofilled && (
                <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-500 animate-in fade-in duration-200">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Detected from clipboard</span>
                </span>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--rd-text-muted)]">
                <Globe className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                autoFocus
                value={url}
                onChange={handleUrlChange}
                placeholder="https://example.com/article"
                className="w-full pl-9 pr-3 py-2 bg-[var(--rd-bg-main)] border border-[var(--rd-border)] rounded-xl text-xs sm:text-sm text-[var(--rd-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--rd-accent-blue)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--rd-text-secondary)] mb-1.5">
              Title (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Design Inspiration Gallery"
              className="w-full px-3 py-2 bg-[var(--rd-bg-main)] border border-[var(--rd-border)] rounded-xl text-xs sm:text-sm text-[var(--rd-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--rd-accent-blue)]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--rd-text-secondary)] mb-1.5">
              Note / Description (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add key notes..."
              className="w-full p-2.5 bg-[var(--rd-bg-main)] border border-[var(--rd-border)] rounded-xl text-xs text-[var(--rd-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--rd-accent-blue)] resize-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--rd-text-secondary)] mb-1.5">
              Collection
            </label>
            <select
              value={collectionId}
              onChange={(e) => setCollectionId(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--rd-bg-main)] border border-[var(--rd-border)] rounded-xl text-xs sm:text-sm text-[var(--rd-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--rd-accent-blue)] cursor-pointer"
            >
              <option value="">Unsorted</option>
              {collections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

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
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--rd-accent-blue)] hover:bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : '+ Save Bookmark'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
