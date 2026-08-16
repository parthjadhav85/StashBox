import { useState, useEffect, useCallback, useRef } from 'react'
import { api } from '../../api/api.js'
import Sidebar from './Sidebar.jsx'
import TopNavbar from './TopNavbar.jsx'
import BookmarkListPane from './BookmarkListPane.jsx'
import BookmarkDetailPane from './BookmarkDetailPane.jsx'
import AddBookmarkModal from '../modals/AddBookmarkModal.jsx'
import EditBookmarkModal from '../modals/EditBookmarkModal.jsx'
import CreateCollectionModal from '../modals/CreateCollectionModal.jsx'
import CollectionEditModal from '../modals/CollectionEditModal.jsx'
import SettingsModal from '../modals/SettingsModal.jsx'
import { AlertCircle, X } from 'lucide-react'

export default function AppLayout() {
  const [activeView, setActiveView] = useState('all') // 'all', 'unsorted', 'favorites', 'archive', 'collection'
  const [selectedCollectionId, setSelectedCollectionId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('masonry') // 'masonry' | 'list' | 'grid'
  const [sortBy, setSortBy] = useState('date_desc')
  const [selectedBookmark, setSelectedBookmark] = useState(null)

  // Mobile drawer & Modals
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingBookmark, setEditingBookmark] = useState(null)
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false)
  const [parentForNewNested, setParentForNewNested] = useState(null)
  const [editingCollection, setEditingCollection] = useState(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // Live Data State
  const [bookmarks, setBookmarks] = useState([])
  const [collections, setCollections] = useState([])
  const [isLoadingBookmarks, setIsLoadingBookmarks] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const searchInputRef = useRef(null)

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase()
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') return

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      } else if (e.key.toLowerCase() === 'n' && !isAddModalOpen && !isCollectionModalOpen && !isSettingsOpen) {
        e.preventDefault()
        setIsAddModalOpen(true)
      } else if (e.key === 'Escape') {
        if (selectedBookmark) setSelectedBookmark(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isAddModalOpen, isCollectionModalOpen, isSettingsOpen, selectedBookmark])

  // Load Bookmarks & Collections from Backend
  const loadData = useCallback(async () => {
    try {
      setIsLoadingBookmarks(true)
      setErrorMessage('')

      const [bookmarksRes, collectionsRes] = await Promise.all([
        api.bookmarks.getAll().catch(() => ({ bookmarks: [] })),
        api.collections.getAll().catch(() => ({ collections: [] }))
      ])

      setBookmarks(bookmarksRes.bookmarks || [])
      setCollections(collectionsRes.collections || [])
    } catch (err) {
      console.error('Failed to load data:', err)
      setErrorMessage('Could not connect to server to load bookmarks.')
    } finally {
      setIsLoadingBookmarks(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Bookmark CRUD handlers
  const handleAddBookmark = async (newBm) => {
    try {
      const res = await api.bookmarks.create(newBm)
      if (res.bookmark) {
        setBookmarks(prev => [res.bookmark, ...prev])
      }
    } catch (err) {
      console.error('Failed to create bookmark:', err)
      throw err
    }
  }

  // Update Bookmark
  const handleUpdateBookmark = async (bookmarkId, updates) => {
    try {
      const res = await api.bookmarks.update(bookmarkId, updates)
      if (res.bookmark) {
        setBookmarks(prev => prev.map(bm => (bm.id === bookmarkId ? res.bookmark : bm)))
        if (selectedBookmark?.id === bookmarkId) {
          setSelectedBookmark(res.bookmark)
        }
      }
      return res.bookmark
    } catch (err) {
      console.error('Failed to update bookmark:', err)
      throw err
    }
  }

  // Toggle Favorite
  const handleToggleFavorite = async (bookmarkId) => {
    setBookmarks(prev => prev.map(bm => {
      if (bm.id === bookmarkId) {
        const next = !bm.is_favorite
        if (selectedBookmark?.id === bookmarkId) {
          setSelectedBookmark(curr => ({ ...curr, is_favorite: next }))
        }
        return { ...bm, is_favorite: next }
      }
      return bm
    }))

    try {
      const res = await api.bookmarks.toggleFavorite(bookmarkId)
      if (res.bookmark) {
        setBookmarks(prev => prev.map(b => b.id === bookmarkId ? res.bookmark : b))
        if (selectedBookmark?.id === bookmarkId) {
          setSelectedBookmark(res.bookmark)
        }
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err)
      loadData()
    }
  }

  // Toggle Archive
  const handleToggleArchive = async (bookmarkId) => {
    setBookmarks(prev => prev.map(bm => {
      if (bm.id === bookmarkId) {
        const next = !bm.is_archived
        if (selectedBookmark?.id === bookmarkId) {
          setSelectedBookmark(curr => ({ ...curr, is_archived: next }))
        }
        return { ...bm, is_archived: next }
      }
      return bm
    }))

    try {
      const res = await api.bookmarks.toggleArchive(bookmarkId)
      if (res.bookmark) {
        setBookmarks(prev => prev.map(b => b.id === bookmarkId ? res.bookmark : b))
        if (selectedBookmark?.id === bookmarkId) {
          setSelectedBookmark(res.bookmark)
        }
      }
    } catch (err) {
      console.error('Failed to toggle archive:', err)
      loadData()
    }
  }

  // Delete Bookmark
  const handleDeleteBookmark = async (bookmarkId) => {
    try {
      await api.bookmarks.delete(bookmarkId)
      setBookmarks(prev => prev.filter(bm => bm.id !== bookmarkId))
      if (selectedBookmark?.id === bookmarkId) {
        setSelectedBookmark(null)
      }
    } catch (err) {
      console.error('Failed to delete bookmark:', err)
      setErrorMessage(err.data?.message || err.message || 'Failed to delete bookmark')
    }
  }

  // Refresh Bookmark Metadata
  const handleRefreshBookmarkMetadata = async (bookmarkId) => {
    try {
      const res = await api.bookmarks.refreshMetadata(bookmarkId)
      if (res.bookmark) {
        setBookmarks(prev => prev.map(bm => (bm.id === bookmarkId ? res.bookmark : bm)))
        if (selectedBookmark?.id === bookmarkId) {
          setSelectedBookmark(res.bookmark)
        }
      }
    } catch (err) {
      console.error('Failed to refresh bookmark metadata:', err)
      setErrorMessage(err.data?.message || err.message || 'Failed to refresh metadata')
    }
  }

  // Collection CRUD handlers
  const handleCreateCollection = async (newColl) => {
    try {
      const res = await api.collections.create(newColl)
      if (res.collection) {
        setCollections(prev => [...prev, res.collection])
      }
    } catch (err) {
      console.error('Failed to create collection:', err)
      setErrorMessage(err.data?.message || err.message || 'Failed to create collection')
    }
  }

  const handleUpdateCollection = async (collId, updates) => {
    try {
      const res = await api.collections.update(collId, updates)
      if (res.collection) {
        setCollections(prev => prev.map(c => c.id === collId ? res.collection : c))
      }
    } catch (err) {
      console.error('Failed to update collection:', err)
      setErrorMessage(err.data?.message || err.message || 'Failed to update collection')
    }
  }

  const handleDeleteCollection = async (collId) => {
    try {
      await api.collections.delete(collId)
      setCollections(prev => prev.filter(c => c.id !== collId))
      if (selectedCollectionId === collId) {
        setActiveView('all')
        setSelectedCollectionId(null)
      }
    } catch (err) {
      console.error('Failed to delete collection:', err)
      setErrorMessage(err.data?.message || err.message || 'Failed to delete collection')
    }
  }

  // Filter Bookmarks
  let displayedBookmarks = bookmarks.filter((bm) => {
    if (activeView === 'archive') {
      if (!bm.is_archived) return false
    } else {
      if (bm.is_archived) return false

      if (activeView === 'unsorted') {
        if (bm.collection_id) return false
      } else if (activeView === 'favorites') {
        if (!bm.is_favorite) return false
      } else if (activeView === 'collection' && selectedCollectionId) {
        if (bm.collection_id !== selectedCollectionId) return false
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchTitle = bm.title?.toLowerCase().includes(q)
      const matchUrl = bm.url?.toLowerCase().includes(q)
      const matchDesc = bm.description?.toLowerCase().includes(q)
      const matchDomain = bm.domain?.toLowerCase().includes(q)
      if (!matchTitle && !matchUrl && !matchDesc && !matchDomain) return false
    }

    return true
  })

  // Sorting
  displayedBookmarks.sort((a, b) => {
    if (sortBy === 'date_desc') return new Date(b.created_at || 0) - new Date(a.created_at || 0)
    if (sortBy === 'date_asc') return new Date(a.created_at || 0) - new Date(b.created_at || 0)
    if (sortBy === 'title_asc') return (a.title || a.url || '').localeCompare(b.title || b.url || '')
    if (sortBy === 'title_desc') return (b.title || b.url || '').localeCompare(a.title || a.url || '')
    return 0
  })

  // View Title & Active Collection Info
  let currentTitle = 'All'
  let activeCollObj = null
  if (activeView === 'unsorted') currentTitle = 'Unsorted'
  else if (activeView === 'favorites') currentTitle = 'Favorites'
  else if (activeView === 'archive') currentTitle = 'Archive'
  else if (activeView === 'collection' && selectedCollectionId) {
    activeCollObj = collections.find(c => c.id === selectedCollectionId)
    currentTitle = activeCollObj ? activeCollObj.name : 'Collection'
  }

  // Count calculations
  const nonArchived = bookmarks.filter(b => !b.is_archived)
  const bookmarkCounts = {
    all: nonArchived.length,
    unsorted: nonArchived.filter(b => !b.collection_id).length,
    favorites: nonArchived.filter(b => b.is_favorite).length,
    archive: bookmarks.filter(b => b.is_archived).length
  }

  return (
    <div className="h-screen w-screen bg-[var(--rd-bg-main)] text-[var(--rd-text-primary)] flex overflow-hidden font-sans">
      {/* 1. Raindrop Sidebar */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        selectedCollectionId={selectedCollectionId}
        setSelectedCollectionId={setSelectedCollectionId}
        collections={collections.map(c => ({
          ...c,
          bookmark_count: nonArchived.filter(b => b.collection_id === c.id).length
        }))}
        bookmarkCounts={bookmarkCounts}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenCollectionModal={() => {
          setParentForNewNested(null)
          setIsCollectionModalOpen(true)
        }}
        onOpenCollectionEdit={(coll) => setEditingCollection(coll)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
      />

      {/* 2. Main Content & Inspector Panes */}
      <div className="flex-1 flex flex-col min-w-0 bg-[var(--rd-bg-main)] h-full overflow-hidden">
        {/* Error Alert */}
        {errorMessage && (
          <div className="bg-rose-500/10 border-b border-rose-500/20 px-4 py-2 text-rose-500 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage('')}
              className="p-1 hover:bg-rose-500/10 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Top Navbar */}
        <TopNavbar
          searchInputRef={searchInputRef}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          viewTitle={currentTitle}
          activeCollection={activeCollObj}
          itemCount={displayedBookmarks.length}
          viewMode={viewMode}
          setViewMode={setViewMode}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        {/* Content Area: Bookmarks List/Masonry + Reading Detail Inspector */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Main Bookmarks Pane */}
          <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
            <BookmarkListPane
              bookmarks={displayedBookmarks}
              isLoading={isLoadingBookmarks}
              viewMode={viewMode}
              selectedBookmarkId={selectedBookmark?.id}
              onSelectBookmark={(bm) => setSelectedBookmark(bm)}
              onEditBookmark={(bm) => setEditingBookmark(bm)}
              onToggleFavorite={handleToggleFavorite}
              onToggleArchive={handleToggleArchive}
              onOpenAddModal={() => setIsAddModalOpen(true)}
            />
          </div>

          {/* Right Reading Inspector Pane (Screenshot 4) */}
          {selectedBookmark && (
            <BookmarkDetailPane
              bookmark={selectedBookmark}
              onClose={() => setSelectedBookmark(null)}
              onEdit={(bm) => setEditingBookmark(bm)}
              onToggleFavorite={handleToggleFavorite}
              onToggleArchive={handleToggleArchive}
              onRefreshMetadata={handleRefreshBookmarkMetadata}
              onDelete={handleDeleteBookmark}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <AddBookmarkModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        collections={collections}
        onAdd={handleAddBookmark}
      />

      <EditBookmarkModal
        isOpen={Boolean(editingBookmark)}
        onClose={() => setEditingBookmark(null)}
        bookmark={editingBookmark}
        collections={collections}
        onUpdate={handleUpdateBookmark}
      />

      <CreateCollectionModal
        isOpen={isCollectionModalOpen}
        onClose={() => setIsCollectionModalOpen(false)}
        parentCollectionId={parentForNewNested}
        collections={collections}
        onCreate={handleCreateCollection}
      />

      <CollectionEditModal
        isOpen={Boolean(editingCollection)}
        onClose={() => setEditingCollection(null)}
        collection={editingCollection}
        collections={collections}
        onUpdate={handleUpdateCollection}
        onDelete={handleDeleteCollection}
        onCreateNested={(parentId) => {
          setParentForNewNested(parentId)
          setIsCollectionModalOpen(true)
        }}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  )
}
