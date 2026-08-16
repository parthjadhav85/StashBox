import {
  X,
  ExternalLink,
  Star,
  Trash2,
  Folder,
  Tag,
  Globe,
  Clock,
  Check,
  Maximize2
} from 'lucide-react'

export default function BookmarkDetailPane({
  bookmark,
  onClose,
  onToggleFavorite,
  onDelete
}) {
  if (!bookmark) return null

  return (
    <aside className="w-80 sm:w-96 border-l border-slate-800/80 bg-[#10141d] flex flex-col justify-between h-[calc(100vh-56px)] overflow-y-auto select-none">
      {/* Top Header */}
      <div>
        <div className="h-12 border-b border-slate-800/80 px-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-300">Bookmark Details</span>
          </div>

          <div className="flex items-center gap-1">
            <a
              href={bookmark.url}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title="Open link in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Details Form */}
        <div className="p-4 space-y-4">
          {/* Favicon & Title Header */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center flex-shrink-0 text-slate-400">
              {bookmark.favicon_url ? (
                <img
                  src={bookmark.favicon_url}
                  alt=""
                  className="w-5 h-5 rounded-xs"
                  onError={(e) => { e.target.style.display = 'none' }}
                />
              ) : (
                <Globe className="w-5 h-5" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-slate-100 leading-snug">
                {bookmark.title || bookmark.url}
              </h3>
              <span className="text-[11px] font-mono text-slate-500 block truncate mt-0.5">
                {bookmark.domain || 'website'}
              </span>
            </div>
          </div>

          {/* Description / Note */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Note / Description
            </label>
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 min-h-[70px]">
              {bookmark.description || (
                <span className="text-slate-600 italic">No notes added.</span>
              )}
            </div>
          </div>

          {/* Collection */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Collection
            </label>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
              <Folder className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <span className="truncate">{bookmark.collections?.name || 'Unsorted'}</span>
            </div>
          </div>

          {/* URL Field */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              URL Link
            </label>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 font-mono">
              <Globe className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
              <span className="truncate text-[11px] select-all">{bookmark.url}</span>
            </div>
          </div>

          {/* Timestamp */}
          {bookmark.created_at && (
            <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-800/60">
              <Clock className="w-3.5 h-3.5" />
              <span>Saved on {new Date(bookmark.created_at).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onToggleFavorite?.(bookmark.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
            bookmark.is_favorite
              ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Star className={`w-3.5 h-3.5 ${bookmark.is_favorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
          <span>{bookmark.is_favorite ? 'Favorited' : 'Favorite'}</span>
        </button>

        <button
          type="button"
          onClick={() => onDelete?.(bookmark.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 text-xs font-semibold transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete</span>
        </button>
      </div>
    </aside>
  )
}
