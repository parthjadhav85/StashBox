# STASHBOX — VIVA QUICK STUDY REFERENCE

> **Comprehensive Revision & Oral Examination Cheat Sheet**  
> *Project:* StashBox — Bookmark Management System  
> *Developer:* Parth Jadhav (TYCS — Third-Year Computer Science)

---

## 1. 30-SECOND ELEVATOR PITCH

> **"StashBox is a high-performance, full-stack bookmark management platform built with React 19, Node.js/Express 5, and Supabase PostgreSQL. It allows users to save web links, automatically extract rich metadata (OpenGraph tags, preview images, descriptions, and favicons), organize them into nested hierarchical collection trees, and browse them across Masonry, List, and Grid views. The architecture is protected with Row Level Security (RLS), in-memory sliding-window rate limiting, and defensive Server-Side Request Forgery (SSRF) protections."**

---

## 2. SYSTEM ARCHITECTURE & TECH STACK

```text
Browser (React 19 + Vite 8 + Tailwind CSS 4)
    │
    ▼ [Fetch with Bearer JWT]
Express 5 REST API Gateway (:5000)
    │ ├── Security Headers & CORS
    │ ├── In-Memory Sliding-Window Rate Limiters
    │ ├── authMiddleware (supabase.auth.getUser)
    │ └── Metadata Scraper (SSRF Defense, 6s Timeout, 1MB Buffer)
    │
    ▼ [Scoped PostgREST Connection with JWT]
Supabase PostgreSQL 15 Database (Row Level Security enforced: auth.uid() = user_id)
```

### Core Technologies
- **Frontend:** React 19, Vite 8, Tailwind CSS 4, React Router 7, Lucide Icons.
- **Backend:** Node.js (ESM), Express 5, CORS, Dotenv.
- **Database & Auth:** Supabase PostgreSQL, Supabase Auth (JWT, bcrypt).

---

## 3. DATABASE SCHEMA & RELATIONSHIPS

### 3.1 Three Core Tables
1. **`profiles`**: User details (`id` FK -> `auth.users.id`, `display_name`, `updated_at`).
2. **`collections`**: Categorization folders (`id`, `user_id`, `name`, `color`, `icon`, `parent_id` FK -> `collections.id`).
3. **`bookmarks`**: Saved links (`id`, `user_id`, `url`, `title`, `description`, `domain`, `favicon_url`, `preview_image_url`, `collection_id` FK -> `collections.id`, `is_favorite`, `is_archived`).

### 3.2 Key Relationship Rules
- **User Ownership:** All tables have `user_id` referencing `auth.users.id` with `ON DELETE CASCADE`.
- **Hierarchical Nested Tree:** `collections.parent_id` self-references `collections.id` (`ON DELETE CASCADE`).
- **Collection Assignment:** `bookmarks.collection_id` references `collections.id` with `ON DELETE SET NULL` (deleting a collection does not delete the saved bookmarks; they become Unsorted).

---

## 4. ROW LEVEL SECURITY (RLS) IN ONE MINUTE

- **What is RLS?** A PostgreSQL security feature where database policies evaluate every SQL query to ensure users only access rows they own.
- **How is it enforced?** The backend passes the user's JWT to Supabase. Supabase evaluates `auth.uid() = user_id`.
- **Why is it critical?** Even if an attacker guessed another user's bookmark UUID, PostgreSQL directly rejects the query because `auth.uid()` does not match.

---

## 5. API ENDPOINTS SUMMARY

| Verb | Endpoint | Authentication | Purpose |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Public | Register new user |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue JWT |
| `GET` | `/api/auth/me` | Bearer Token | Get current user profile |
| `PUT` | `/api/auth/profile` | Bearer Token | Update display name |
| `POST` | `/api/auth/logout` | Bearer Token | Terminate session |
| `GET` | `/api/collections` | Bearer Token | List all user collections |
| `POST` | `/api/collections` | Bearer Token | Create root or nested collection |
| `PUT` | `/api/collections/:id`| Bearer Token | Update collection details |
| `DELETE`| `/api/collections/:id`| Bearer Token | Delete collection |
| `GET` | `/api/bookmarks` | Bearer Token | Get filtered bookmarks |
| `POST` | `/api/bookmarks` | Bearer Token | Scrape URL & save bookmark |
| `PUT` | `/api/bookmarks/:id` | Bearer Token | Edit bookmark title/notes/collection |
| `DELETE`| `/api/bookmarks/:id` | Bearer Token | Delete bookmark |
| `PATCH`| `/api/bookmarks/:id/favorite` | Bearer Token | Toggle favorite boolean |
| `PATCH`| `/api/bookmarks/:id/archive` | Bearer Token | Toggle archive boolean |
| `POST` | `/api/bookmarks/:id/refresh` | Bearer Token | Re-scrape bookmark metadata |

---

## 6. CRITICAL DATA FLOWS FOR VIVA

### 6.1 Bookmark Creation & Scraping Flow
```text
User pastes URL in Modal ──► Client validates URL ──► POST /api/bookmarks
                                                            │
                                                     authMiddleware
                                                            │
                                                  metadataScraper.js
                                                  (SSRF check, fetch HTML,
                                                   extract og:title, og:image,
                                                   JSON-LD, Google Favicon)
                                                            │
                                              INSERT INTO bookmarks (PostgreSQL)
                                                            │
                                                    HTTP 201 Response
                                                            │
                                       AppLayout updates local state array
```

### 6.2 Nested Collections Tree Algorithm
- Collections table stores a flat list of records with `parent_id`.
- `Sidebar.jsx` filters `parent_id == null` to find Root collections.
- Recursively renders child nodes: `renderCollectionNode(coll, depth)`.
- Indentation is dynamic: `paddingLeft = 10 + depth * 14px`.

---

## 7. SECURITY MEASURES CHEAT SHEET

1. **SSRF (Server-Side Request Forgery) Defense:**
   - Blocks private IP ranges (`127.0.0.1`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`).
   - Blocks Cloud Metadata endpoints (`169.254.169.254`).
   - Inspects `response.url` post-redirect to block open redirect SSRF attacks.
2. **Denial of Service (DoS) Mitigation:**
   - AbortController caps scraper requests at 6 seconds.
   - Restricts HTML response memory buffer to 1MB.
3. **Cross-Site Scripting (XSS) Mitigation:**
   - Scraped text cleaned via regex (`cleanText`) stripping all `<script>` and HTML markup.
4. **Rate Limiting:**
   - Sliding-window limiter on Auth (20 req/min) and API routes (120 req/min).
5. **CORS & Security Headers:**
   - `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`.

---

## 8. LIKELY VIVA QUESTIONS & MODEL ANSWERS

### Q1: Why did you use an Express backend instead of calling Supabase directly from React?
> **Answer:** "Browsers cannot directly scrape third-party websites due to CORS and browser sandboxing. The Express backend handles automated metadata scraping, enforces defensive SSRF filtering (blocking access to internal IPs and cloud metadata), provides in-memory rate limiting, and sanitizes input data before database insertion."

### Q2: What is SSRF and how does StashBox prevent it?
> **Answer:** "SSRF (Server-Side Request Forgery) occurs when an attacker tricks the server into making HTTP requests to internal or restricted resources (like `http://localhost:5000` or AWS metadata `http://169.254.169.254`). StashBox validates every target hostname with `isPrivateOrLocalHost()` before fetching, rejects private IP subnets, and re-checks the destination host if the URL performs an HTTP redirect."

### Q3: How does Row Level Security (RLS) protect user data?
> **Answer:** "RLS operates at the PostgreSQL engine level. When queries are executed with the user's JWT, PostgreSQL evaluates `auth.uid() = user_id`. Even if an authenticated user attempts to query another user's bookmark ID, PostgreSQL returns empty or denies access."

### Q4: How is the nested collection hierarchy rendered in the UI?
> **Answer:** "Collections use a self-referencing relationship where `parent_id` points to another collection's `id`. In `Sidebar.jsx`, the component finds root collections (`parent_id === null`) and calls a recursive function `renderCollectionNode(coll, depth)`. For every nesting level, it increments `depth`, computing `paddingLeft = 10 + depth * 14px` and rendering expand/collapse chevrons."

### Q5: What happens if a website blocks web scraping?
> **Answer:** "The scraper catches HTTP errors or timeouts gracefully. If scraping fails or the site returns a 403 bot-block, StashBox extracts a clean, capitalized slug from the URL path as the fallback title, sets the domain, and generates a 128px favicon using Google's Favicon API."

### Q6: Why is the bookmark URL read-only in the Edit modal?
> **Answer:** "The URL determines the core identity, domain, and scraped metadata of the bookmark. Allowing the URL to change would invalidate the existing preview image, favicon, and domain. To change a URL, users create a new bookmark or refresh metadata."

### Q7: How does authentication persist across page reloads?
> **Answer:** "When a user logs in, the JWT access token is stored in `localStorage` under `stashbox_token`. On application boot, `AuthContext` runs `checkAuth()` which executes `GET /api/auth/me` with the `Authorization: Bearer <token>` header to verify session validity and populate user state."

### Q8: How does the Masonry view work?
> **Answer:** "The Masonry layout uses CSS multi-column rules (`.masonry-grid` with `column-count: 1` on mobile, scaling up to `column-count: 5` on ultra-wide screens). Cards use `break-inside: avoid` to prevent cards from splitting across column breaks."
