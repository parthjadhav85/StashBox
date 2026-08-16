import { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import {
  Bookmark,
  Cloud,
  Inbox,
  Star,
  Archive,
  Folder,
  ChevronRight,
  ChevronDown,
  Plus,
  Hash,
  Settings,
  LogOut,
  Sliders,
  Moon,
  Sparkles,
  ExternalLink,
  Search,
  Check
} from 'lucide-react'

export default function Sidebar({
  activeView,
  setActiveView,
  selectedCollectionId,
  setSelectedCollectionId,
  selectedTag,
  setSelectedTag,
  collections = [],
  tags = [],
  bookmarkCounts = { all: 6, unsorted: 4, favorites: 2, archive: 1 },
  onOpenAddModal,
  onOpenCollectionModal,
  onOpenTagModal,
  isMobileOpen,
  setIsMobileOpen
}) {
  const { user, profile, logout } = useAuth()
  const [collectionsExpanded, setCollectionsExpanded] = useState(true)
  const [tagsExpanded, setTagsExpanded] = useState(true)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)

  const displayName = profile?.display_name || user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User'
  const email = user?.email || ''

  const handleSelectNav = (viewId) => {
    setActiveView(viewId)
    setSelectedCollectionId(null)
    setSelectedTag(null)
    setIsMobileOpen(false)
  }

  const handleSelectCollection = (collId) => {
    setActiveView('collection')
    setSelectedCollectionId(collId)
    setSelectedTag(null)
    setIsMobileOpen(false)
  }

  const handleSelectTag = (tagName) => {
    setActiveView('tag')
    setSelectedTag(tagName)
    setSelectedCollectionId(null)
    setIsMobileOpen(false)
  }

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 md:w-72 bg-[#121620] border-r border-slate-800/80
          flex flex-col justify-between select-none
          transform transition-transform duration-200 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Top: User Info & Brand Header */}
        <div>
          <div className="p-3 border-b border-slate-800/60 relative">
            <div
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/60 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 flex-shrink-0">
                  <Bookmark className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-bold text-slate-100 truncate block">
                      {displayName}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition-transform" />
                  </div>
                  <span className="text-[11px] text-slate-400 truncate block font-mono">
                    {email}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onOpenAddModal?.()
                }}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                title="Quick Add Bookmark"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* User Dropdown Menu */}
            {userDropdownOpen && (
              <div className="absolute top-16 left-3 right-3 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl p-1.5 z-50 text-xs text-slate-300">
                <div className="px-3 py-2 border-b border-slate-800 mb-1">
                  <p className="font-semibold text-slate-200 truncate">{displayName}</p>
                  <p className="text-[11px] text-slate-400 truncate">{email}</p>
                </div>
                <button
                  onClick={() => {
                    setUserDropdownOpen(false)
                    logout()
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-rose-500/10 hover:text-rose-400 transition-colors text-left text-slate-300 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>

          {/* Navigation Items */}
          <div className="p-3 space-y-0.5 overflow-y-auto max-h-[calc(100vh-220px)]">
            {/* System Nav Items */}
            <div className="space-y-0.5 mb-4">
              <button
                onClick={() => handleSelectNav('all')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  activeView === 'all'
                    ? 'bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Cloud className="w-4 h-4 text-indigo-400" />
                  <span>All bookmarks</span>
                </div>
                <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-slate-800/80 text-slate-400 font-mono">
                  {bookmarkCounts.all || 0}
                </span>
              </button>

              <button
                onClick={() => handleSelectNav('unsorted')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  activeView === 'unsorted'
                    ? 'bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Inbox className="w-4 h-4 text-amber-400" />
                  <span>Unsorted</span>
                </div>
                <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-slate-800/80 text-slate-400 font-mono">
                  {bookmarkCounts.unsorted || 0}
                </span>
              </button>

              <button
                onClick={() => handleSelectNav('favorites')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  activeView === 'favorites'
                    ? 'bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400/20" />
                  <span>Favorites</span>
                </div>
                <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-slate-800/80 text-slate-400 font-mono">
                  {bookmarkCounts.favorites || 0}
                </span>
              </button>

              <button
                onClick={() => handleSelectNav('archive')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  activeView === 'archive'
                    ? 'bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Archive className="w-4 h-4 text-slate-400" />
                  <span>Archive</span>
                </div>
                <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-slate-800/80 text-slate-400 font-mono">
                  {bookmarkCounts.archive || 0}
                </span>
              </button>
            </div>

            {/* Collections Section */}
            <div className="pt-2 mb-4 border-t border-slate-800/60">
              <div className="flex items-center justify-between px-2 py-1 mb-1 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                <button
                  type="button"
                  onClick={() => setCollectionsExpanded(!collectionsExpanded)}
                  className="flex items-center gap-1.5 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  {collectionsExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  <span>Collections</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenCollectionModal}
                  className="w-5 h-5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                  title="New Collection"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {collectionsExpanded && (
                <div className="space-y-0.5 pl-1">
                  {collections.length === 0 ? (
                    <div className="px-3 py-2 text-[11px] text-slate-500 italic">
                      No collections yet
                    </div>
                  ) : (
                    collections.map((coll) => {
                      const isSelected = activeView === 'collection' && selectedCollectionId === coll.id
                      return (
                        <button
                          key={coll.id}
                          onClick={() => handleSelectCollection(coll.id)}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-600/25 text-indigo-200 font-medium border border-indigo-500/30'
                              : 'text-slate-300 hover:bg-slate-800/50 hover:text-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: coll.color || '#6366f1' }}
                            />
                            <span className="truncate">{coll.name}</span>
                          </div>
                          {coll.bookmark_count !== undefined && (
                            <span className="text-[10px] text-slate-500 font-mono">
                              {coll.bookmark_count}
                            </span>
                          )}
                        </button>
                      )
                    })
                  )}
                </div>
              )}
            </div>

            {/* Tags Section */}
            <div className="pt-2 border-t border-slate-800/60">
              <div className="flex items-center justify-between px-2 py-1 mb-1 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                <button
                  type="button"
                  onClick={() => setTagsExpanded(!tagsExpanded)}
                  className="flex items-center gap-1.5 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  {tagsExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  <span>Tags</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenTagModal}
                  className="w-5 h-5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                  title="New Tag"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {tagsExpanded && (
                <div className="space-y-0.5 pl-1">
                  {tags.length === 0 ? (
                    <div className="px-3 py-2 text-[11px] text-slate-500 italic">
                      No tags created
                    </div>
                  ) : (
                    tags.map((t) => {
                      const isSelected = activeView === 'tag' && selectedTag === t.name
                      return (
                        <button
                          key={t.id || t.name}
                          onClick={() => handleSelectTag(t.name)}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-600/25 text-indigo-200 font-medium border border-indigo-500/30'
                              : 'text-slate-300 hover:bg-slate-800/50 hover:text-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Hash
                              className="w-3.5 h-3.5 flex-shrink-0"
                              style={{ color: t.color || '#94a3b8' }}
                            />
                            <span className="truncate">{t.name}</span>
                          </div>
                        </button>
                      )
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar: Settings & Branding */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] text-slate-400 font-medium">Stashbox v1.0</span>
            </div>
            <button
              type="button"
              onClick={logout}
              className="p-1.5 rounded-lg hover:bg-rose-500/10 hover:text-rose-400 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
