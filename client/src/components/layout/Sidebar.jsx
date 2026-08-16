import { useState } from 'react'
import {
  Cloud,
  Inbox,
  Heart,
  Archive,
  ChevronRight,
  ChevronDown,
  Plus,
  Settings,
  FolderPlus,
  MoreHorizontal,
  Download,
  User,
  LogOut,
  Folder
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import CollectionIcon from '../common/CollectionIcon.jsx'

export default function Sidebar({
  activeView,
  setActiveView,
  selectedCollectionId,
  setSelectedCollectionId,
  collections = [],
  bookmarkCounts = { all: 0, unsorted: 0, favorites: 0, archive: 0 },
  onOpenAddModal,
  onOpenCollectionModal,
  onOpenCollectionEdit,
  onOpenSettings,
  isMobileOpen,
  setIsMobileOpen
}) {
  const { user, profile, logout } = useAuth()
  const [collapsedCollections, setCollapsedCollections] = useState({})
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)

  const displayName = profile?.display_name || user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'My Workspace'
  const userInitial = displayName.charAt(0).toUpperCase()

  const toggleCollapse = (id, e) => {
    e.stopPropagation()
    setCollapsedCollections(prev => ({ ...prev, [id]: !prev[id] }))
  }

  // Build tree of collections (parent / children)
  const rootCollections = collections.filter(c => !c.parent_id)
  const getChildCollections = (parentId) => collections.filter(c => c.parent_id === parentId)

  const handleSelectNav = (viewId) => {
    setActiveView(viewId)
    setSelectedCollectionId(null)
    setIsMobileOpen(false)
  }

  const handleSelectCollection = (collId) => {
    setActiveView('collection')
    setSelectedCollectionId(collId)
    setIsMobileOpen(false)
  }

  // Recursive Tree Node Renderer for Nested Collections
  const renderCollectionNode = (coll, depth = 0) => {
    const children = getChildCollections(coll.id)
    const hasChildren = children.length > 0
    const isExpanded = !collapsedCollections[coll.id]
    const isSelected = activeView === 'collection' && selectedCollectionId === coll.id

    // Dynamic indentation scale (14px per depth step)
    const indentPadding = 10 + depth * 14

    return (
      <div key={coll.id} className="space-y-0.5">
        <div
          onClick={() => handleSelectCollection(coll.id)}
          className={`
            group flex items-center justify-between py-2 pr-2.5 rounded-lg text-[13px] font-medium cursor-pointer transition-colors select-none
            ${
              isSelected
                ? 'bg-[var(--rd-accent-active)] text-white shadow-xs font-semibold'
                : 'text-[var(--rd-text-primary)] hover:bg-[var(--rd-bg-hover)]'
            }
          `}
          style={{ paddingLeft: `${indentPadding}px` }}
        >
          {/* Left: Fixed-Width Arrow Slot + Icon + Label */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {/* Fixed-width 16px disclosure slot */}
            <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
              {hasChildren ? (
                <button
                  type="button"
                  onClick={(e) => toggleCollapse(coll.id, e)}
                  className={`w-4 h-4 rounded flex items-center justify-center hover:bg-black/10 transition-colors ${
                    isSelected ? 'text-white' : 'text-[var(--rd-text-secondary)] hover:text-[var(--rd-text-primary)]'
                  }`}
                  aria-label={isExpanded ? 'Collapse collection' : 'Expand collection'}
                >
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                </button>
              ) : null}
            </div>

            {/* Collection Icon */}
            <CollectionIcon
              icon={coll.icon || 'folder'}
              color={isSelected ? '#ffffff' : coll.color}
              className="w-4 h-4 flex-shrink-0"
            />

            {/* Collection Name */}
            <span className="truncate">{coll.name}</span>
          </div>

          {/* Right: Context Action + Count Badge */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onOpenCollectionEdit?.(coll)
              }}
              className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
                isSelected
                  ? 'text-white hover:bg-white/20'
                  : 'text-[var(--rd-text-secondary)] hover:text-[var(--rd-text-primary)] hover:bg-[var(--rd-bg-hover)]'
              }`}
              title="Edit Collection"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>

            {coll.bookmark_count !== undefined && (
              <span
                className={`text-xs font-mono tabular-nums px-1.5 py-0.5 rounded text-right min-w-[20px] ${
                  isSelected
                    ? 'text-white/90 bg-white/10'
                    : 'text-[var(--rd-text-muted)]'
                }`}
              >
                {coll.bookmark_count}
              </span>
            )}
          </div>
        </div>

        {/* Render recursive children when expanded */}
        {hasChildren && isExpanded && (
          <div className="space-y-0.5">
            {children.map((child) => renderCollectionNode(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 lg:w-[270px] bg-[var(--rd-bg-sidebar)] border-r border-[var(--rd-border)]
          flex flex-col justify-between select-none
          transform transition-transform duration-150 ease-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Top: Profile / Workspace Header */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="relative border-b border-[var(--rd-border)]">
            <div className="h-14 px-3.5 flex items-center justify-between">
              {/* Profile Dropdown Trigger (Clean Text Workspace Selector) */}
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-1.5 min-w-0 px-2.5 py-1.5 rounded-xl hover:bg-[var(--rd-bg-hover)] transition-colors cursor-pointer text-left group"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-bold text-[var(--rd-text-primary)] truncate max-w-[150px]">
                      {displayName}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-[var(--rd-text-muted)] group-hover:text-[var(--rd-text-primary)] transition-colors flex-shrink-0" />
                  </div>
                  <p className="text-[11px] text-[var(--rd-text-muted)] font-medium truncate">
                    Personal workspace
                  </p>
                </div>
              </button>

              {/* Quick Add Button */}
              <button
                type="button"
                onClick={onOpenAddModal}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--rd-text-secondary)] hover:text-[var(--rd-text-primary)] hover:bg-[var(--rd-bg-hover)] transition-colors cursor-pointer"
                title="Add Bookmark"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Dropdown Menu */}
            {isProfileMenuOpen && (
              <div className="absolute top-14 left-3 right-3 bg-[var(--rd-bg-card)] border border-[var(--rd-border)] rounded-xl shadow-xl p-1.5 z-50 text-xs">
                <div className="px-3 py-2 border-b border-[var(--rd-border-subtle)] mb-1">
                  <p className="font-semibold text-[var(--rd-text-primary)] truncate">{displayName}</p>
                  <p className="text-[11px] text-[var(--rd-text-muted)] truncate">{user?.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen(false)
                    onOpenSettings?.()
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[var(--rd-text-primary)] hover:bg-[var(--rd-bg-hover)] transition-colors cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-[var(--rd-text-secondary)]" />
                  <span>Settings & Appearance</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen(false)
                    logout?.()
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>

          {/* Navigation Items Scroll Area */}
          <div className="flex-1 p-3 space-y-5 overflow-y-auto">
            {/* System Views */}
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => handleSelectNav('all')}
                className={`w-full flex items-center justify-between py-2 px-3 rounded-lg text-[13px] font-medium cursor-pointer transition-colors ${
                  activeView === 'all'
                    ? 'bg-[var(--rd-accent-active)] text-white shadow-xs font-semibold'
                    : 'text-[var(--rd-text-primary)] hover:bg-[var(--rd-bg-hover)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Cloud className="w-4 h-4" />
                  <span>All bookmarks</span>
                </div>
                <span
                  className={`text-xs font-mono tabular-nums ${
                    activeView === 'all' ? 'text-white' : 'text-[var(--rd-text-muted)]'
                  }`}
                >
                  {bookmarkCounts.all || 0}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectNav('unsorted')}
                className={`w-full flex items-center justify-between py-2 px-3 rounded-lg text-[13px] font-medium cursor-pointer transition-colors ${
                  activeView === 'unsorted'
                    ? 'bg-[var(--rd-accent-active)] text-white shadow-xs font-semibold'
                    : 'text-[var(--rd-text-primary)] hover:bg-[var(--rd-bg-hover)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Inbox className="w-4 h-4" />
                  <span>Unsorted</span>
                </div>
                <span
                  className={`text-xs font-mono tabular-nums ${
                    activeView === 'unsorted' ? 'text-white' : 'text-[var(--rd-text-muted)]'
                  }`}
                >
                  {bookmarkCounts.unsorted || 0}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectNav('favorites')}
                className={`w-full flex items-center justify-between py-2 px-3 rounded-lg text-[13px] font-medium cursor-pointer transition-colors ${
                  activeView === 'favorites'
                    ? 'bg-[var(--rd-accent-active)] text-white shadow-xs font-semibold'
                    : 'text-[var(--rd-text-primary)] hover:bg-[var(--rd-bg-hover)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                  <span>Favorites</span>
                </div>
                <span
                  className={`text-xs font-mono tabular-nums ${
                    activeView === 'favorites' ? 'text-white' : 'text-[var(--rd-text-muted)]'
                  }`}
                >
                  {bookmarkCounts.favorites || 0}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectNav('archive')}
                className={`w-full flex items-center justify-between py-2 px-3 rounded-lg text-[13px] font-medium cursor-pointer transition-colors ${
                  activeView === 'archive'
                    ? 'bg-[var(--rd-accent-active)] text-white shadow-xs font-semibold'
                    : 'text-[var(--rd-text-primary)] hover:bg-[var(--rd-bg-hover)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Archive className="w-4 h-4" />
                  <span>Trash / Archive</span>
                </div>
                <span
                  className={`text-xs font-mono tabular-nums ${
                    activeView === 'archive' ? 'text-white' : 'text-[var(--rd-text-muted)]'
                  }`}
                >
                  {bookmarkCounts.archive || 0}
                </span>
              </button>
            </div>

            {/* Recursive Collections Section */}
            <div>
              <div className="flex items-center justify-between px-3 py-1.5 mb-1 text-[11px] font-bold uppercase tracking-wider text-[var(--rd-text-muted)]">
                <span>Collections</span>
                <button
                  type="button"
                  onClick={onOpenCollectionModal}
                  className="p-1 rounded-md hover:bg-[var(--rd-bg-hover)] text-[var(--rd-text-secondary)] hover:text-[var(--rd-text-primary)] transition-colors cursor-pointer"
                  title="New Collection"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-0.5">
                {rootCollections.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-[var(--rd-text-muted)] italic">
                    No collections yet
                  </div>
                ) : (
                  rootCollections.map((coll) => renderCollectionNode(coll, 0))
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Bar */}
        <div className="p-3 border-t border-[var(--rd-border)] bg-[var(--rd-bg-sidebar)]">
          {/* New Collection Quick Button */}
          <button
            type="button"
            onClick={onOpenCollectionModal}
            className="w-full flex items-center gap-2.5 py-2 px-3 rounded-xl text-xs font-semibold text-[var(--rd-text-secondary)] hover:text-[var(--rd-text-primary)] hover:bg-[var(--rd-bg-hover)] transition-colors cursor-pointer mb-2"
          >
            <FolderPlus className="w-4 h-4" />
            <span>New collection...</span>
          </button>

          {/* Bottom Icons Toolbar */}
          <div className="flex items-center justify-around pt-1 text-[var(--rd-text-secondary)]">
            <button
              type="button"
              onClick={() => handleSelectNav('favorites')}
              className="p-2 rounded-lg hover:text-[var(--rd-text-primary)] hover:bg-[var(--rd-bg-hover)] transition-colors cursor-pointer"
              title="Favorites"
            >
              <Heart className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onOpenAddModal}
              className="p-2 rounded-lg hover:text-[var(--rd-text-primary)] hover:bg-[var(--rd-bg-hover)] transition-colors cursor-pointer"
              title="Save Bookmark"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onOpenSettings}
              className="p-2 rounded-lg hover:text-[var(--rd-text-primary)] hover:bg-[var(--rd-bg-hover)] transition-colors cursor-pointer"
              title="Settings & Appearance"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
