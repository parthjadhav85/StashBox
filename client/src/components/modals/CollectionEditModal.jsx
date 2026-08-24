import { useState, useEffect } from 'react'
import {
  X,
  FolderPlus,
  Trash2,
  ChevronLeft,
  Smile
} from 'lucide-react'
import EmojiPicker, { Theme } from 'emoji-picker-react'
import { useTheme } from '../../context/ThemeContext.jsx'
import CollectionIcon from '../common/CollectionIcon.jsx'

export default function CollectionEditModal({
  isOpen,
  onClose,
  collection,
  collections = [],
  onUpdate,
  onDelete,
  onCreateNested,
  initialPickIcon = false
}) {
  const { resolvedTheme } = useTheme()
  const [title, setTitle] = useState('')
  const [selectedIcon, setSelectedIcon] = useState('📁')
  const [selectedColor, setSelectedColor] = useState('#e5a823')
  const [parentId, setParentId] = useState('')
  const [isPickingIcon, setIsPickingIcon] = useState(Boolean(initialPickIcon))
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (collection) {
      setTitle(collection.name || '')
      setSelectedIcon(collection.icon || '📁')
      setSelectedColor(collection.color || '#e5a823')
      setParentId(collection.parent_id || '')
      setIsPickingIcon(Boolean(initialPickIcon))
    }
  }, [collection, isOpen, initialPickIcon])

  if (!isOpen || !collection) return null

  // Available parent options: all collections except this one (cannot be child of itself)
  const availableParents = collections.filter(c => c.id !== collection.id)

  const handleSave = (e) => {
    e?.preventDefault()
    if (!title.trim()) return
    onUpdate?.(collection.id, {
      name: title.trim(),
      icon: selectedIcon,
      color: selectedColor,
      parent_id: parentId || null
    })
    onClose()
  }

  const handleDelete = async () => {
    if (isDeleting) return
    setIsDeleting(true)
    try {
      await onDelete?.(collection.id)
      onClose()
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEmojiSelect = (emojiData) => {
    if (emojiData?.emoji) {
      setSelectedIcon(emojiData.emoji)
      setIsPickingIcon(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className={`relative w-full ${isPickingIcon ? 'max-w-md' : 'max-w-sm'} bg-[var(--rd-bg-card)] border border-[var(--rd-border)] rounded-2xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150 text-[var(--rd-text-primary)] transition-all`}>
        {/* Header */}
        <div className="px-4 py-3 border-b border-[var(--rd-border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isPickingIcon ? (
              <button
                type="button"
                onClick={() => setIsPickingIcon(false)}
                className="flex items-center gap-1 text-xs font-semibold text-[var(--rd-accent-gold)] hover:underline cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back to settings</span>
              </button>
            ) : (
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--rd-text-secondary)]">
                Collection Settings
              </span>
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

        {/* Content */}
        {isPickingIcon ? (
          /* Full Emoji Picker View */
          <div className="p-4 space-y-3.5">
            {/* Direct Emoji Input Field */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--rd-text-secondary)] mb-1">
                Direct Emoji Input / Paste
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={selectedIcon}
                  onChange={(e) => setSelectedIcon(e.target.value)}
                  placeholder="Paste or type emoji..."
                  className="flex-1 px-3 py-1.5 bg-[var(--rd-bg-main)] border border-[var(--rd-border)] rounded-xl text-sm text-[var(--rd-text-primary)] focus:border-[var(--rd-accent-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--rd-accent-gold)]/30"
                />
                <button
                  type="button"
                  onClick={() => setIsPickingIcon(false)}
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
          /* Main Settings View */
          <div className="p-5 space-y-4">
            {/* Big Icon Preview */}
            <div className="flex justify-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-md transition-transform hover:scale-105 cursor-pointer text-2xl"
                style={{ backgroundColor: `${selectedColor}20` }}
                onClick={() => setIsPickingIcon(true)}
                title="Click to change emoji"
              >
                <CollectionIcon icon={selectedIcon} color={selectedColor} className="w-8 h-8" />
              </div>
            </div>

            {/* Title Input */}
            <div>
              <label className="block text-[11px] font-semibold text-[var(--rd-text-secondary)] mb-1">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Collection name"
                className="w-full px-3 py-2 bg-[var(--rd-bg-main)] border border-[var(--rd-border)] rounded-xl text-xs sm:text-sm font-semibold text-[var(--rd-text-primary)] focus:border-[var(--rd-accent-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--rd-accent-gold)]/30"
              />
            </div>

            {/* Parent Collection Selector */}
            <div>
              <label className="block text-[11px] font-semibold text-[var(--rd-text-secondary)] mb-1">
                Parent Collection
              </label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--rd-bg-main)] border border-[var(--rd-border)] rounded-xl text-xs sm:text-sm text-[var(--rd-text-primary)] focus:border-[var(--rd-accent-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--rd-accent-gold)]/30 cursor-pointer"
              >
                <option value="">None (Top-Level Root)</option>
                {availableParents.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Links */}
            <div className="space-y-1.5 text-xs font-medium border-t border-[var(--rd-border)] pt-2.5">
              <button
                type="button"
                onClick={() => setIsPickingIcon(true)}
                className="w-full flex items-center justify-between py-1.5 px-2 rounded-lg text-amber-500 hover:bg-amber-500/10 transition-colors cursor-pointer text-left"
              >
                <span className="flex items-center gap-1.5">
                  <Smile className="w-4 h-4" />
                  <span>Change icon (Emoji)</span>
                </span>
                <span className="text-[11px] opacity-70">➔</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onCreateNested?.(collection.id)
                  onClose()
                }}
                className="w-full flex items-center justify-between py-1.5 px-2 rounded-lg text-amber-500 hover:bg-amber-500/10 transition-colors cursor-pointer text-left"
              >
                <span>Create nested collection</span>
                <FolderPlus className="w-4 h-4" />
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="w-full flex items-center justify-between py-1.5 px-2 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer text-left"
              >
                <span>Delete collection</span>
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Save Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleSave}
                className="w-full py-2.5 rounded-xl bg-[var(--rd-accent-gold)] hover:bg-[var(--rd-accent-gold-hover)] active:scale-[0.98] text-[var(--rd-accent-gold-text)] text-xs font-bold shadow-xs hover:shadow-sm transition-all cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
