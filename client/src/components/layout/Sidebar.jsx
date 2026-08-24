import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
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
  LogOut
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
  const [activeMenu, setActiveMenu] = useState(null) // { coll, anchorRect }
  const menuRef = useRef(null)

  const displayName = profile?.display_name || user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'My Workspace'

  // Dismiss collection dropdown menu on outside click, scroll, resize, or Escape key
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActiveMenu(null)
      }
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveMenu(null)
      }
    }
    const handleScrollOrResize = () => {
      setActiveMenu(null)
    }

    if (activeMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
      window.addEventListener('resize', handleScrollOrResize)
      window.addEventListener('scroll', handleScrollOrResize, true)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('resize', handleScrollOrResize)
      window.removeEventListener('scroll', handleScrollOrResize, true)
    }
  }, [activeMenu])

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
    setActiveMenu(null)
    setIsMobileOpen(false)
  }

  const handleSelectCollection = (collId) => {
    setActiveView('collection')
    setSelectedCollectionId(collId)
    setActiveMenu(null)
    setIsMobileOpen(false)
  }

  // Recursive Tree Node Renderer for Nested Collections
  const renderCollectionNode = (coll, depth = 0) => {
    const children = getChildCollections(coll.id)
    const hasChildren = children.length > 0
    const isExpanded = !collapsedCollections[coll.id]
    const isSelected = activeView === 'collection' && selectedCollectionId === coll.id
    const isMenuOpen = activeMenu?.coll?.id === coll.id

    // Dynamic indentation scale (14px per depth step)
    const indentPadding = 8 + depth * 14

    return (
      <div key={coll.id} className="space-y-0.5">
        <div
          onClick={() => handleSelectCollection(coll.id)}
          className={`
            group relative flex items-center justify-between h-8.5 px-2.5 rounded-lg text-[13.5px] cursor-pointer transition-colors select-none
            ${
              isSelected
                ? 'bg-[var(--rd-item-active-bg)] text-[var(--rd-item-active-text)] font-medium shadow-2xs'
                : 'text-[var(--rd-text-secondary)] hover:text-[var(--rd-text-primary)] hover:bg-[var(--rd-bg-hover)]'
            }
          `}
          style={{ paddingLeft: `${indentPadding}px` }}
        >
          {/* Left: Slot + Icon + Flexible truncated Label */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
            {/* Fixed-width 16px disclosure slot */}
            <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
              {hasChildren ? (
                <button
                  type="button"
                  onClick={(e) => toggleCollapse(coll.id, e)}
                  className={`w-4 h-4 rounded flex items-center justify-center hover:bg-white/10 transition-colors ${
                    isSelected ? 'text-[var(--rd-item-active-text)]' : 'text-[var(--rd-text-muted)] hover:text-[var(--rd-text-primary)]'
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
              icon={coll.icon || '📁'}
              color={isSelected ? '#ffffff' : coll.color}
              className="w-4.5 h-4.5 flex-shrink-0"
            />

            {/* Collection Name: flexible, truncated */}
            <span className="truncate leading-tight font-normal">{coll.name}</span>
          </div>

          {/* Right: Dedicated Three-Dot Pill Button + Count Badge */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Three-Dot Action Button (Matches Raindrop screenshot media_1787604381364.png) */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                const rect = e.currentTarget.getBoundingClientRect()
                setActiveMenu(activeMenu?.coll?.id === coll.id ? null : { coll, anchorRect: rect })
              }}
              aria-label={`Collection actions for ${coll.name}`}
              className={`w-7.5 h-5.5 rounded flex items-center justify-center cursor-pointer transition-all flex-shrink-0 ${
                isMenuOpen
                  ? 'opacity-100 bg-white/20 text-white'
                  : isSelected
                  ? 'opacity-80 hover:opacity-100 bg-white/10 hover:bg-white/20 text-white'
                  : 'opacity-0 group-hover:opacity-100 text-[var(--rd-text-muted)] hover:text-white hover:bg-white/10'
              }`}
              title="Collection actions"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {/* Bookmark Count Badge */}
            {coll.bookmark_count !== undefined && (
              <span
                className={`text-[12px] font-mono tabular-nums text-right min-w-[18px] flex-shrink-0 ${
                  isSelected
                    ? 'text-[var(--rd-item-active-text)] font-medium'
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
          w-64 lg:w-[250px] bg-[var(--rd-bg-sidebar)] border-r border-[var(--rd-border)]
          flex flex-col justify-between select-none
          transform transition-transform duration-150 ease-out flex-shrink-0
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Top: Profile / Workspace Header */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="relative border-b border-[var(--rd-border)]">
            <div className="h-13 px-3.5 flex items-center justify-between">
              {/* Profile Dropdown Trigger */}
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 min-w-0 px-2 py-1.5 rounded-lg hover:bg-[var(--rd-bg-hover)] transition-colors cursor-pointer text-left group"
              >
                <div className="w-6 h-6 rounded-full bg-[var(--rd-bg-card)] border border-[var(--rd-border)] flex items-center justify-center text-[11px] font-bold text-[var(--rd-text-secondary)] flex-shrink-0">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <span className="text-[13.5px] font-semibold text-[var(--rd-text-primary)] truncate max-w-[130px]">
                  {displayName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[var(--rd-text-muted)] group-hover:text-[var(--rd-text-primary)] transition-colors flex-shrink-0" />
              </button>

              {/* Quick Add Button */}
              <button
                type="button"
                onClick={onOpenAddModal}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--rd-text-muted)] hover:text-[var(--rd-text-primary)] hover:bg-[var(--rd-bg-hover)] transition-colors cursor-pointer"
                title="Add Bookmark"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Dropdown Menu */}
            {isProfileMenuOpen && (
              <div className="absolute top-13 left-2 right-2 bg-[var(--rd-bg-card)] border border-[var(--rd-border)] rounded-xl shadow-2xl p-1.5 z-50 text-[13px]">
                <div className="px-3 py-2 border-b border-[var(--rd-border-subtle)] mb-1">
                  <p className="font-semibold text-[var(--rd-text-primary)] truncate">{displayName}</p>
                  <p className="text-[11.5px] text-[var(--rd-text-muted)] truncate">{user?.email}</p>
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
          <div className="flex-1 p-2.5 space-y-3 overflow-y-auto">
            {/* System Views */}
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => handleSelectNav('all')}
                className={`w-full flex items-center justify-between h-8.5 px-2.5 rounded-lg text-[13.5px] cursor-pointer transition-colors ${
                  activeView === 'all'
                    ? 'bg-[var(--rd-item-active-bg)] text-[var(--rd-item-active-text)] font-medium shadow-2xs'
                    : 'text-[var(--rd-text-secondary)] hover:text-[var(--rd-text-primary)] hover:bg-[var(--rd-bg-hover)]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Cloud className="w-4 h-4 flex-shrink-0" />
                  <span>All bookmarks</span>
                </div>
                <span
                  className={`text-[12px] font-mono tabular-nums ${
                    activeView === 'all' ? 'text-[var(--rd-item-active-text)] font-medium' : 'text-[var(--rd-text-muted)]'
                  }`}
                >
                  {bookmarkCounts.all || 0}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectNav('unsorted')}
                className={`w-full flex items-center justify-between h-8.5 px-2.5 rounded-lg text-[13.5px] cursor-pointer transition-colors ${
                  activeView === 'unsorted'
                    ? 'bg-[var(--rd-item-active-bg)] text-[var(--rd-item-active-text)] font-medium shadow-2xs'
                    : 'text-[var(--rd-text-secondary)] hover:text-[var(--rd-text-primary)] hover:bg-[var(--rd-bg-hover)]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Inbox className="w-4 h-4 flex-shrink-0" />
                  <span>Unsorted</span>
                </div>
                <span
                  className={`text-[12px] font-mono tabular-nums ${
                    activeView === 'unsorted' ? 'text-[var(--rd-item-active-text)] font-medium' : 'text-[var(--rd-text-muted)]'
                  }`}
                >
                  {bookmarkCounts.unsorted || 0}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectNav('favorites')}
                className={`w-full flex items-center justify-between h-8.5 px-2.5 rounded-lg text-[13.5px] cursor-pointer transition-colors ${
                  activeView === 'favorites'
                    ? 'bg-[var(--rd-item-active-bg)] text-[var(--rd-item-active-text)] font-medium shadow-2xs'
                    : 'text-[var(--rd-text-secondary)] hover:text-[var(--rd-text-primary)] hover:bg-[var(--rd-bg-hover)]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500 flex-shrink-0" />
                  <span>Favorites</span>
                </div>
                <span
                  className={`text-[12px] font-mono tabular-nums ${
                    activeView === 'favorites' ? 'text-[var(--rd-item-active-text)] font-medium' : 'text-[var(--rd-text-muted)]'
                  }`}
                >
                  {bookmarkCounts.favorites || 0}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectNav('archive')}
                className={`w-full flex items-center justify-between h-8.5 px-2.5 rounded-lg text-[13.5px] cursor-pointer transition-colors ${
                  activeView === 'archive'
                    ? 'bg-[var(--rd-item-active-bg)] text-[var(--rd-item-active-text)] font-medium shadow-2xs'
                    : 'text-[var(--rd-text-secondary)] hover:text-[var(--rd-text-primary)] hover:bg-[var(--rd-bg-hover)]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Archive className="w-4 h-4 flex-shrink-0" />
                  <span>Trash / Archive</span>
                </div>
                <span
                  className={`text-[12px] font-mono tabular-nums ${
                    activeView === 'archive' ? 'text-[var(--rd-item-active-text)] font-medium' : 'text-[var(--rd-text-muted)]'
                  }`}
                >
                  {bookmarkCounts.archive || 0}
                </span>
              </button>
            </div>

            {/* Recursive Collections Section */}
            <div>
              <div className="flex items-center justify-between px-2.5 py-1.5 mb-0.5 text-[12px] font-medium text-[var(--rd-text-muted)] tracking-wide">
                <span>Collections</span>
                <button
                  type="button"
                  onClick={() => onOpenCollectionModal?.(null)}
                  className="p-1 rounded hover:bg-[var(--rd-bg-hover)] text-[var(--rd-text-muted)] hover:text-[var(--rd-text-primary)] transition-colors cursor-pointer"
                  title="New Collection"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-0.5">
                {rootCollections.length === 0 ? (
                  <div className="px-2.5 py-1.5 text-[12.5px] text-[var(--rd-text-muted)] italic">
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
        <div className="p-2.5 border-t border-[var(--rd-border)] bg-[var(--rd-bg-sidebar)]">
          {/* New Collection Quick Button */}
          <button
            type="button"
            onClick={() => onOpenCollectionModal?.(null)}
            className="w-full flex items-center gap-2 py-1.5 px-2.5 rounded-lg text-[13px] font-normal text-[var(--rd-text-muted)] hover:text-[var(--rd-text-primary)] hover:bg-[var(--rd-bg-hover)] transition-colors cursor-pointer mb-1"
          >
            <FolderPlus className="w-4 h-4" />
            <span>New collection...</span>
          </button>

          {/* Bottom Icons Toolbar */}
          <div className="flex items-center justify-around pt-1 text-[var(--rd-text-muted)]">
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

      {/* Floating Context Menu Portaled to document.body (Anchored directly to clicked three-dot button) */}
      {activeMenu && typeof document !== 'undefined' && createPortal(
        <div
          ref={menuRef}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            top: `${Math.min(activeMenu.anchorRect.bottom + 4, window.innerHeight - 260)}px`,
            left: `${Math.max(8, Math.min(activeMenu.anchorRect.left, window.innerWidth - 210))}px`,
            zIndex: 9999
          }}
          className="w-52 bg-[var(--rd-bg-card)] border border-[var(--rd-border)] rounded-xl shadow-2xl py-1.5 text-[13.5px] text-[var(--rd-text-primary)] animate-in zoom-in-95 duration-100 select-none"
        >
          {/* Group 1: Open all bookmarks, Create nested collection */}
          <div className="py-0.5">
            <button
              type="button"
              onClick={() => {
                handleSelectCollection(activeMenu.coll.id)
                setActiveMenu(null)
              }}
              className="w-full px-3.5 py-1.5 hover:bg-white/10 text-left cursor-pointer transition-colors"
            >
              Open all bookmarks
            </button>
            <button
              type="button"
              onClick={() => {
                onOpenCollectionModal?.(activeMenu.coll.id)
                setActiveMenu(null)
              }}
              className="w-full px-3.5 py-1.5 hover:bg-white/10 text-left cursor-pointer transition-colors"
            >
              Create nested collection
            </button>
          </div>

          <div className="border-t border-[var(--rd-border-subtle)] my-1" />

          {/* Group 2: Select, Rename, Change icon */}
          <div className="py-0.5">
            <button
              type="button"
              onClick={() => {
                handleSelectCollection(activeMenu.coll.id)
                setActiveMenu(null)
              }}
              className="w-full px-3.5 py-1.5 hover:bg-white/10 text-left cursor-pointer transition-colors"
            >
              Select
            </button>
            <button
              type="button"
              onClick={() => {
                onOpenCollectionEdit?.(activeMenu.coll, { initialPickIcon: false })
                setActiveMenu(null)
              }}
              className="w-full px-3.5 py-1.5 hover:bg-white/10 text-left cursor-pointer transition-colors"
            >
              Rename
            </button>
            <button
              type="button"
              onClick={() => {
                onOpenCollectionEdit?.(activeMenu.coll, { initialPickIcon: true })
                setActiveMenu(null)
              }}
              className="w-full px-3.5 py-1.5 hover:bg-white/10 text-left cursor-pointer transition-colors"
            >
              Change icon
            </button>
          </div>

          <div className="border-t border-[var(--rd-border-subtle)] my-1" />

          {/* Group 3: Delete (Soft destructive red) */}
          <div className="py-0.5">
            <button
              type="button"
              onClick={() => {
                onOpenCollectionEdit?.(activeMenu.coll)
                setActiveMenu(null)
              }}
              className="w-full px-3.5 py-1.5 hover:bg-rose-500/10 text-rose-500 text-left cursor-pointer transition-colors font-medium"
            >
              Delete
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
