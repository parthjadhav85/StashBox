import { useState } from 'react'
import { X, Folder, Plus } from 'lucide-react'

export default function CreateCollectionModal({
  isOpen,
  onClose,
  onCreate
}) {
  const [name, setName] = useState('')
  const [color, setColor] = useState('#6366f1')

  if (!isOpen) return null

  const colors = [
    '#6366f1', // Indigo
    '#3b82f6', // Blue
    '#06b6d4', // Cyan
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#ec4899', // Pink
    '#8b5cf6', // Violet
    '#64748b'  // Slate
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onCreate?.({
      name: name.trim(),
      color
    })
    setName('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <Folder className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-100">Create New Collection</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Collection Name *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Design Inspiration, Work Projects"
              className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Color Accent
            </label>
            <div className="flex items-center gap-2.5">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                    color === c ? 'ring-2 ring-white scale-110' : 'hover:scale-105 opacity-80'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
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
