import { useState, useEffect } from 'react'
import { X, Plus, Check } from 'lucide-react'
import CollectionIcon, { COLLECTION_ICONS, RAINDROP_COLORS } from '../common/CollectionIcon.jsx'

export default function CreateCollectionModal({
  isOpen,
  onClose,
  onCreate,
  parentCollectionId = null,
  collections = []
}) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('folder')
  const [color, setColor] = useState('#3b82f6')
  const [parentId, setParentId] = useState(parentCollectionId || '')

  useEffect(() => {
    if (isOpen) {
      setParentId(parentCollectionId || '')
      setName('')
      setIcon('folder')
      setColor('#3b82f6')
    }
  }, [isOpen, parentCollectionId])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onCreate?.({
      name: name.trim(),
      icon,
      color,
      parent_id: parentId || null
    })
    setName('')
    setIcon('folder')
    setColor('#3b82f6')
    setParentId('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-[var(--rd-bg-card)] border border-[var(--rd-border)] rounded-2xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150 text-[var(--rd-text-primary)]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[var(--rd-border)] flex items-center justify-between">
          <h3 className="text-sm font-bold tracking-tight">
            {parentCollectionId ? 'New Nested Collection' : 'New Collection'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[var(--rd-text-secondary)] hover:text-[var(--rd-text-primary)] hover:bg-[var(--rd-bg-hover)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--rd-text-secondary)] mb-1.5">
              Collection Name *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Nike, Air Jordan, Design"
              className="w-full px-3 py-2 bg-[var(--rd-bg-main)] border border-[var(--rd-border)] rounded-xl text-xs sm:text-sm text-[var(--rd-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--rd-accent-blue)]"
            />
          </div>

          {/* Color Palette */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--rd-text-secondary)] mb-2">
              Color Accent
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {RAINDROP_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full transition-transform cursor-pointer flex items-center justify-center ${
                    color === c ? 'ring-2 ring-[var(--rd-text-primary)] ring-offset-2 ring-offset-[var(--rd-bg-card)] scale-110' : 'opacity-80 hover:opacity-100 hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                >
                  {color === c && <Check className="w-3 h-3 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Icon Selector Grid */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--rd-text-secondary)] mb-2">
              Icon
            </label>
            <div className="grid grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1 border border-[var(--rd-border)] rounded-xl bg-[var(--rd-bg-main)]">
              {COLLECTION_ICONS.map((item) => {
                const isSelected = icon === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setIcon(item.id)}
                    className={`p-2 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[var(--rd-accent-blue)] bg-blue-500/10'
                        : 'border-transparent hover:bg-[var(--rd-bg-hover)]'
                    }`}
                    title={item.name}
                  >
                    <CollectionIcon icon={item.id} color={color} className="w-4 h-4" />
                  </button>
                )
              })}
            </div>
          </div>

          {/* Parent Collection Selector */}
          {collections.length > 0 && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--rd-text-secondary)] mb-1.5">
                Parent Collection
              </label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--rd-bg-main)] border border-[var(--rd-border)] rounded-xl text-xs sm:text-sm text-[var(--rd-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--rd-accent-blue)] cursor-pointer"
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
              className="px-4 py-2 rounded-xl text-xs font-medium text-[var(--rd-text-secondary)] hover:text-[var(--rd-text-primary)] hover:bg-[var(--rd-bg-hover)] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--rd-accent-blue)] hover:bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Collection</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
