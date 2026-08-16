import { supabase } from '../config/supabase.js'
import { scrapePageMetadata } from '../utils/metadataScraper.js'

const validateAndFormatUrl = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== 'string' || !rawUrl.trim()) {
    return { valid: false, message: 'URL is required' }
  }

  const trimmed = rawUrl.trim()
  let urlObj
  try {
    urlObj = new URL(trimmed)
  } catch {
    // Try prefixing with https:// if scheme was omitted
    try {
      urlObj = new URL(`https://${trimmed}`)
    } catch {
      return { valid: false, message: 'Invalid URL format' }
    }
  }

  if (!['http:', 'https:'].includes(urlObj.protocol)) {
    return { valid: false, message: 'URL must use HTTP or HTTPS protocol' }
  }

  return {
    valid: true,
    href: urlObj.href,
    hostname: urlObj.hostname
  }
}

export const createBookmark = async (req, res) => {
  try {
    const db = req.supabase || supabase
    const {
      url,
      title,
      description,
      domain,
      favicon_url,
      preview_image_url,
      collection_id,
      is_favorite,
      is_archived
    } = req.body

    const urlCheck = validateAndFormatUrl(url)
    if (!urlCheck.valid) {
      return res.status(400).json({
        message: urlCheck.message
      })
    }

    if (collection_id) {
      const { data: collection, error: collectionError } = await db
        .from('collections')
        .select('id')
        .eq('id', collection_id)
        .eq('user_id', req.user.id)
        .maybeSingle()

      if (collectionError || !collection) {
        return res.status(400).json({
          message: 'Invalid collection'
        })
      }
    }

    // Scrape page-specific metadata (JSON-LD, OG tags, images, favicons)
    const scraped = await scrapePageMetadata(urlCheck.href)

    // User-entered values take precedence over scraped values
    const finalDomain = domain ? domain.trim() : (scraped.domain || urlCheck.hostname)
    const finalTitle = (title && title.trim()) ? title.trim() : (scraped.title || finalDomain)
    const finalDescription = (description && description.trim()) ? description.trim() : scraped.description
    const finalPreviewImage = preview_image_url || scraped.preview_image_url || null
    const finalFavicon = favicon_url || scraped.favicon_url || `https://www.google.com/s2/favicons?domain=${finalDomain}&sz=128`

    const { data, error } = await db
      .from('bookmarks')
      .insert([
        {
          user_id: req.user.id,
          url: urlCheck.href,
          title: finalTitle,
          description: finalDescription,
          domain: finalDomain,
          favicon_url: finalFavicon,
          preview_image_url: finalPreviewImage,
          collection_id: collection_id || null,
          is_favorite: Boolean(is_favorite),
          is_archived: Boolean(is_archived)
        }
      ])
      .select('*, collections(id, name, color, icon)')
      .single()

    if (error) {
      return res.status(400).json({
        message: error.message
      })
    }

    res.status(201).json({
      message: 'Bookmark created successfully',
      bookmark: data
    })
  } catch (error) {
    res.status(500).json({
      message: 'Server error creating bookmark'
    })
  }
}

export const refreshBookmarkMetadata = async (req, res) => {
  try {
    const db = req.supabase || supabase
    const { id } = req.params

    const { data: existing, error: findError } = await db
      .from('bookmarks')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .maybeSingle()

    if (findError || !existing) {
      return res.status(404).json({
        message: 'Bookmark not found'
      })
    }

    // Scrape fresh metadata from the bookmark URL
    const scraped = await scrapePageMetadata(existing.url)

    // Update if scraped metadata is available
    const updates = {
      domain: scraped.domain || existing.domain,
      favicon_url: scraped.favicon_url || existing.favicon_url,
      preview_image_url: scraped.preview_image_url || existing.preview_image_url,
      updated_at: new Date().toISOString()
    }

    if (scraped.description && (!existing.description || existing.description.trim() === '')) {
      updates.description = scraped.description
    }

    // If current title is just the domain or URL, update with scraped title
    if (!existing.title || existing.title.toLowerCase() === existing.domain?.toLowerCase() || existing.title.includes('http')) {
      updates.title = scraped.title || existing.title
    }

    const { data: updated, error: updateError } = await db
      .from('bookmarks')
      .update(updates)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select('*, collections(id, name, color, icon)')
      .single()

    if (updateError) {
      return res.status(400).json({ message: updateError.message })
    }

    res.json({
      message: 'Bookmark metadata refreshed',
      bookmark: updated
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error refreshing bookmark metadata' })
  }
}

export const getBookmarks = async (req, res) => {
  try {
    const db = req.supabase || supabase
    let query = db
      .from('bookmarks')
      .select('*, collections(id, name, color, icon)')
      .eq('user_id', req.user.id)

    if (req.query.collection_id) {
      query = query.eq('collection_id', req.query.collection_id)
    }

    if (req.query.is_favorite !== undefined) {
      query = query.eq('is_favorite', req.query.is_favorite === 'true')
    }

    if (req.query.is_archived !== undefined) {
      query = query.eq('is_archived', req.query.is_archived === 'true')
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      return res.status(400).json({
        message: error.message
      })
    }

    res.json({
      bookmarks: data || []
    })
  } catch (error) {
    res.status(500).json({
      message: 'Server error retrieving bookmarks'
    })
  }
}

export const getBookmarkById = async (req, res) => {
  try {
    const db = req.supabase || supabase
    const { id } = req.params

    const { data, error } = await db
      .from('bookmarks')
      .select('*, collections(id, name, color, icon)')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .maybeSingle()

    if (error) {
      return res.status(400).json({
        message: error.message
      })
    }

    if (!data) {
      return res.status(404).json({
        message: 'Bookmark not found'
      })
    }

    res.json({
      bookmark: data
    })
  } catch (error) {
    res.status(500).json({
      message: 'Server error retrieving bookmark'
    })
  }
}

export const updateBookmark = async (req, res) => {
  try {
    const db = req.supabase || supabase
    const { id } = req.params
    const {
      url,
      title,
      description,
      domain,
      favicon_url,
      preview_image_url,
      collection_id,
      is_favorite,
      is_archived
    } = req.body

    if (collection_id !== undefined && collection_id !== null) {
      const { data: collection, error: collectionError } = await db
        .from('collections')
        .select('id')
        .eq('id', collection_id)
        .eq('user_id', req.user.id)
        .maybeSingle()

      if (collectionError || !collection) {
        return res.status(400).json({
          message: 'Invalid collection'
        })
      }
    }

    const updateData = {
      updated_at: new Date().toISOString()
    }

    if (url !== undefined) {
      const urlCheck = validateAndFormatUrl(url)
      if (!urlCheck.valid) {
        return res.status(400).json({
          message: urlCheck.message
        })
      }
      updateData.url = urlCheck.href
      if (domain === undefined) {
        updateData.domain = urlCheck.hostname
      }
    }

    if (title !== undefined) updateData.title = title ? title.trim() : ''
    if (description !== undefined) updateData.description = description ? description.trim() : null
    if (domain !== undefined) updateData.domain = domain ? domain.trim() : null
    if (favicon_url !== undefined) updateData.favicon_url = favicon_url || null
    if (preview_image_url !== undefined) updateData.preview_image_url = preview_image_url || null
    if (collection_id !== undefined) updateData.collection_id = collection_id || null
    if (is_favorite !== undefined) updateData.is_favorite = Boolean(is_favorite)
    if (is_archived !== undefined) updateData.is_archived = Boolean(is_archived)

    const { data, error } = await db
      .from('bookmarks')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select('*, collections(id, name, color, icon)')
      .maybeSingle()

    if (error) {
      return res.status(400).json({
        message: error.message
      })
    }

    if (!data) {
      return res.status(404).json({
        message: 'Bookmark not found'
      })
    }

    res.json({
      message: 'Bookmark updated successfully',
      bookmark: data
    })
  } catch (error) {
    res.status(500).json({
      message: 'Server error updating bookmark'
    })
  }
}

export const deleteBookmark = async (req, res) => {
  try {
    const db = req.supabase || supabase
    const { id } = req.params

    const { data, error } = await db
      .from('bookmarks')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .maybeSingle()

    if (error) {
      return res.status(400).json({
        message: error.message
      })
    }

    if (!data) {
      return res.status(404).json({
        message: 'Bookmark not found'
      })
    }

    res.json({
      message: 'Bookmark deleted successfully'
    })
  } catch (error) {
    res.status(500).json({
      message: 'Server error deleting bookmark'
    })
  }
}

export const toggleFavorite = async (req, res) => {
  try {
    const db = req.supabase || supabase
    const { id } = req.params

    const { data: current, error: getError } = await db
      .from('bookmarks')
      .select('id, is_favorite')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .maybeSingle()

    if (getError) {
      return res.status(400).json({
        message: getError.message
      })
    }

    if (!current) {
      return res.status(404).json({
        message: 'Bookmark not found'
      })
    }

    const nextFavoriteState = req.body.is_favorite !== undefined
      ? Boolean(req.body.is_favorite)
      : !current.is_favorite

    const { data, error } = await db
      .from('bookmarks')
      .update({
        is_favorite: nextFavoriteState,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select('*, collections(id, name, color, icon)')
      .maybeSingle()

    if (error) {
      return res.status(400).json({
        message: error.message
      })
    }

    res.json({
      message: `Bookmark ${nextFavoriteState ? 'marked as favorite' : 'removed from favorites'}`,
      bookmark: data
    })
  } catch (error) {
    res.status(500).json({
      message: 'Server error toggling favorite status'
    })
  }
}

export const toggleArchive = async (req, res) => {
  try {
    const db = req.supabase || supabase
    const { id } = req.params

    const { data: current, error: getError } = await db
      .from('bookmarks')
      .select('id, is_archived')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .maybeSingle()

    if (getError) {
      return res.status(400).json({
        message: getError.message
      })
    }

    if (!current) {
      return res.status(404).json({
        message: 'Bookmark not found'
      })
    }

    const nextArchiveState = req.body.is_archived !== undefined
      ? Boolean(req.body.is_archived)
      : !current.is_archived

    const { data, error } = await db
      .from('bookmarks')
      .update({
        is_archived: nextArchiveState,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select('*, collections(id, name, color, icon)')
      .maybeSingle()

    if (error) {
      return res.status(400).json({
        message: error.message
      })
    }

    res.json({
      message: `Bookmark ${nextArchiveState ? 'archived' : 'unarchived'}`,
      bookmark: data
    })
  } catch (error) {
    res.status(500).json({
      message: 'Server error toggling archive status'
    })
  }
}
