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
  Hash,
  Download
} from 'lucide-react'
import CollectionIcon from '../common/CollectionIcon.jsx'

export default function Sidebar({
  activeView,
  setActiveView,
  selectedCollectionId,
  setSelectedCollectionId,
  selectedTag,
  setSelectedTag,
  collections = [],
  tags = [],
  bookmarkCounts = { all: 0, unsorted: 0, favorites: 0, archive: 0 },
  onOpenAddModal,
  onOpenCollectionModal,
  onOpenCollectionEdit,
  onOpenSettings,
  isMobileOpen,
  setIsMobileOpen
}) {
  const [collapsedCollections, setCollapsedCollections] = useState({})

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

  // Recursive Tree Node Renderer for Nested Collections
  const renderCollectionNode = (coll, depth = 0) => {
    const children = getChildCollections(coll.id)
    const hasChildren = children.length > 0
    const isExpanded = !collapsedCollections[coll.id]
    const isSelected = activeView === 'collection' && selectedCollectionId === coll.id

    // Dynamic indentation scale (16px per depth step)
    const indentPadding = 8 + depth * 16

    return (
      <div key={coll.id} className="space-y-0.5">
        <div
          onClick={() => handleSelectCollection(coll.id)}
          className={`
            group flex items-center justify-between py-1.5 pr-2 rounded-lg text-xs font-medium cursor-pointer transition-colors select-none
            ${
              isSelected
                ? 'bg-[var(--rd-accent-active)] text-white shadow-xs font-semibold'
                : 'text-[var(--rd-text-primary)] hover:bg-[var(--rd-bg-hover)]'
            }
          `}
          style={{ paddingLeft: `${indentPadding}px` }}
        >
          {/* Left: Fixed-Width Arrow Slot + Icon + Label */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
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
          <div className="flex items-center gap-1 flex-shrink-0">
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
                className={`text-[11px] font-mono tabular-nums px-1.5 rounded text-right min-w-[20px] ${
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
          w-60 md:w-64 bg-[var(--rd-bg-sidebar)] border-r border-[var(--rd-border)]
          flex flex-col justify-between select-none
          transform transition-transform duration-150 ease-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Top: Header with Brand & Add Button */}
        <div>
          <div className="h-12 px-4 border-b border-[var(--rd-border)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-widest uppercase text-[var(--rd-text-primary)]">
                STASHBOX
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--rd-accent-blue)]" />
            </div>

            <button
              type="button"
              onClick={onOpenAddModal}
              className="p-1 rounded-md text-[var(--rd-text-secondary)] hover:text-[var(--rd-text-primary)] hover:bg-[var(--rd-bg-hover)] transition-colors cursor-pointer"
              title="Add Bookmark"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Items Scroll Area */}
          <div className="p-2 space-y-4 overflow-y-auto max-h-[calc(100vh-100px)]">
            {/* System Views */}
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => handleSelectNav('all')}
                className={`w-full flex items-center justify-between py-1.5 px-3 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  activeView === 'all'
                    ? 'bg-[var(--rd-accent-active)] text-white shadow-xs font-semibold'
                    : 'text-[var(--rd-text-primary)] hover:bg-[var(--rd-bg-hover)]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Cloud className="w-4 h-4" />
                  <span>All</span>
                </div>
                <span
                  className={`text-[11px] font-mono tabular-nums ${
                    activeView === 'all' ? 'text-white' : 'text-[var(--rd-text-muted)]'
                  }`}
                >
                  {bookmarkCounts.all || 0}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectNav('unsorted')}
                className={`w-full flex items-center justify-between py-1.5 px-3 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  activeView === 'unsorted'
                    ? 'bg-[var(--rd-accent-active)] text-white shadow-xs font-semibold'
                    : 'text-[var(--rd-text-primary)] hover:bg-[var(--rd-bg-hover)]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Inbox className="w-4 h-4" />
                  <span>Unsorted</span>
                </div>
                <span
                  className={`text-[11px] font-mono tabular-nums ${
                    activeView === 'unsorted' ? 'text-white' : 'text-[var(--rd-text-muted)]'
                  }`}
                >
                  {bookmarkCounts.unsorted || 0}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectNav('favorites')}
                className={`w-full flex items-center justify-between py-1.5 px-3 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  activeView === 'favorites'
                    ? 'bg-[var(--rd-accent-active)] text-white shadow-xs font-semibold'
                    : 'text-[var(--rd-text-primary)] hover:bg-[var(--rd-bg-hover)]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                  <span>Favorites</span>
                </div>
                <span
                  className={`text-[11px] font-mono tabular-nums ${
                    activeView === 'favorites' ? 'text-white' : 'text-[var(--rd-text-muted)]'
                  }`}
                >
                  {bookmarkCounts.favorites || 0}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectNav('archive')}
                className={`w-full flex items-center justify-between py-1.5 px-3 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  activeView === 'archive'
                    ? 'bg-[var(--rd-accent-active)] text-white shadow-xs font-semibold'
                    : 'text-[var(--rd-text-primary)] hover:bg-[var(--rd-bg-hover)]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Archive className="w-4 h-4" />
                  <span>Archive</span>
                </div>
                <span
                  className={`text-[11px] font-mono tabular-nums ${
                    activeView === 'archive' ? 'text-white' : 'text-[var(--rd-text-muted)]'
                  }`}
                >
                  {bookmarkCounts.archive || 0}
                </span>
              </button>
            </div>

            {/* Recursive Collections Section */}
            <div>
              <div className="flex items-center justify-between px-3 py-1 mb-1 text-[11px] font-semibold text-[var(--rd-text-secondary)]">
                <span>Collections</span>
                <button
                  type="button"
                  onClick={onOpenCollectionModal}
                  className="p-0.5 rounded hover:bg-[var(--rd-bg-hover)] text-[var(--rd-text-secondary)] hover:text-[var(--rd-text-primary)] transition-colors cursor-pointer"
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

            {/* Tags Section */}
            {tags.length > 0 && (
              <div>
                <div className="px-3 py-1 mb-1 text-[11px] font-semibold text-[var(--rd-text-secondary)]">
                  <span>Tags</span>
                </div>
                <div className="space-y-0.5">
                  {tags.map((t) => {
                    const isSelected = activeView === 'tag' && selectedTag === t.name
                    return (
                      <button
                        key={t.id || t.name}
                        type="button"
                        onClick={() => handleSelectTag(t.name)}
                        className={`w-full flex items-center justify-between py-1.5 px-3 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-[var(--rd-accent-active)] text-white shadow-xs font-semibold'
                            : 'text-[var(--rd-text-primary)] hover:bg-[var(--rd-bg-hover)]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Hash className="w-3.5 h-3.5 opacity-60" />
                          <span className="truncate">{t.name}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="p-2 border-t border-[var(--rd-border)] bg-[var(--rd-bg-sidebar)]">
          {/* New Collection Quick Button */}
          <button
            type="button"
            onClick={onOpenCollectionModal}
            className="w-full flex items-center gap-2 py-1.5 px-3 rounded-lg text-xs font-medium text-[var(--rd-text-secondary)] hover:text-[var(--rd-text-primary)] hover:bg-[var(--rd-bg-hover)] transition-colors cursor-pointer mb-1"
          >
            <FolderPlus className="w-4 h-4" />
            <span>New collection...</span>
          </button>

          {/* Bottom Icons Toolbar */}
          <div className="flex items-center justify-around pt-1 text-[var(--rd-text-secondary)]">
            <button
              type="button"
              onClick={() => handleSelectNav('favorites')}
              className="p-1.5 rounded-lg hover:text-[var(--rd-text-primary)] hover:bg-[var(--rd-bg-hover)] transition-colors cursor-pointer"
              title="Favorites"
            >
              <Heart className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onOpenAddModal}
              className="p-1.5 rounded-lg hover:text-[var(--rd-text-primary)] hover:bg-[var(--rd-bg-hover)] transition-colors cursor-pointer"
              title="Save Bookmark"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onOpenSettings}
              className="p-1.5 rounded-lg hover:text-[var(--rd-text-primary)] hover:bg-[var(--rd-bg-hover)] transition-colors cursor-pointer"
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
