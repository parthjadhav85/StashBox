import { useState, useEffect } from 'react'
import {
  X,
  FolderPlus,
  Trash2,
  Check,
  ChevronLeft,
  Folder
} from 'lucide-react'
import CollectionIcon, { COLLECTION_ICONS, RAINDROP_COLORS } from '../common/CollectionIcon.jsx'

export default function CollectionEditModal({
  isOpen,
  onClose,
  collection,
  collections = [],
  onUpdate,
  onDelete,
  onCreateNested
}) {
  const [title, setTitle] = useState('')
  const [selectedIcon, setSelectedIcon] = useState('folder')
  const [selectedColor, setSelectedColor] = useState('#3b82f6')
  const [parentId, setParentId] = useState('')
  const [isPickingIcon, setIsPickingIcon] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (collection) {
      setTitle(collection.name || '')
      setSelectedIcon(collection.icon || 'folder')
      setSelectedColor(collection.color || '#3b82f6')
      setParentId(collection.parent_id || '')
      setIsPickingIcon(false)
    }
  }, [collection, isOpen])

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-sm bg-[var(--rd-bg-card)] border border-[var(--rd-border)] rounded-2xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150 text-[var(--rd-text-primary)]">
        {/* Header */}
        <div className="px-4 py-3 border-b border-[var(--rd-border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isPickingIcon ? (
              <button
                type="button"
                onClick={() => setIsPickingIcon(false)}
                className="flex items-center gap-1 text-xs font-semibold text-[var(--rd-accent-blue)] hover:underline cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Icon set</span>
              </button>
            ) : (
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--rd-text-secondary)]">
                Collection Settings
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[var(--rd-text-secondary)] hover:text-[var(--rd-text-primary)] hover:bg-[var(--rd-bg-hover)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {isPickingIcon ? (
          /* Icon Picker Grid */
          <div className="p-4 max-h-[380px] overflow-y-auto space-y-4">
            <div>
              <span className="text-[11px] font-bold uppercase text-[var(--rd-text-secondary)] block mb-2">
                Color Palette
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {RAINDROP_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedColor(c)}
                    className={`w-6 h-6 rounded-full transition-transform cursor-pointer flex items-center justify-center ${
                      selectedColor === c ? 'ring-2 ring-[var(--rd-text-primary)] ring-offset-2 ring-offset-[var(--rd-bg-card)] scale-110' : 'opacity-80 hover:opacity-100 hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                  >
                    {selectedColor === c && <Check className="w-3 h-3 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase text-[var(--rd-text-secondary)] block mb-2">
                Icon
              </span>
              <div className="grid grid-cols-6 gap-2">
                {COLLECTION_ICONS.map((item) => {
                  const isSelected = selectedIcon === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSelectedIcon(item.id)
                        setIsPickingIcon(false)
                      }}
                      className={`p-2.5 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[var(--rd-accent-blue)] bg-blue-500/10'
                          : 'border-[var(--rd-border)] hover:bg-[var(--rd-bg-hover)]'
                      }`}
                      title={item.name}
                    >
                      <CollectionIcon icon={item.id} color={selectedColor} className="w-5 h-5" />
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Main Settings (Raindrop Screenshot 1 replica) */
          <div className="p-5 space-y-4">
            {/* Big Icon Preview */}
            <div className="flex justify-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-md transition-transform hover:scale-105 cursor-pointer"
                style={{ backgroundColor: `${selectedColor}20` }}
                onClick={() => setIsPickingIcon(true)}
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
                className="w-full px-3 py-2 bg-[var(--rd-bg-main)] border border-[var(--rd-border)] rounded-xl text-xs sm:text-sm font-semibold text-[var(--rd-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--rd-accent-blue)]"
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
                className="w-full px-3 py-2 bg-[var(--rd-bg-main)] border border-[var(--rd-border)] rounded-xl text-xs sm:text-sm text-[var(--rd-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--rd-accent-blue)] cursor-pointer"
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
                <span>Change icon</span>
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
                className="w-full py-2.5 rounded-xl bg-[var(--rd-accent-blue)] hover:bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
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
