import { useState, useEffect } from 'react'
import { X, Plus, Smile, ChevronLeft } from 'lucide-react'
import EmojiPicker, { Theme } from 'emoji-picker-react'
import { useTheme } from '../../context/ThemeContext.jsx'
import CollectionIcon from '../common/CollectionIcon.jsx'

export default function CreateCollectionModal({
  isOpen,
  onClose,
  onCreate,
  parentCollectionId = null,
  collections = []
}) {
  const { resolvedTheme } = useTheme()
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('📁')
  const [parentId, setParentId] = useState(parentCollectionId || '')
  const [isPickingEmoji, setIsPickingEmoji] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setParentId(parentCollectionId || '')
      setName('')
      setIcon('📁')
      setIsPickingEmoji(false)
    }
  }, [isOpen, parentCollectionId])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onCreate?.({
      name: name.trim(),
      icon: icon || '📁',
      color: '#e5a823',
      parent_id: parentId || null
    })
    setName('')
    setIcon('📁')
    setParentId('')
    setIsPickingEmoji(false)
    onClose()
  }

  const handleEmojiSelect = (emojiData) => {
    if (emojiData?.emoji) {
      setIcon(emojiData.emoji)
      setIsPickingEmoji(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className={`relative w-full ${isPickingEmoji ? 'max-w-md' : 'max-w-md'} bg-[var(--rd-bg-card)] border border-[var(--rd-border)] rounded-2xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150 text-[var(--rd-text-primary)] transition-all`}>
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[var(--rd-border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isPickingEmoji ? (
              <button
                type="button"
                onClick={() => setIsPickingEmoji(false)}
                className="flex items-center gap-1 text-xs font-semibold text-[var(--rd-accent-gold)] hover:underline cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back to form</span>
              </button>
            ) : (
              <h3 className="text-sm font-bold tracking-tight">
                {parentCollectionId ? 'New Nested Collection' : 'New Collection'}
              </h3>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-[var(--rd-text-secondary)] hover:text-[var(--rd-text-primary)] hover:bg-[var(--rd-bg-hover)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isPickingEmoji ? (
          /* Emoji Picker Screen */
          <div className="p-4 space-y-3.5">
            {/* Direct Emoji Input Field */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--rd-text-secondary)] mb-1">
                Direct Emoji Input / Paste
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="Paste or type emoji..."
                  className="flex-1 px-3 py-1.5 bg-[var(--rd-bg-main)] border border-[var(--rd-border)] rounded-xl text-sm text-[var(--rd-text-primary)] focus:border-[var(--rd-accent-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--rd-accent-gold)]/30"
                />
                <button
                  type="button"
                  onClick={() => setIsPickingEmoji(false)}
                  className="px-3 py-1.5 bg-[var(--rd-accent-gold)] hover:bg-[var(--rd-accent-gold-hover)] text-[var(--rd-accent-gold-text)] text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Use
                </button>
              </div>
            </div>

            {/* EmojiPicker Component */}
            <div className="rounded-xl overflow-hidden border border-[var(--rd-border)] flex justify-center">
              <EmojiPicker
                theme={resolvedTheme === 'dark' ? Theme.DARK : Theme.LIGHT}
                onEmojiClick={handleEmojiSelect}
                autoFocusSearch={false}
                lazyLoadEmojis={true}
                width="100%"
                height={350}
                searchPlaceHolder="Search emoji..."
                previewConfig={{ showPreview: false }}
              />
            </div>
          </div>
        ) : (
          /* Main Create Collection Form */
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Unified Collection Name Row: [ Preview Emoji ] [ Input ] [ Change Emoji ] */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--rd-text-secondary)] mb-1.5">
                Collection Name *
              </label>
              <div className="flex items-center gap-2">
                {/* Emoji Preview Trigger Button */}
                <button
                  type="button"
                  onClick={() => setIsPickingEmoji(true)}
                  className="w-10 h-10 rounded-xl bg-[var(--rd-bg-main)] flex items-center justify-center border border-[var(--rd-border)] hover:border-[var(--rd-accent-gold)] transition-transform hover:scale-105 cursor-pointer text-lg flex-shrink-0"
                  title="Choose collection emoji"
                >
                  <CollectionIcon icon={icon} className="w-5 h-5" />
                </button>

                {/* Collection Name Input */}
                <input
                  type="text"
                  required
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Design, Study, Gaming"
                  className="flex-1 min-w-0 px-3 py-2 bg-[var(--rd-bg-main)] border border-[var(--rd-border)] rounded-xl text-xs sm:text-sm text-[var(--rd-text-primary)] placeholder-[var(--rd-text-muted)] focus:border-[var(--rd-accent-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--rd-accent-gold)]/30"
                />

                {/* Change Emoji Action Button */}
                <button
                  type="button"
                  onClick={() => setIsPickingEmoji(true)}
                  className="h-10 px-3 flex items-center gap-1.5 rounded-xl border border-[var(--rd-border)] bg-[var(--rd-bg-main)] hover:bg-[var(--rd-bg-hover)] text-xs font-semibold text-[var(--rd-accent-gold)] hover:border-[var(--rd-accent-gold)] transition-colors cursor-pointer flex-shrink-0"
                  title="Change emoji"
                >
                  <Smile className="w-4 h-4" />
                  <span className="hidden sm:inline">Change Emoji</span>
                  <span className="sm:hidden">Emoji</span>
                </button>
              </div>
            </div>

            {/* Parent Collection Selector (if nested collections exist) */}
            {collections.length > 0 && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--rd-text-secondary)] mb-1.5">
                  Parent Collection
                </label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--rd-bg-main)] border border-[var(--rd-border)] rounded-xl text-xs sm:text-sm text-[var(--rd-text-primary)] focus:border-[var(--rd-accent-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--rd-accent-gold)]/30 cursor-pointer"
                >
                  <option value="">None (Top-Level Root)</option>
                  {collections.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-3 flex items-center justify-end gap-2 border-t border-[var(--rd-border)]">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-[var(--rd-text-secondary)] hover:text-[var(--rd-text-primary)] hover:bg-[var(--rd-bg-hover)] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--rd-accent-gold)] hover:bg-[var(--rd-accent-gold-hover)] active:scale-[0.98] text-[var(--rd-accent-gold-text)] text-xs font-semibold shadow-xs hover:shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.25]" />
                <span>Create Collection</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
