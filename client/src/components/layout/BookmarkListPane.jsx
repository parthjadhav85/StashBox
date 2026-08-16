import {
  Globe,
  Star,
  ExternalLink,
  Folder,
  Tag,
  Clock,
  MoreVertical,
  Bookmark,
  Plus,
  Trash2,
  Edit2
} from 'lucide-react'

export default function BookmarkListPane({
  bookmarks = [],
  viewMode = 'list',
  selectedBookmarkId,
  onSelectBookmark,
  onToggleFavorite,
  onOpenAddModal
}) {
  if (!bookmarks || bookmarks.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[400px]">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 text-slate-500 shadow-inner">
          <Bookmark className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-200 mb-1">No bookmarks in this view</h3>
        <p className="text-xs text-slate-400 max-w-sm mb-6">
          Save your favorite articles, websites, repositories, and tools to access them from anywhere.
        </p>
        <button
          type="button"
          onClick={onOpenAddModal}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add your first bookmark</span>
        </button>
      </div>
    )
  }

  if (viewMode === 'grid') {
    return (
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {bookmarks.map((bm) => {
            const isSelected = selectedBookmarkId === bm.id
            return (
              <div
                key={bm.id}
                onClick={() => onSelectBookmark?.(bm)}
                className={`
                  group relative rounded-2xl border p-4 transition-all cursor-pointer flex flex-col justify-between
                  ${
                    isSelected
                      ? 'bg-indigo-950/30 border-indigo-500/50 shadow-lg shadow-indigo-950/50'
                      : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800/80 hover:border-slate-700'
                  }
                `}
              >
                <div>
                  {/* Top Row: Favicon & Domain */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      {bm.favicon_url ? (
                        <img
                          src={bm.favicon_url}
                          alt=""
                          className="w-4 h-4 rounded-sm flex-shrink-0"
                          onError={(e) => { e.target.style.display = 'none' }}
                        />
                      ) : (
                        <Globe className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      )}
                      <span className="text-[11px] font-mono text-slate-400 truncate">
                        {bm.domain || 'website'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onToggleFavorite?.(bm.id)
                      }}
                      className={`p-1 rounded-md transition-colors cursor-pointer ${
                        bm.is_favorite
                          ? 'text-yellow-400'
                          : 'text-slate-500 hover:text-slate-300 opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${bm.is_favorite ? 'fill-yellow-400' : ''}`} />
                    </button>
                  </div>

                  {/* Title */}
                  <h4 className="text-xs font-bold text-slate-100 line-clamp-2 mb-1.5 group-hover:text-indigo-300 transition-colors">
                    {bm.title || bm.url}
                  </h4>

                  {/* Description Preview */}
                  {bm.description && (
                    <p className="text-[11px] text-slate-400 line-clamp-2 mb-3">
                      {bm.description}
                    </p>
                  )}
                </div>

                {/* Bottom Metadata */}
                <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
                  <div className="flex items-center gap-1.5 truncate">
                    {bm.collections?.name ? (
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 truncate">
                        {bm.collections.name}
                      </span>
                    ) : (
                      <span className="text-slate-500">Unsorted</span>
                    )}
                  </div>

                  <a
                    href={bm.url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Standard Raindrop-style List View
  return (
    <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50">
      {bookmarks.map((bm) => {
        const isSelected = selectedBookmarkId === bm.id
        return (
          <div
            key={bm.id}
            onClick={() => onSelectBookmark?.(bm)}
            className={`
              group px-4 sm:px-6 py-3 transition-colors cursor-pointer flex items-center justify-between gap-4 select-none
              ${
                isSelected
                  ? 'bg-indigo-950/40 border-l-2 border-indigo-500'
                  : 'hover:bg-slate-900/60'
              }
            `}
          >
            {/* Left: Favicon & Info */}
            <div className="flex items-center gap-3.5 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center flex-shrink-0 text-slate-400">
                {bm.favicon_url ? (
                  <img
                    src={bm.favicon_url}
                    alt=""
                    className="w-4 h-4 rounded-xs"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                ) : (
                  <Globe className="w-4 h-4" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-100 truncate group-hover:text-indigo-300 transition-colors">
                    {bm.title || bm.url}
                  </h4>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                  <span className="font-mono text-slate-500">{bm.domain || 'link'}</span>
                  <span>•</span>
                  {bm.collections?.name ? (
                    <span className="text-indigo-400 font-medium truncate max-w-[120px]">
                      {bm.collections.name}
                    </span>
                  ) : (
                    <span className="text-slate-500">Unsorted</span>
                  )}
                  {bm.description && (
                    <>
                      <span>•</span>
                      <span className="truncate text-slate-400 hidden md:inline max-w-sm">
                        {bm.description}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Actions & Star */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleFavorite?.(bm.id)
                }}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  bm.is_favorite
                    ? 'text-yellow-400'
                    : 'text-slate-500 hover:text-slate-300 opacity-0 group-hover:opacity-100'
                }`}
                title={bm.is_favorite ? 'Favorited' : 'Add to favorites'}
              >
                <Star className={`w-4 h-4 ${bm.is_favorite ? 'fill-yellow-400' : ''}`} />
              </button>

              <a
                href={bm.url}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                title="Open in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        )
      })}
    </div>
  )
}
