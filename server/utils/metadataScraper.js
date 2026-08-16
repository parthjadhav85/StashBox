/**
 * Generic, intelligent metadata scraper for web pages, articles, and ecommerce products.
 * Extracts title, description, cover/preview image, favicon, domain, and JSON-LD data.
 * Pure standards-based logic without domain-specific hacks.
 */

// Helper to resolve relative URLs to absolute
const resolveUrl = (relativeUrl, baseUrl) => {
  if (!relativeUrl || typeof relativeUrl !== 'string') return null
  const trimmed = relativeUrl.trim()
  if (!trimmed || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) return null

  try {
    return new URL(trimmed, baseUrl).href
  } catch {
    return null
  }
}

// Clean HTML entities & extra whitespace
const cleanText = (text) => {
  if (!text || typeof text !== 'string') return ''
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Generic helper to derive a human-readable title from URL path when page metadata is blocked or uninformative
const extractUrlDerivedTitle = (urlObj) => {
  if (!urlObj || !urlObj.pathname) return null

  const rawSegments = urlObj.pathname.split('/').filter(Boolean)
  if (rawSegments.length === 0) return null

  const candidates = []
  let productCode = null

  for (const seg of rawSegments) {
    const cleaned = seg.replace(/\.(html?|php|aspx?|jsp)$/i, '').trim()
    if (!cleaned) continue

    // Detect product code / SKU (e.g. IQ9813, BQ6806-100, DD1391-100)
    if (/^[A-Z0-9]{4,10}(?:-[A-Z0-9]{3,6})?$/i.test(cleaned) && /[0-9]/.test(cleaned)) {
      productCode = cleaned.toUpperCase()
      continue
    }

    const words = cleaned
      .replace(/[-_+]+/g, ' ')
      .replace(/\b[0-9a-f]{10,}\b/gi, '')
      .trim()

    if (words.length >= 3 && !/^(item|product|dp|p|t|gp|pd|view)$/i.test(words)) {
      candidates.push(words)
    }
  }

  if (candidates.length > 0) {
    candidates.sort((a, b) => b.length - a.length)
    const bestWords = candidates[0].split(' ')
    const titleCased = bestWords
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ')
      .trim()

    if (productCode && !titleCased.includes(productCode)) {
      return `${titleCased} (${productCode})`
    }
    return titleCased
  }

  if (productCode) return `Product ${productCode}`
  return null
}

// Helper to determine if an extracted title is uninformative / generic / error page
const isUninformativeTitle = (title, domain) => {
  if (!title || typeof title !== 'string') return true
  const lower = title.toLowerCase().trim()
  const domainLower = (domain || '').toLowerCase().trim()
  const domainNoTld = domainLower.replace(/\.(com|co\.[a-z]{2}|in|org|net|io|app|dev|edu|gov|co|uk|de|fr|jp|cn)$/i, '').replace(/^www\./, '')

  const genericTerms = [
    'access denied',
    'forbidden',
    '403 forbidden',
    '404 not found',
    'security check',
    'bot verification',
    'just a moment',
    'attention required',
    'cloudflare',
    'akamai',
    'untitled',
    'home',
    'welcome',
    'loading',
    'error',
    'blocked',
    'request rejected'
  ]

  if (genericTerms.some(term => lower.includes(term))) return true
  if (lower === domainLower || lower === domainNoTld || lower === `www.${domainNoTld}`) return true
  if (lower.startsWith('http://') || lower.startsWith('https://')) return true

  return false
}

// Helper to validate whether an image URL is clean and meaningful
const isCleanImageUrl = (url) => {
  if (!url || typeof url !== 'string') return false
  const lower = url.toLowerCase()

  // Reject generic logos, tracking pixels, bot CDN logos, avatars, sprites
  const rejectionPatterns = [
    'akamai',
    'cloudflare',
    'fastly',
    'avatar',
    'logo',
    'icon',
    'pixel',
    'spacer',
    'loader',
    'spinner',
    'captcha',
    'placeholder',
    'tracking'
  ]

  if (rejectionPatterns.some(p => lower.includes(p))) return false
  if (lower.endsWith('.svg')) return false
  if (lower.startsWith('data:') || lower.startsWith('blob:')) return false

  return true
}

// Extract JSON-LD product & article metadata safely
const extractJsonLd = (html, baseUrl) => {
  const jsonLdBlocks = []
  const scriptRegex = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let match

  while ((match = scriptRegex.exec(html)) !== null) {
    const content = match[1]?.trim()
    if (!content) continue

    try {
      const parsed = JSON.parse(content)
      if (Array.isArray(parsed)) {
        jsonLdBlocks.push(...parsed)
      } else if (parsed['@graph'] && Array.isArray(parsed['@graph'])) {
        jsonLdBlocks.push(...parsed['@graph'])
      } else {
        jsonLdBlocks.push(parsed)
      }
    } catch {
      // Ignore malformed JSON-LD scripts
    }
  }

  let extractedTitle = null
  let extractedImage = null
  let extractedDescription = null
  let extractedBrand = null

  for (const item of jsonLdBlocks) {
    if (!item || typeof item !== 'object') continue

    const type = item['@type']
    const isProduct = type === 'Product' || (Array.isArray(type) && type.includes('Product'))
    const isArticle = type === 'Article' || type === 'NewsArticle' || type === 'BlogPosting' || (Array.isArray(type) && (type.includes('Article') || type.includes('NewsArticle')))
    const isWebPage = type === 'WebPage' || type === 'ItemPage'

    // 1. Title / Name
    if (!extractedTitle) {
      if (isProduct && item.name) extractedTitle = cleanText(item.name)
      else if (isArticle && (item.headline || item.name)) extractedTitle = cleanText(item.headline || item.name)
      else if (isWebPage && item.name) extractedTitle = cleanText(item.name)
      else if (item.name && typeof item.name === 'string') extractedTitle = cleanText(item.name)
    }

    // 2. Image
    if (!extractedImage) {
      const img = item.image
      if (typeof img === 'string' && isCleanImageUrl(img)) {
        extractedImage = resolveUrl(img, baseUrl)
      } else if (Array.isArray(img) && img.length > 0) {
        for (const candidate of img) {
          if (typeof candidate === 'string' && isCleanImageUrl(candidate)) {
            extractedImage = resolveUrl(candidate, baseUrl)
            break
          } else if (candidate && typeof candidate === 'object' && (candidate.url || candidate.contentUrl)) {
            const candidateUrl = candidate.url || candidate.contentUrl
            if (isCleanImageUrl(candidateUrl)) {
              extractedImage = resolveUrl(candidateUrl, baseUrl)
              break
            }
          }
        }
      } else if (img && typeof img === 'object') {
        const candidateUrl = img.url || img.contentUrl
        if (isCleanImageUrl(candidateUrl)) {
          extractedImage = resolveUrl(candidateUrl, baseUrl)
        }
      }
    }

    // 3. Description
    if (!extractedDescription) {
      if (item.description && typeof item.description === 'string') {
        extractedDescription = cleanText(item.description)
      }
    }

    // 4. Brand
    if (!extractedBrand && isProduct && item.brand) {
      if (typeof item.brand === 'string') extractedBrand = cleanText(item.brand)
      else if (item.brand && typeof item.brand === 'object' && item.brand.name) {
        extractedBrand = cleanText(item.brand.name)
      }
    }
  }

  return {
    title: extractedTitle,
    image: extractedImage,
    description: extractedDescription,
    brand: extractedBrand
  }
}

// Extract meta tag contents helper
const getMetaContent = (html, propertyName) => {
  const escaped = propertyName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(
    `<meta\\b[^>]*(?:property|name)=["']${escaped}["'][^>]*content=["']([^"']*)["']|<meta\\b[^>]*content=["']([^"']*)["'][^>]*(?:property|name)=["']${escaped}["']`,
    'i'
  )
  const match = html.match(regex)
  return match ? cleanText(match[1] || match[2]) : null
}

// Secondary generic metadata retrieval for WAF/bot-blocked pages
const fetchSecondaryMetadata = async (targetUrl) => {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 6000)
    const microUrl = `https://api.microlink.io?url=${encodeURIComponent(targetUrl)}`

    const response = await fetch(microUrl, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    })

    clearTimeout(timeoutId)

    if (response.ok) {
      const result = await response.json()
      if (result.status === 'success' && result.data) {
        const d = result.data
        return {
          title: d.title ? cleanText(d.title) : null,
          description: d.description ? cleanText(d.description) : null,
          image: d.image?.url || null,
          logo: d.logo?.url || null
        }
      }
    }
  } catch {
    // Graceful fallback if secondary provider times out or fails
  }
  return null
}

/**
 * Scrapes metadata from a given URL using a robust dual-tier generic architecture.
 * Never throws — always returns an object with best-effort values.
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
  const slugTitle = extractUrlDerivedTitle(urlObj)

  let isDirectBlocked = false
  let directHtml = null

  // TIER 1: Direct Node Server Fetch with realistic browser headers
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 7000)

    const response = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Sec-Ch-Ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1'
      },
      redirect: 'follow'
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      isDirectBlocked = true
    } else {
      const contentType = response.headers.get('content-type') || ''
      if (contentType.startsWith('image/')) {
        return {
          title: urlObj.pathname.split('/').pop() || domain,
          description: null,
          preview_image_url: targetUrl,
          favicon_url: defaultFavicon,
          domain
        }
      }
      if (contentType.includes('text/html') || contentType.includes('application/xhtml+xml')) {
        directHtml = await response.text()
      } else {
        isDirectBlocked = true
      }
    }
  } catch {
    isDirectBlocked = true
  }

  // TIER 1 Metadata Extraction
  let t1Title = null
  let t1Image = null
  let t1Description = null
  let t1Favicon = null

  if (directHtml) {
    const jsonLd = extractJsonLd(directHtml, targetUrl)
    const ogTitle = getMetaContent(directHtml, 'og:title')
    const twitterTitle = getMetaContent(directHtml, 'twitter:title')
    const ogDesc = getMetaContent(directHtml, 'og:description')
    const twitterDesc = getMetaContent(directHtml, 'twitter:description')
    const metaDesc = getMetaContent(directHtml, 'description')
    const ogImage = getMetaContent(directHtml, 'og:image') || getMetaContent(directHtml, 'og:image:secure_url')
    const twitterImage = getMetaContent(directHtml, 'twitter:image') || getMetaContent(directHtml, 'twitter:image:src')

    let docTitle = null
    const titleMatch = directHtml.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)
    if (titleMatch) {
      docTitle = cleanText(titleMatch[1])
    }

    const iconMatch = directHtml.match(/<link\b[^>]*rel=["'](?:shortcut icon|icon|apple-touch-icon)["'][^>]*href=["']([^"']*)["']/i) ||
                      directHtml.match(/<link\b[^>]*href=["']([^"']*)["'][^>]*rel=["'](?:shortcut icon|icon|apple-touch-icon)["']/i)
    if (iconMatch) {
      t1Favicon = resolveUrl(iconMatch[1], targetUrl)
    }

    const linkImageMatch = directHtml.match(/<link\b[^>]*rel=["'](?:image_src)["'][^>]*href=["']([^"']*)["']/i) ||
                           directHtml.match(/<link\b[^>]*href=["']([^"']*)["'][^>]*rel=["'](?:image_src)["']/i)
    const linkImage = linkImageMatch ? resolveUrl(linkImageMatch[1], targetUrl) : null

    // HTML lazy-loaded image extraction
    let pageImageFallback = null
    if (!ogImage && !twitterImage && !jsonLd.image && !linkImage) {
      const imgMatches = [...directHtml.matchAll(/<img\b([^>]*)>/gi)]
      for (const m of imgMatches) {
        const tagAttributes = m[1]
        const srcMatch = tagAttributes.match(/\b(?:src|data-src|data-original|data-lazy-src|data-zoom-image|data-image)=["']([^"']+)["']/i) ||
                         tagAttributes.match(/\bsrcset=["']([^"'\s,]+)/i)
        if (srcMatch) {
          const src = srcMatch[1]
          if (isCleanImageUrl(src)) {
            const resolved = resolveUrl(src, targetUrl)
            if (resolved) {
              pageImageFallback = resolved
              break
            }
          }
        }
      }
    }

    t1Title = jsonLd.title || ogTitle || twitterTitle || docTitle
    const rawImage = jsonLd.image || ogImage || twitterImage || linkImage || pageImageFallback
    t1Image = rawImage ? resolveUrl(rawImage, targetUrl) : null
    t1Description = jsonLd.description || ogDesc || twitterDesc || metaDesc || null

    // Check if Tier 1 returned an uninformative WAF/error title
    if (isUninformativeTitle(t1Title, domain)) {
      isDirectBlocked = true
      t1Title = null
      t1Image = null
    }
  }

  // TIER 2: Secondary Generic Fallback for WAF-blocked or JavaScript-heavy pages
  let t2Data = null
  if (isDirectBlocked || !t1Title || !t1Image) {
    t2Data = await fetchSecondaryMetadata(targetUrl)
  }

  // Determine Final Title
  let finalTitle = t1Title
  if (!finalTitle && t2Data?.title && !isUninformativeTitle(t2Data.title, domain)) {
    finalTitle = t2Data.title
  }
  if (!finalTitle || isUninformativeTitle(finalTitle, domain)) {
    finalTitle = slugTitle || domain
  }

  // Determine Final Image
  let finalImage = t1Image
  if (!finalImage && t2Data?.image && isCleanImageUrl(t2Data.image)) {
    finalImage = resolveUrl(t2Data.image, targetUrl)
  }

  // Special generic video thumbnail fallback (YouTube)
  if (!finalImage && (domain.includes('youtube.com') || domain.includes('youtu.be'))) {
    const vMatch = urlObj.searchParams.get('v') || urlObj.pathname.split('/').pop()
    if (vMatch && vMatch.length >= 8) {
      finalImage = `https://img.youtube.com/vi/${vMatch}/hqdefault.jpg`
    }
  }

  // Determine Final Description
  const finalDescription = t1Description || t2Data?.description || null

  // Determine Final Favicon
  const finalFavicon = t1Favicon || (t2Data?.logo ? resolveUrl(t2Data.logo, targetUrl) : null) || defaultFavicon

  return {
    title: finalTitle,
    description: finalDescription,
    preview_image_url: finalImage,
    favicon_url: finalFavicon,
    domain
  }
}
