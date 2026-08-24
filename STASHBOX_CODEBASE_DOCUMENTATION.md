# STASHBOX — COMPLETE TECHNICAL CODEBASE DOCUMENTATION

> **Comprehensive Technical Architecture & Codebase Map for Technical Viva & Systems Evaluation**  
> *Author / Developer:* Parth Jadhav (TYCS — Third-Year Computer Science)  
> *Project Type:* University Web Application & Distributed Full-Stack System  
> *Version:* 1.0.0 (Production Architecture)

---

## 1. PROJECT OVERVIEW

### 1.1 Executive Summary
**StashBox** is a high-performance, minimalist bookmark management platform architected as a modern multi-tier web application. It enables users to securely store, categorize into multi-level hierarchical trees (nested collections), search, filter, and inspect web links with rich automated metadata extraction (OpenGraph tags, HTML5 metadata, JSON-LD structured schemas, high-resolution preview images, and domain favicons).

### 1.2 Core Problem Solved
Standard browser bookmarking systems lack cross-device synchronization without browser-specific lock-in, suffer from flat or cumbersome folder structures, lack automatic link preview ingestion, and provide zero metadata inspection (reading modes, direct note annotations, domain filtering, and real-time nested tree categorization). StashBox provides an isolated, authenticated workspace offering a Raindrop.io/Vercel-inspired UI backed by an Express REST API and a managed Supabase PostgreSQL database protected by Row Level Security (RLS).

### 1.3 High-Level System Metrics
- **Frontend Framework:** React 19 SPA powered by Vite 8 and Tailwind CSS 4.
- **Backend Runtime:** Node.js (ES Modules) with Express 5 REST API.
- **Database & Auth Engine:** Supabase PostgreSQL 15+ with Row-Level Security (RLS) & JWT authentication.
- **Network Architecture:** Decoupled Client-Server model communicating over HTTP/JSON with Bearer Token Authorization.

---

## 2. COMPLETE DIRECTORY TREE

Below is the verified, exact file tree of the active repository:

```text
c:\StashBox Main\Stashbox\
├── .gitignore
├── DESIGN.md
├── client/
│   ├── .gitignore
│   ├── README.md
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   ├── public/
│   │   ├── apple-touch-icon.png
│   │   ├── favicon-96x96.png
│   │   ├── favicon.ico
│   │   ├── favicon.svg
│   │   ├── site.webmanifest
│   │   ├── web-app-manifest-192x192.png
│   │   └── web-app-manifest-512x512.png
│   └── src/
│       ├── App.jsx
│       ├── index.css
│       ├── main.jsx
│       ├── api/
│       │   └── api.js
│       ├── context/
│       │   ├── AuthContext.jsx
│       │   └── ThemeContext.jsx
│       ├── pages/
│       │   ├── AboutPage.jsx
│       │   ├── HomePage.jsx
│       │   ├── LoginPage.jsx
│       │   └── SignupPage.jsx
│       └── components/
│           ├── ProtectedRoute.jsx
│           ├── auth/
│           │   └── AuthCard.jsx
│           ├── common/
│           │   └── CollectionIcon.jsx
│           ├── layout/
│           │   ├── AppLayout.jsx
│           │   ├── BookmarkDetailPane.jsx
│           │   ├── BookmarkListPane.jsx
│           │   ├── Sidebar.jsx
│           │   └── TopNavbar.jsx
│           └── modals/
│               ├── AddBookmarkModal.jsx
│               ├── CollectionEditModal.jsx
│               ├── CreateCollectionModal.jsx
│               ├── EditBookmarkModal.jsx
│               └── SettingsModal.jsx
└── server/
    ├── .env
    ├── package.json
    ├── package-lock.json
    ├── server.js
    ├── config/
    │   └── supabase.js
    ├── middleware/
    │   ├── authMiddleware.js
    │   └── rateLimiter.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── bookmarkRoutes.js
    │   └── collectionRoutes.js
    ├── controllers/
    │   ├── authController.js
    │   ├── bookmarkController.js
    │   └── collectionController.js
    └── utils/
        └── metadataScraper.js
```

---

## 3. ARCHITECTURE & COMMUNICATION FLOW

StashBox employs a **Three-Tier Decoupled Client-Server Architecture**:

```text
┌──────────────────────────────────────────────────────────────────────────┐
│                         CLIENT TIER (Browser)                            │
│  React 19 SPA (Vite) ──► React Router 7 ──► Context (Auth / Theme)       │
│                                │                                         │
│                      Fetch API Client (/api/api.js)                      │
└────────────────────────────────┼─────────────────────────────────────────┘
                                 │ HTTP JSON + Bearer JWT
                                 ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                         SERVER TIER (Node/Express)                       │
│  Express 5 API Gateway (:5000)                                           │
│    ├── Security Headers (nosniff, SAMEORIGIN, strict-origin)             │
│    ├── CORS Validation (Credentials allowed for localhost:3000)          │
│    ├── Rate Limiters (Auth: 20 req/min, API: 120 req/min)                │
│    ├── authMiddleware (Extracts Bearer token -> supabase.auth.getUser)   │
│    └── Controllers (Auth, Bookmarks, Collections)                        │
│          └── Metadata Scraper (SSRF-protected Cheerio-free HTML engine)  │
└────────────────────────────────┼─────────────────────────────────────────┘
                                 │ PostgREST / Supabase Client (Scoped JWT)
                                 ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                         DATA TIER (Supabase / PostgreSQL)               │
│  Supabase PostgREST Engine                                               │
│    ├── PostgreSQL Relational Tables (profiles, collections, bookmarks)   │
│    ├── Row Level Security (RLS) Enforcing auth.uid() = user_id           │
│    └── Auth Engine (auth.users, JWT Issuance, bcrypt Password Storage)   │
└──────────────────────────────────────────────────────────────────────────┘
```

### Why Decouple Express instead of Direct Supabase Client on Frontend?
1. **SSRF & Metadata Ingestion**: Browsers cannot scrape external HTML websites due to CORS restrictions and security sandboxing. The Express backend acts as a proxy with strict IP address parsing and timeout controls.
2. **Rate Limiting & Abuse Defense**: Centralized in-memory sliding-window rate limiters shield authentication and database queries from brute-force flooding.
3. **Payload Sanitization & Normalization**: Strips HTML tags, trims strings, and standardizes domain/URL structures before persistent storage.

---

## 4. FRONTEND ARCHITECTURE

### 4.1 Entry Point Lifecycle
1. **`index.html`**: Defines the viewport, Google Font preconnects (`Inter`, `JetBrains Mono`, `Plus Jakarta Sans`), favicon assets, and mounts `<div id="root"></div>`.
2. **`src/main.jsx`**: Initializes `ReactDOM.createRoot()`, imports global styles (`index.css`), and mounts `<App />` in React StrictMode.
3. **`src/App.jsx`**: Wraps the component tree in two top-level Context Providers:
   - `<ThemeProvider>`: Synchronizes `dark`, `light`, or `system` themes to `document.documentElement` and `localStorage`.
   - `<AuthProvider>`: Manages persistent JWT session validation (`/api/auth/me`), login, signup, user profile metadata, and logout.
4. **Router Configuration**: Evaluates the URL against defined `<Routes>`:
   - `/` ──► `<HomePage />` (Public Marketing & Product Showcase)
   - `/about` ──► `<AboutPage />` (Project Overview & Academic Specification)
   - `/login` ──► `<LoginPage />` (Wraps `<AuthCard initialMode="login" />`)
   - `/signup` ──► `<SignupPage />` (Wraps `<AuthCard initialMode="signup" />`)
   - `/app` ──► `<ProtectedRoute><AppLayout /></ProtectedRoute>` (Core Application Workspace)
   - `/dashboard` ──► `<Navigate to="/app" replace />` (Canonical redirect)
   - `*` ──► `<Navigate to="/" replace />` (Wildcard 404 fallback)

---

## 5. REACT COMPONENT HIERARCHY

```text
App
 ├── ThemeProvider
 └── AuthProvider
      └── BrowserRouter
           ├── Route "/" ──────────► HomePage (Header, Hero, Product Preview, Footer)
           ├── Route "/about" ─────► AboutPage (Project Info, Developer, Tech Stack)
           ├── Route "/login" ─────► LoginPage ──► AuthCard (Login Mode)
           ├── Route "/signup" ────► SignupPage ──► AuthCard (Signup Mode)
           └── Route "/app" ───────► ProtectedRoute
                                      └── AppLayout (Master Controller State)
                                           ├── Sidebar (Tree, Nav Filters, Profile Menu)
                                           │    └── CollectionIcon
                                           ├── TopNavbar (Search, View Mode, Sorting, Mobile Toggle)
                                           │    └── CollectionIcon
                                           ├── BookmarkListPane (Masonry, List, Grid Displays)
                                           ├── BookmarkDetailPane (Inspector, Reading Tab, Action Bar)
                                           ├── AddBookmarkModal (URL Input, Clipboard Detection)
                                           ├── EditBookmarkModal (Title, Description, Collection Select)
                                           ├── CreateCollectionModal (Name, Color Accent, Icon Picker)
                                           ├── CollectionEditModal (Color, Icon Grid, Parent Hierarchy)
                                           └── SettingsModal (Appearance / Account Management)
```

---

## 6. FRONTEND FILE-BY-FILE SPECIFICATION

### 6.1 Context & Core State Files

#### `client/src/context/AuthContext.jsx`
- **Purpose**: Provides centralized authentication state and token lifecycle methods across the application.
- **State Managed**:
  - `user` (Object | null): Authenticated Supabase user object (`id`, `email`, etc.).
  - `profile` (Object | null): User profile metadata (`display_name`, `updated_at`).
  - `token` (String | null): Active Bearer JWT stored in `localStorage` under `stashbox_token`.
  - `isLoading` (Boolean): True during initial boot session verification.
  - `error` (String | null): Error messages from failed auth operations.
- **Key Methods**:
  - `checkAuth()`: Executes `GET /api/auth/me` with Bearer token. Clears session if expired (401).
  - `login(email, password)`: Calls `POST /api/auth/login`, saves JWT, updates user state.
  - `signup(email, password, displayName)`: Calls `POST /api/auth/signup`, saves JWT on immediate session issuance.
  - `logout()`: Dispatches `POST /api/auth/logout`, clears `localStorage`, resets all user states.
  - `updateDisplayName(name)`: Calls `PUT /api/auth/profile`, updates local profile state.

#### `client/src/context/ThemeContext.jsx`
- **Purpose**: Implements dynamic Dark/Light theme switching with system OS preference synchronization.
- **State Managed**:
  - `theme` ('dark' | 'light' | 'system'): Raw user selection.
  - `resolvedTheme` ('dark' | 'light'): Actual applied theme after resolving OS media query.
- **Lifecycle Logic**:
  - Listens to `window.matchMedia('(prefers-color-scheme: dark)')` change events.
  - Appends `.dark` / `.light` class to `document.documentElement` and sets CSS `color-scheme`.

### 6.2 Layout Components

#### `client/src/components/layout/AppLayout.jsx`
- **Purpose**: Central state orchestrator for the entire authenticated workspace (`/app`).
- **Core State**:
  - `activeView` ('all' | 'unsorted' | 'favorites' | 'archive' | 'collection'): Active sidebar filter.
  - `selectedCollectionId` (UUID | null): ID of the currently selected collection.
  - `searchQuery` (String): Search keyword for title, URL, description, and domain filtering.
  - `viewMode` ('masonry' | 'list' | 'grid'): Current layout presentation.
  - `sortBy` ('date_desc' | 'date_asc' | 'title_asc' | 'title_desc'): Active comparator.
  - `selectedBookmark` (Object | null): Active bookmark open in the right inspector pane.
  - `bookmarks` (Array): Full list of bookmarks loaded from backend.
  - `collections` (Array): Full list of collections loaded from backend.
- **Global Keyboard Shortcuts**:
  - `Ctrl+K` / `Cmd+K`: Focuses the global search input.
  - `N`: Opens the Add Bookmark modal.
  - `Escape`: Closes the right detail inspector pane.

#### `client/src/components/layout/Sidebar.jsx`
- **Purpose**: Navigation bar rendering system views and the recursive collection tree.
- **Recursive Tree Rendering**:
  - `renderCollectionNode(coll, depth)`: Computes indentation (`10 + depth * 14px`). Renders an expandable chevron if children exist (`parent_id === coll.id`), icon, label, bookmark count, and an action trigger.

#### `client/src/components/layout/BookmarkListPane.jsx`
- **Purpose**: Multi-view layout container rendering filtered bookmark records.
- **View Modes Implemented**:
  1. **Masonry View (`.masonry-grid`)**: Multi-column CSS column-count layout (`sm:2`, `lg:3`, `xl:4`, `2xl:5`) with `break-inside: avoid`.
  2. **List View**: Horizontal rows showing thumbnail, title, domain, collection pill, and hover action buttons.
  3. **Grid View**: Equal-height card matrix displaying cover images, favicons, titles, and timestamp badges.

#### `client/src/components/layout/BookmarkDetailPane.jsx`
- **Purpose**: Right-side inspector pane showing detailed bookmark properties, article reader preview, metadata refresh, and deletion controls.

#### `client/src/components/layout/TopNavbar.jsx`
- **Purpose**: Workspace top toolbar containing search input, view title, view switch dropdowns, sort dropdowns, and Quick Add CTA.

---

## 7. API CLIENT LAYER (`client/src/api/api.js`)

Centralized HTTP client utilizing standard `fetch` with automated Bearer token injection and global 401 interceptor:

| Method Namespace | HTTP Verb | Target Endpoint | Description |
|---|---|---|---|
| `api.auth.signup(body)` | `POST` | `/api/auth/signup` | Registers new user account |
| `api.auth.login(body)` | `POST` | `/api/auth/login` | Authenticates email/password |
| `api.auth.getMe()` | `GET` | `/api/auth/me` | Fetches active session & profile |
| `api.auth.updateProfile(body)` | `PUT` | `/api/auth/profile` | Updates user display name |
| `api.auth.logout()` | `POST` | `/api/auth/logout` | Terminates backend session |
| `api.collections.getAll()` | `GET` | `/api/collections` | Fetches user's collection tree |
| `api.collections.getById(id)` | `GET` | `/api/collections/:id` | Fetches single collection |
| `api.collections.create(body)` | `POST` | `/api/collections` | Creates new collection/nested node |
| `api.collections.update(id, body)` | `PUT` | `/api/collections/:id` | Updates name, icon, color, parent |
| `api.collections.delete(id)` | `DELETE` | `/api/collections/:id` | Deletes collection |
| `api.bookmarks.getAll(params)` | `GET` | `/api/bookmarks?[query]` | Fetches bookmarks with optional filters |
| `api.bookmarks.getById(id)` | `GET` | `/api/bookmarks/:id` | Fetches bookmark details |
| `api.bookmarks.create(body)` | `POST` | `/api/bookmarks` | Scrapes URL & creates bookmark |
| `api.bookmarks.update(id, body)` | `PUT` | `/api/bookmarks/:id` | Updates bookmark title, note, folder |
| `api.bookmarks.delete(id)` | `DELETE` | `/api/bookmarks/:id` | Deletes bookmark record |
| `api.bookmarks.toggleFavorite(id)` | `PATCH` | `/api/bookmarks/:id/favorite` | Toggles `is_favorite` boolean |
| `api.bookmarks.toggleArchive(id)` | `PATCH` | `/api/bookmarks/:id/archive` | Toggles `is_archived` boolean |
| `api.bookmarks.refreshMetadata(id)`| `POST` | `/api/bookmarks/:id/refresh` | Re-scrapes target website |

---

## 8. BACKEND ARCHITECTURE & EXPRESS SERVER (`server/server.js`)

### 8.1 Express Server Boot Sequence
```text
1. dotenv.config() -> Loads SUPABASE_PROJECT_URL, SUPABASE_KEY, PORT, CLIENT_URL
2. express() initialization
3. Security Headers Middleware (nosniff, SAMEORIGIN, strict-origin, Permissions-Policy)
4. Safe CORS Middleware with dynamic origin resolution & credentials support
5. Request Body Parser with strict 1MB limits (express.json, express.urlencoded)
6. Rate Limiters Attachment (authLimiter on /api/auth, apiLimiter on /api/bookmarks & /api/collections)
7. API Route Sub-Routers Mount
8. Root Health Check Endpoint (GET / -> { status: 'healthy' })
9. Global Centralized Error Handling Middleware (Catches unhandled errors, suppresses stack traces)
10. app.listen(PORT, 5000)
```

---

## 9. BACKEND MIDDLEWARE DEEP-DIVE

### 9.1 Authentication Middleware (`server/middleware/authMiddleware.js`)
- **Function**: `authenticateUser(req, res, next)`
- **Mechanism**:
  1. Reads `Authorization` header. Rejects request with `401 Unauthorized` if missing or malformed (must start with `Bearer `).
  2. Extracts token: `const token = authHeader.split(' ')[1]`.
  3. Validates JWT with Supabase Auth: `const { data: { user }, error } = await supabase.auth.getUser(token)`.
  4. If valid, attaches:
     - `req.user`: Contains user `id`, `email`, `user_metadata`.
     - `req.token`: The raw JWT token string.
     - `req.supabase`: A scoped Supabase client initialized with `Authorization: Bearer <token>` to enforce PostgreSQL Row Level Security (RLS).
  5. Calls `next()`.

### 9.2 Rate Limiter Middleware (`server/middleware/rateLimiter.js`)
- **Function**: `createRateLimiter({ windowMs, max, message })`
- **Mechanism**:
  - Implements an **in-memory sliding window algorithm** using a Javascript `Map`.
  - Keys are composed of IP and route base: `${req.baseUrl || req.path}:${ip}`.
  - Automatically evicts expired window entries every 5 minutes via `setInterval`.
  - Sends `429 Too Many Requests` along with a standard `Retry-After: <seconds>` HTTP header when thresholds are exceeded.

---

## 10. METADATA SCRAPER ENGINE (`server/utils/metadataScraper.js`)

The scraper is an enterprise-grade, Cheerio-free HTML metadata parser with built-in SSRF and Denial of Service mitigations:

```text
Target URL ──► URL Validator ──► SSRF Pre-Check (Blocks 127.0.0.1, 10.x, 192.168.x, 169.254.x)
                                       │ Valid Public IP
                                       ▼
                             Fetch with AbortController (6s Timeout)
                                       │ Redirect Inspection (Post-redirect SSRF Check)
                                       ▼
                             Content-Type Check (Direct image vs HTML)
                                       │
                             Buffer Slicing (Max 1MB HTML payload protection)
                                       │
                       ┌───────────────┴───────────────┐
                       ▼                               ▼
               Regex Metadata Parser          Fallback Slug Generator
             - og:title / <title>           - Generates title from path slug
             - og:description / meta desc   - Google S2 Favicon (128px)
             - og:image / twitter:image
             - JSON-LD Structured Schema
             - HTML link[rel=icon]
```

### 10.1 Key Security Mitigations in Scraper:
1. **Defensive SSRF Mitigation (`isPrivateOrLocalHost`)**:
   - Rejects `localhost`, `127.0.0.1`, `0.0.0.0`, `::1`.
   - Rejects internal DNS suffixes (`.localhost`, `.local`, `.internal`, `.lan`).
   - Rejects IPv4 Private & Cloud Metadata ranges:
     - `10.0.0.0/8`
     - `172.16.0.0/12`
     - `192.168.0.0/16`
     - `169.254.0.0/16` (Blocks AWS/GCP/Azure link-local metadata endpoints: `169.254.169.254`).
     - `100.64.0.0/10` (Carrier-grade NAT).
2. **Post-Redirect SSRF Verification**:
   - If an external URL redirects (`response.url`), re-evaluates the destination host against `isPrivateOrLocalHost` before processing body contents.
3. **Response-Size Memory Bomb Defense**:
   - Caps read buffer at `1MB` (`rawText.slice(0, 1024 * 1024)`).
4. **Scraped Content Sanitization (`cleanText`)**:
   - Strips nested `<[^>]*>` HTML tags from extracted titles and descriptions to prevent Cross-Site Scripting (XSS).
   - Converts standard HTML entities (`&quot;`, `&#39;`, `&amp;`, `&lt;`, `&gt;`).

---

## 11. DATABASE SCHEMA & ROW LEVEL SECURITY (RLS)

StashBox connects to Supabase PostgreSQL structured under three primary relational entities:

### 11.1 Schema Definitions

#### `profiles` Table
Stores user public profile information synchronized with `auth.users`.
- `id` (UUID, Primary Key, Foreign Key ──► `auth.users.id` ON DELETE CASCADE)
- `display_name` (Text)
- `created_at` (Timestamp with time zone, Default: `now()`)
- `updated_at` (Timestamp with time zone, Default: `now()`)

#### `collections` Table
Stores hierarchical organizational folders.
- `id` (UUID, Primary Key, Default: `gen_random_uuid()`)
- `user_id` (UUID, Foreign Key ──► `auth.users.id` ON DELETE CASCADE, NOT NULL)
- `name` (Text, NOT NULL)
- `description` (Text, Nullable)
- `color` (Text, Nullable, e.g. `#3b82f6`)
- `icon` (Text, Nullable, e.g. `folder`, `code`, `zap`)
- `parent_id` (UUID, Self-referencing Foreign Key ──► `collections.id` ON DELETE CASCADE, Nullable)
- `created_at` (Timestamp with time zone, Default: `now()`)
- `updated_at` (Timestamp with time zone, Default: `now()`)

#### `bookmarks` Table
Stores saved link records and extracted web metadata.
- `id` (UUID, Primary Key, Default: `gen_random_uuid()`)
- `user_id` (UUID, Foreign Key ──► `auth.users.id` ON DELETE CASCADE, NOT NULL)
- `url` (Text, NOT NULL)
- `title` (Text, NOT NULL)
- `description` (Text, Nullable)
- `domain` (Text, Nullable)
- `favicon_url` (Text, Nullable)
- `preview_image_url` (Text, Nullable)
- `collection_id` (UUID, Foreign Key ──► `collections.id` ON DELETE SET NULL, Nullable)
- `is_favorite` (Boolean, Default: `false`)
- `is_archived` (Boolean, Default: `false`)
- `created_at` (Timestamp with time zone, Default: `now()`)
- `updated_at` (Timestamp with time zone, Default: `now()`)

### 11.2 Entity-Relationship (ER) Diagram

```text
┌─────────────────────────┐
│       auth.users        │
│ ─────────────────────── │
│ PK  id (UUID)           │
│     email               │
│     encrypted_password  │
└────────────┬────────────┘
             │ 1:1
             ├────────────────────────────────────────┐
             │ 1:N                                    │ 1:N
             ▼                                        ▼
┌─────────────────────────┐              ┌─────────────────────────┐
│        profiles         │              │       collections       │
│ ─────────────────────── │              │ ─────────────────────── │
│ PK,FK  id (UUID)        │              │ PK  id (UUID)           │
│        display_name     │              │ FK  user_id (UUID)      │
│        created_at       │         ┌───►│ FK  parent_id (UUID)    │ (Self-referencing tree)
│        updated_at       │         │    │     name, color, icon   │
└─────────────────────────┘         │    └────────────┬────────────┘
                                    │                 │ 1:N (ON DELETE SET NULL)
                                    │                 ▼
                         ┌──────────┴──────────────────────────────┐
                         │                bookmarks                │
                         │ ─────────────────────────────────────── │
                         │ PK  id (UUID)                           │
                         │ FK  user_id (UUID)                      │
                         │ FK  collection_id (UUID, Nullable)      │
                         │     url, title, description, domain     │
                         │     favicon_url, preview_image_url      │
                         │     is_favorite, is_archived            │
                         │     created_at, updated_at              │
                         └─────────────────────────────────────────┘
```

### 11.3 Row Level Security (RLS) Policy Model
All tables have RLS enabled (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`).
PostgreSQL guarantees that queries only return or modify rows where:
```sql
auth.uid() = user_id
```
- **SELECT**: Users can only read their own profiles, collections, and bookmarks.
- **INSERT**: Users can only insert rows where `user_id` matches their own JWT `auth.uid()`.
- **UPDATE**: Users can only modify rows belonging to their `auth.uid()`.
- **DELETE**: Users can only delete rows belonging to their `auth.uid()`.

---

## 12. END-TO-END DATA FLOW TRACES

### 12.1 Bookmark Creation Trace
```text
1. User clicks "Add Bookmark" (or presses 'N' on keyboard).
2. AddBookmarkModal opens; useEffect reads navigator.clipboard. If a valid URL is found, autofills the input.
3. User submits form -> AddBookmarkModal calls onAdd({ url, title, description, collection_id }).
4. AppLayout calls api.bookmarks.create(payload) -> POST /api/bookmarks with Bearer JWT.
5. Express server receives request -> passes through authLimiter -> authMiddleware.
6. authMiddleware verifies JWT via supabase.auth.getUser(token), attaches req.user and req.supabase.
7. bookmarkController.createBookmark validates URL format (prepends https:// if scheme omitted).
8. Calls scrapePageMetadata(url):
   - Validates domain against SSRF blacklist.
   - Fetches target HTML with 6s timeout and User-Agent header.
   - Parses og:title, og:image, og:description, JSON-LD, and favicon link.
9. bookmarkController combines user overrides with scraped metadata.
10. Executes SQL INSERT via req.supabase.from('bookmarks').insert(...).select('*, collections(...)').
11. PostgreSQL RLS verifies auth.uid() == req.user.id.
12. Express returns HTTP 201 Created with created bookmark JSON.
13. AppLayout prepends bookmark to local state: setBookmarks(prev => [res.bookmark, ...prev]).
14. React re-renders BookmarkListPane; new bookmark animates into view immediately.
```

### 12.2 Bookmark Edit Trace
```text
1. User clicks "Edit Bookmark" -> opens EditBookmarkModal.
2. Form initializes with title, description, and collection_id (URL link is strictly read-only).
3. User edits Title/Note/Collection and clicks "Save Changes".
4. AppLayout calls api.bookmarks.update(id, updates) -> PUT /api/bookmarks/:id.
5. bookmarkController verifies ownership and updates PostgreSQL record.
6. Updated record returned to frontend; AppLayout updates state array via immutable .map().
```

### 12.3 Nested Collection Hierarchy Trace
```text
1. Database contains collections with parent_id pointing to another collection.id.
2. Frontend loads flat array of collections from GET /api/collections.
3. Sidebar.jsx splits collections into rootCollections (filter parent_id == null) and child lookup helper.
4. Calls renderCollectionNode(coll, depth):
   - Renders collection item with paddingLeft = 10 + depth * 14px.
   - Checks if child collections exist (filter parent_id === coll.id).
   - If children exist, renders expand/collapse toggle icon and recursively calls renderCollectionNode(child, depth + 1).
```

---

## 13. SECURITY POSTURE & DEFENSIVE MECHANISMS

| Security Domain | Implementation Location | Mitigation Description |
|---|---|---|
| **Server-Side Request Forgery (SSRF)** | `server/utils/metadataScraper.js` | Strict IP/host validation blocking private ranges (`10.x`, `172.16.x`, `192.168.x`, `127.0.0.1`) and cloud metadata (`169.254.169.254`). |
| **Open Redirect SSRF** | `server/utils/metadataScraper.js` | Inspects `response.url` post-redirect to prevent bypassing SSRF filters via HTTP 301/302 redirects. |
| **Response Bomb / OOM** | `server/utils/metadataScraper.js` | Restricts parsed HTML buffer to `1MB`. Request abort controller timeout capped at 6 seconds. |
| **Cross-Site Scripting (XSS)** | `server/utils/metadataScraper.js` | Regex-based tag stripper (`cleanText`) removes `<script>` and HTML markup from scraped titles/descriptions. |
| **Database Multi-Tenancy** | PostgreSQL / Supabase | Row Level Security (RLS) ensures database-level isolation where `auth.uid() = user_id`. |
| **Brute Force & Flooding** | `server/middleware/rateLimiter.js` | Sliding-window rate limiting on auth endpoints (20 req/min) and general API routes (120 req/min). |
| **Clickjacking & MIME-Sniffing**| `server/server.js` | Sets `X-Frame-Options: SAMEORIGIN` and `X-Content-Type-Options: nosniff`. |
| **Session Theft / Token Leak** | `client/src/api/api.js` | Authorization tokens passed exclusively over Bearer HTTP headers, cleared instantly on 401 response. |

---

## 14. DEPENDENCIES AUDIT

### 14.1 Client Dependencies (`client/package.json`)
- **`react` & `react-dom` (v19.2.8)**: Core component rendering engine with concurrent features.
- **`react-router-dom` (v7.18.2)**: Client-side routing, declarative history management, navigation guards.
- **`tailwindcss` & `@tailwindcss/vite` (v4.3.3)**: High-performance utility CSS engine compiled at build time.
- **`lucide-react` (v1.31.0)**: Clean, tree-shakeable SVG icon set for UI actions and navigation.
- **`vite` (v8.2.0)**: Ultra-fast frontend development server and ES module bundler.

### 14.2 Server Dependencies (`server/package.json`)
- **`express` (v5.2.1)**: HTTP web application server framework.
- **`@supabase/supabase-js` (v2.112.3)**: Isomorphic client library for Supabase database operations and authentication.
- **`cors` (v2.8.6)**: Express middleware for managing Cross-Origin Resource Sharing headers.
- **`dotenv` (v17.4.2)**: Loads environment configuration into `process.env`.
- **`nodemon` (v3.1.14)**: Development utility for automatic server reload upon file modifications.

---

## 15. ENVIRONMENT VARIABLES SPECIFICATION

| Variable Name | Used By | Exposure | Purpose |
|---|---|---|---|
| `PORT` | `server/server.js` | Server-Only | TCP Port for Express server (Defaults to `5000`). |
| `CLIENT_URL` | `server/server.js` | Server-Only | Frontend client origin for production CORS authorization. |
| `SUPABASE_PROJECT_URL` | `server/config/supabase.js` | Server-Only | REST endpoint URL of the Supabase PostgreSQL project. |
| `SUPABASE_KEY` | `server/config/supabase.js` | Server-Only | Supabase Anon / Service API Key used for PostgREST queries. |
| `VITE_API_URL` | `client/src/api/api.js` | Public / Client | Base URL pointing to the Express backend API (Defaults to `http://localhost:5000/api`). |

---

## 16. BUILD & RUN COMMANDS

- **Frontend Development Server:**
  ```bash
  cd client
  npm run dev
  # Runs Vite dev server at http://localhost:3000
  ```
- **Frontend Production Build:**
  ```bash
  cd client
  npm run build
  # Generates optimized production bundle in client/dist/
  ```
- **Backend API Development Server:**
  ```bash
  cd server
  npm run dev
  # Runs Express API with nodemon at http://localhost:5000
  ```
- **Backend API Production Run:**
  ```bash
  cd server
  npm start
  # Runs node server.js
  ```

---

## 17. SYSTEM LIMITATIONS & KNOWN CONSTRAINTS

1. **In-Memory Rate Limiting**: The sliding-window rate limiter stores hits in Node.js process memory. In a multi-instance load-balanced cluster, this would require a Redis store.
2. **Single-Page Scraping Only**: The metadata scraper processes the single HTML document returned by the target URL; it does not execute client-side Javascript (SPAs requiring JS rendering will fall back to `<noscript>`, OpenGraph meta tags, or slug-derived titles).
3. **Database RLS Policies**: Assumes Supabase PostgreSQL schema has RLS policies actively configured on `profiles`, `collections`, and `bookmarks` matching `auth.uid() = user_id`.

---

## 18. ARCHITECTURAL SUMMARY STATEMENT

StashBox represents a production-grade, university-level implementation of a modern web system. By combining React 19's responsive state management with an Express proxy layer and Supabase's secure PostgreSQL RLS engine, it delivers a secure, multi-tenant bookmarking experience featuring automated metadata extraction, defensive networking, and flexible multi-tier categorization.
