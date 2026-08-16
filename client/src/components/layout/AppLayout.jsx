import { useState } from 'react'
import Sidebar from './Sidebar.jsx'
import TopNavbar from './TopNavbar.jsx'
import BookmarkListPane from './BookmarkListPane.jsx'
import BookmarkDetailPane from './BookmarkDetailPane.jsx'
import AddBookmarkModal from '../modals/AddBookmarkModal.jsx'
import CreateCollectionModal from '../modals/CreateCollectionModal.jsx'

export default function AppLayout() {
  const [activeView, setActiveView] = useState('all') // 'all', 'unsorted', 'favorites', 'archive', 'collection', 'tag'
  const [selectedCollectionId, setSelectedCollectionId] = useState(null)
  const [selectedTag, setSelectedTag] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('list') // 'list' | 'grid'
  const [sortBy, setSortBy] = useState('date_desc')
  const [selectedBookmark, setSelectedBookmark] = useState(null)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false)

  // Realistic mock data matching the Raindrop.io reference screenshots for Phase 6A Shell
  const [collections, setCollections] = useState([
    { id: 'c1', name: 'cars', color: '#f59e0b', bookmark_count: 1 },
    { id: 'c2', name: 'f1 stats 26', color: '#ef4444', parent_id: 'c1', bookmark_count: 1 },
    { id: 'c3', name: 'Development', color: '#3b82f6', bookmark_count: 3 },
    { id: 'c4', name: 'Design Tools', color: '#10b981', bookmark_count: 1 }
  ])

  const [tags, setTags] = useState([
    { id: 't1', name: 'racing', color: '#ef4444' },
    { id: 't2', name: 'shopping', color: '#f59e0b' },
    { id: 't3', name: 'gaming', color: '#8b5cf6' },
    { id: 't4', name: 'ai-tools', color: '#06b6d4' },
    { id: 't5', name: 'coding', color: '#10b981' }
  ])

  const [bookmarks, setBookmarks] = useState([
    {
      id: 'bm-1',
      title: 'F1 - The Official Home of Formula 1® Racing',
      url: 'https://formula1.com',
      domain: 'formula1.com',
      description: 'Enter the world of Formula 1. Your go-to source for the latest F1 news, video highlights, GP results, live timing, and driver stats.',
      favicon_url: 'https://formula1.com/etc/designs/fom-website/favicon.ico',
      is_favorite: true,
      is_archived: false,
      collections: { id: 'c1', name: 'cars' },
      created_at: '2026-08-04T10:00:00Z'
    },
    {
      id: 'bm-2',
      title: 'Nike - Official Online Store for Athletic Shoes, Clothing & Gear',
      url: 'https://nike.in',
      domain: 'nike.in',
      description: 'Nike delivers innovative products, experiences and services to inspire athletes.',
      favicon_url: 'https://www.nike.com/favicon.ico',
      is_favorite: false,
      is_archived: false,
      collections: null,
      created_at: '2026-08-04T10:05:00Z'
    },
    {
      id: 'bm-3',
      title: 'Resident Evil Mods and Community Hub',
      url: 'https://nexusmods.com/residentevil',
      domain: 'nexusmods.com',
      description: 'Modifications, save games and utilities for the Resident Evil game series.',
      favicon_url: 'https://nexusmods.com/favicon.ico',
      is_favorite: false,
      is_archived: false,
      collections: null,
      created_at: '2026-08-04T10:10:00Z'
    },
    {
      id: 'bm-4',
      title: 'W3Schools Online Web Tutorials',
      url: 'https://w3schools.com',
      domain: 'w3schools.com',
      description: 'Well organized and easy to understand Web building tutorials with lots of examples of how to use HTML, CSS, JavaScript, SQL, Python, PHP, and more.',
      favicon_url: 'https://www.w3schools.com/favicon.ico',
      is_favorite: true,
      is_archived: false,
      collections: { id: 'c3', name: 'Development' },
      created_at: '2026-08-04T10:15:00Z'
    },
    {
      id: 'bm-5',
      title: 'Google Gemini — Advanced AI Assistant',
      url: 'https://gemini.google.com',
      domain: 'gemini.google.com',
      description: 'Supercharge your creativity and productivity with Google Gemini.',
      favicon_url: 'https://www.gstatic.com/lamda/images/favicon_v1_150160cddff7f294ce30.svg',
      is_favorite: false,
      is_archived: false,
      collections: null,
      created_at: '2026-08-04T10:20:00Z'
    },
    {
      id: 'bm-6',
      title: 'ChatGPT — OpenAI Conversational Model',
      url: 'https://chatgpt.com',
      domain: 'chatgpt.com',
      description: 'A conversational AI system that listens, learns, and challenges.',
      favicon_url: 'https://chatgpt.com/favicon.ico',
      is_favorite: false,
      is_archived: false,
      collections: null,
      created_at: '2026-08-04T10:25:00Z'
    }
  ])

  // View Filtering
  let displayedBookmarks = bookmarks.filter((bm) => {
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchTitle = bm.title?.toLowerCase().includes(q)
      const matchUrl = bm.url?.toLowerCase().includes(q)
      const matchDesc = bm.description?.toLowerCase().includes(q)
      const matchDomain = bm.domain?.toLowerCase().includes(q)
      if (!matchTitle && !matchUrl && !matchDesc && !matchDomain) return false
    }

    if (activeView === 'unsorted') return !bm.collections
    if (activeView === 'favorites') return bm.is_favorite
    if (activeView === 'archive') return bm.is_archived
    if (activeView === 'collection' && selectedCollectionId) {
      return bm.collections?.id === selectedCollectionId
    }
    return true
  })

  // Title Computation
  let currentTitle = 'All bookmarks'
  if (activeView === 'unsorted') currentTitle = 'Unsorted'
  else if (activeView === 'favorites') currentTitle = 'Favorites'
  else if (activeView === 'archive') currentTitle = 'Archive'
  else if (activeView === 'collection' && selectedCollectionId) {
    const coll = collections.find(c => c.id === selectedCollectionId)
    currentTitle = coll ? coll.name : 'Collection'
  } else if (activeView === 'tag' && selectedTag) {
    currentTitle = `#${selectedTag}`
  }

  const handleToggleFavorite = (bookmarkId) => {
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
  }

  const handleDeleteBookmark = (bookmarkId) => {
    setBookmarks(prev => prev.filter(bm => bm.id !== bookmarkId))
    if (selectedBookmark?.id === bookmarkId) {
      setSelectedBookmark(null)
    }
  }

  const handleAddBookmarkMock = (newBm) => {
    const collObj = collections.find(c => c.id === newBm.collection_id) || null
    let hostname = 'link'
    try {
      hostname = new URL(newBm.url).hostname
    } catch {}

    const item = {
      id: `bm-${Date.now()}`,
      title: newBm.title || hostname,
      url: newBm.url,
      domain: hostname,
      description: 'Saved via quick add',
      is_favorite: false,
      is_archived: false,
      collections: collObj ? { id: collObj.id, name: collObj.name } : null,
      created_at: new Date().toISOString()
    }
    setBookmarks(prev => [item, ...prev])
  }

  const handleCreateCollectionMock = (newColl) => {
    const item = {
      id: `c-${Date.now()}`,
      name: newColl.name,
      color: newColl.color,
      bookmark_count: 0
    }
    setCollections(prev => [...prev, item])
  }

  return (
    <div className="h-screen w-screen bg-[#0e121a] text-slate-100 flex overflow-hidden font-sans">
      {/* 1. Sidebar Navigation */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        selectedCollectionId={selectedCollectionId}
        setSelectedCollectionId={setSelectedCollectionId}
        selectedTag={selectedTag}
        setSelectedTag={setSelectedTag}
        collections={collections}
        tags={tags}
        bookmarkCounts={{
          all: bookmarks.length,
          unsorted: bookmarks.filter(b => !b.collections).length,
          favorites: bookmarks.filter(b => b.is_favorite).length,
          archive: bookmarks.filter(b => b.is_archived).length
        }}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenCollectionModal={() => setIsCollectionModalOpen(true)}
        onOpenTagModal={() => {}}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0e121a] h-full overflow-hidden">
        {/* Top Toolbar */}
        <TopNavbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          viewTitle={currentTitle}
          itemCount={displayedBookmarks.length}
          viewMode={viewMode}
          setViewMode={setViewMode}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        {/* Center Panes: Bookmarks List/Grid + Detail Inspector */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Main Bookmarks List/Grid Area */}
          <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
            <BookmarkListPane
              bookmarks={displayedBookmarks}
              viewMode={viewMode}
              selectedBookmarkId={selectedBookmark?.id}
              onSelectBookmark={(bm) => setSelectedBookmark(bm)}
              onToggleFavorite={handleToggleFavorite}
              onOpenAddModal={() => setIsAddModalOpen(true)}
            />
            {/* Bottom count footer matching Raindrop */}
            <div className="py-4 text-center text-[11px] text-slate-500 select-none border-t border-slate-800/40">
              {displayedBookmarks.length} {displayedBookmarks.length === 1 ? 'bookmark' : 'bookmarks'}
            </div>
          </div>

          {/* Right Detail Pane (when a bookmark is selected) */}
          {selectedBookmark && (
            <BookmarkDetailPane
              bookmark={selectedBookmark}
              onClose={() => setSelectedBookmark(null)}
              onToggleFavorite={handleToggleFavorite}
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
        onAdd={handleAddBookmarkMock}
      />

      <CreateCollectionModal
        isOpen={isCollectionModalOpen}
        onClose={() => setIsCollectionModalOpen(false)}
        onCreate={handleCreateCollectionMock}
      />
    </div>
  )
}
