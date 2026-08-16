/**
 * Stashbox Web Metadata Scraper
 * 
 * Extracts title, preview image, description, and favicon from a given URL
 * using standard HTML tags (OpenGraph, Twitter Cards, HTML5 meta/link).
 */

// Helper to convert relative URLs into absolute URLs
const toAbsoluteUrl = (relativeUrl, baseUrl) => {
  if (!relativeUrl || typeof relativeUrl !== 'string') return null
  const trimmed = relativeUrl.trim()
  if (!trimmed || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) return null

  try {
    return new URL(trimmed, baseUrl).href
  } catch {
    return null
  }
}

// Clean HTML entities and extra spaces
const cleanText = (text) => {
  if (!text || typeof text !== 'string') return ''
  return text
    .replace(/&#x27;/gi, "'")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
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

    const html = await response.text()

    // 1. Title: og:title -> <title> tag -> URL slug -> domain
    const ogTitle = getMetaTag(html, 'og:title')
    const titleMatch = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)
    const docTitle = titleMatch ? cleanText(titleMatch[1]) : null
    
    let title = ogTitle || docTitle
    // If title is generic or just the domain, use readable URL slug
    if (!title || title.toLowerCase() === domain.toLowerCase() || title.toLowerCase() === 'untitled') {
      title = slugTitle || domain
    }

    // 2. Preview Image: og:image -> twitter:image -> json-ld image -> link image_src
    const ogImage = getMetaTag(html, 'og:image') || getMetaTag(html, 'og:image:secure_url')
    const twitterImage = getMetaTag(html, 'twitter:image') || getMetaTag(html, 'twitter:image:src')
    const jsonLdImage = getJsonLdImage(html, targetUrl)
    const linkImageMatch = html.match(/<link\b[^>]*rel=["']image_src["'][^>]*href=["']([^"']*)["']/i)
    const linkImage = linkImageMatch ? toAbsoluteUrl(linkImageMatch[1], targetUrl) : null

    const rawImage = ogImage || twitterImage || jsonLdImage || linkImage
    const previewImageUrl = rawImage ? toAbsoluteUrl(rawImage, targetUrl) : null

    // 3. Description: og:description -> meta description
    const ogDesc = getMetaTag(html, 'og:description')
    const metaDesc = getMetaTag(html, 'description')
    const description = ogDesc || metaDesc || null

    // 4. Favicon: <link rel="icon"> -> Google favicon fallback
    let faviconUrl = defaultFavicon
    const iconMatch = html.match(/<link\b[^>]*rel=["'](?:shortcut icon|icon|apple-touch-icon)["'][^>]*href=["']([^"']*)["']/i) ||
                      html.match(/<link\b[^>]*href=["']([^"']*)["'][^>]*rel=["'](?:shortcut icon|icon|apple-touch-icon)["']/i)
    if (iconMatch) {
      faviconUrl = toAbsoluteUrl(iconMatch[1], targetUrl) || defaultFavicon
    }

    return {
      title,
      description,
      preview_image_url: previewImageUrl,
      favicon_url: faviconUrl,
      domain
    }
  } catch {
    // If network fails or times out, fall back safely without breaking bookmark creation
    return {
      title: slugTitle || domain,
      description: null,
      preview_image_url: null,
      favicon_url: defaultFavicon,
      domain
    }
  }
}
