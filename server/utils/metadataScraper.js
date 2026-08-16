/**
 * Stashbox Web Metadata Scraper
 * 
 * Extracts title, preview image, description, and favicon from a given URL
 * using standard HTML tags (OpenGraph, Twitter Cards, HTML5 meta/link).
 * Includes defensive SSRF and resource consumption protections.
 */

// Helper to identify private, local, or cloud metadata addresses (SSRF mitigation)
const isPrivateOrLocalHost = (hostname) => {
  if (!hostname || typeof hostname !== 'string') return true
  const lower = hostname.toLowerCase().trim()

  // Localhost, loopback and internal domain suffixes
  if (lower === 'localhost' || lower === '127.0.0.1' || lower === '0.0.0.0' || lower === '::1' || lower === '[::1]') return true
  if (lower.endsWith('.localhost') || lower.endsWith('.local') || lower.endsWith('.internal') || lower.endsWith('.lan')) return true

  // IPv4 Private & Link-Local Ranges:
  // 10.0.0.0/8
  if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(lower)) return true
  // 172.16.0.0/12 (172.16.x.x - 172.31.x.x)
  if (/^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/.test(lower)) return true
  // 192.168.0.0/16
  if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(lower)) return true
  // 169.254.0.0/16 (Link local / AWS, GCP, Azure metadata endpoint 169.254.169.254)
  if (/^169\.254\.\d{1,3}\.\d{1,3}$/.test(lower)) return true
  // 100.64.0.0/10 (Carrier-grade NAT)
  if (/^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.\d{1,3}\.\d{1,3}$/.test(lower)) return true

  return false
}

// Helper to convert relative URLs into absolute URLs
const toAbsoluteUrl = (relativeUrl, baseUrl) => {
  if (!relativeUrl || typeof relativeUrl !== 'string') return null
  const trimmed = relativeUrl.trim()
  if (!trimmed || trimmed.startsWith('data:') || trimmed.startsWith('blob:') || trimmed.startsWith('javascript:')) return null

  try {
    const abs = new URL(trimmed, baseUrl)
    if (!['http:', 'https:'].includes(abs.protocol)) return null
    return abs.href
  } catch {
    return null
  }
}

// Clean HTML entities, tags, and extra spaces
const cleanText = (text, maxLength = 500) => {
  if (!text || typeof text !== 'string') return ''
  return text
    .replace(/<[^>]*>/g, '') // Strip any HTML tags to prevent XSS in scraped metadata
    .replace(/&#x27;/gi, "'")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
}

// Extract content of a <meta property="..." content="..."> or <meta name="..." content="..."> tag
const getMetaTag = (html, nameOrProperty) => {
  const escaped = nameOrProperty.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(
    `<meta\\b[^>]*(?:property|name)=["']${escaped}["'][^>]*content=["']([^"']*)["']|<meta\\b[^>]*content=["']([^"']*)["'][^>]*(?:property|name)=["']${escaped}["']`,
    'i'
  )
  const match = html.match(regex)
  return match ? cleanText(match[1] || match[2]) : null
}

// Extract a readable fallback title from the URL path (e.g. /pomazor-shoes/IQ9813 -> "Pomazor Shoes")
const getTitleFromUrl = (urlObj) => {
  if (!urlObj || !urlObj.pathname) return null
  const segments = urlObj.pathname.split('/').filter(Boolean)
  if (segments.length === 0) return null

  let bestSlug = ''
  for (const seg of segments) {
    const clean = seg
      .replace(/\.(html?|php|aspx?)$/i, '')
      .replace(/[-_+]+/g, ' ')
      .trim()

    // Prefer the most descriptive slug (longer and not an arbitrary ID)
    if (clean.length > bestSlug.length && !/^[0-9a-f]{8,}$/i.test(clean)) {
      bestSlug = clean
    }
  }

  if (bestSlug.length >= 3) {
    return bestSlug
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }
  return null
}

// Extract image URL from JSON-LD if present in the page
const getJsonLdImage = (html, baseUrl) => {
  const match = html.match(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i)
  if (!match) return null

  try {
    const data = JSON.parse(match[1])
    const img = data.image || (Array.isArray(data['@graph']) ? data['@graph'].find(item => item.image)?.image : null)

    if (typeof img === 'string') return toAbsoluteUrl(img, baseUrl)
    if (Array.isArray(img) && typeof img[0] === 'string') return toAbsoluteUrl(img[0], baseUrl)
    if (img && typeof img === 'object' && (img.url || img.contentUrl)) return toAbsoluteUrl(img.url || img.contentUrl, baseUrl)
  } catch {
    // Malformed JSON-LD ignored
  }
  return null
}

/**
 * Scrapes metadata from a webpage URL.
 * Falls back gracefully if the target website blocks requests or has missing metadata.
 */
export const scrapePageMetadata = async (targetUrl) => {
  let urlObj
  try {
    urlObj = new URL(targetUrl)
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return {
        title: targetUrl,
        description: null,
        preview_image_url: null,
        favicon_url: null,
        domain: 'website'
      }
    }
  } catch {
    return {
      title: targetUrl,
      description: null,
      preview_image_url: null,
      favicon_url: null,
      domain: 'website'
    }
  }

  const domain = urlObj.hostname
  const defaultFavicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
  const slugTitle = getTitleFromUrl(urlObj)

  // Defensive SSRF Check: Do not query private IP ranges, localhost, or cloud metadata services
  if (isPrivateOrLocalHost(domain)) {
    return {
      title: slugTitle || domain,
      description: null,
      preview_image_url: null,
      favicon_url: defaultFavicon,
      domain
    }
  }

  try {
    // 6-second timeout so requests never hang
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 6000)

    const response = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      redirect: 'follow'
    })

    clearTimeout(timeoutId)

    // Check redirected URL to avoid open SSRF redirects to internal services
    if (response.url) {
      try {
        const redirectedUrlObj = new URL(response.url)
        if (isPrivateOrLocalHost(redirectedUrlObj.hostname)) {
          return {
            title: slugTitle || domain,
            description: null,
            preview_image_url: null,
            favicon_url: defaultFavicon,
            domain
          }
        }
      } catch {}
    }

    // If website returns an HTTP error (e.g. 403 bot block or 404), return safe slug fallback
    if (!response.ok) {
      return {
        title: slugTitle || domain,
        description: null,
        preview_image_url: null,
        favicon_url: defaultFavicon,
        domain
      }
    }

    const contentType = response.headers.get('content-type') || ''
    // If user bookmarked a direct image file
    if (contentType.startsWith('image/')) {
      return {
        title: urlObj.pathname.split('/').pop() || domain,
        description: null,
        preview_image_url: targetUrl,
        favicon_url: defaultFavicon,
        domain
      }
    }

    // Read only up to 1MB of text to protect against response size bombs
    const rawText = await response.text()
    const html = rawText.slice(0, 1024 * 1024)

    // 1. Title: og:title -> <title> tag -> URL slug -> domain
    const ogTitle = getMetaTag(html, 'og:title')
    const titleMatch = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)
    const docTitle = titleMatch ? cleanText(titleMatch[1]) : null
    const finalTitle = ogTitle || docTitle || slugTitle || domain

    // 2. Description: og:description -> meta description
    const ogDesc = getMetaTag(html, 'og:description')
    const metaDesc = getMetaTag(html, 'description')
    const finalDesc = cleanText(ogDesc || metaDesc || '', 2000) || null

    // 3. Preview Image: og:image -> twitter:image -> JSON-LD image
    const rawOgImage = getMetaTag(html, 'og:image') || getMetaTag(html, 'twitter:image')
    const jsonLdImage = getJsonLdImage(html, targetUrl)
    const rawImage = rawOgImage ? toAbsoluteUrl(rawOgImage, targetUrl) : jsonLdImage

    // 4. Favicon: <link rel="icon"> -> Google S2 service
    const iconMatch = html.match(/<link\b[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']*)["']/i) ||
                      html.match(/<link\b[^>]*href=["']([^"']*)["'][^>]*rel=["'](?:shortcut )?icon["']/i)
    const htmlFavicon = iconMatch ? toAbsoluteUrl(iconMatch[1], targetUrl) : null
    const finalFavicon = htmlFavicon || defaultFavicon

    return {
      title: finalTitle,
      description: finalDesc,
      preview_image_url: rawImage || null,
      favicon_url: finalFavicon,
      domain
    }
  } catch (err) {
    // Network error, bot protection timeout, or aborted -> graceful fallback
    return {
      title: slugTitle || domain,
      description: null,
      preview_image_url: null,
      favicon_url: defaultFavicon,
      domain
    }
  }
}
