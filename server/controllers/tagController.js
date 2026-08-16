import { supabase } from '../config/supabase.js'

export const getTags = async (req, res) => {
  try {
    const db = req.supabase || supabase
    const { data, error } = await db
      .from('tags')
      .select('*')
      .eq('user_id', req.user.id)
      .order('name', { ascending: true })

    if (error) {
      return res.status(400).json({
        message: error.message
      })
    }

    res.json({
      tags: data || []
    })
  } catch (error) {
    res.status(500).json({
      message: 'Server error retrieving tags'
    })
  }
}

export const createTag = async (req, res) => {
  try {
    const db = req.supabase || supabase
    const { name, color } = req.body

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        message: 'Tag name is required'
      })
    }

    const trimmedName = name.trim()

    // Check if tag already exists for user (case-insensitive)
    const { data: existingTag } = await db
      .from('tags')
      .select('*')
      .eq('user_id', req.user.id)
      .ilike('name', trimmedName)
      .maybeSingle()

    if (existingTag) {
      return res.status(400).json({
        message: 'A tag with this name already exists',
        tag: existingTag
      })
    }

    const { data, error } = await db
      .from('tags')
      .insert([
        {
          user_id: req.user.id,
          name: trimmedName,
          color: color || null
        }
      ])
      .select()
      .single()

    if (error) {
      return res.status(400).json({
        message: error.message
      })
    }

    res.status(201).json({
      message: 'Tag created successfully',
      tag: data
    })
  } catch (error) {
    res.status(500).json({
      message: 'Server error creating tag'
    })
  }
}

export const updateTag = async (req, res) => {
  try {
    const db = req.supabase || supabase
    const { id } = req.params
    const { name, color } = req.body

    if (name !== undefined && (!name || typeof name !== 'string' || !name.trim())) {
      return res.status(400).json({
        message: 'Tag name cannot be empty'
      })
    }

    const updateData = {}
    if (name !== undefined) {
      const trimmedName = name.trim()

      // Check collision with another tag
      const { data: collision } = await db
        .from('tags')
        .select('id')
        .eq('user_id', req.user.id)
        .ilike('name', trimmedName)
        .neq('id', id)
        .maybeSingle()

      if (collision) {
        return res.status(400).json({
          message: 'Another tag with this name already exists'
        })
      }

      updateData.name = trimmedName
    }

    if (color !== undefined) {
      updateData.color = color || null
    }

    const { data, error } = await db
      .from('tags')
      .update(updateData)
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
        message: 'Tag not found'
      })
    }

    res.json({
      message: 'Tag updated successfully',
      tag: data
    })
  } catch (error) {
    res.status(500).json({
      message: 'Server error updating tag'
    })
  }
}

export const deleteTag = async (req, res) => {
  try {
    const db = req.supabase || supabase
    const { id } = req.params

    // First remove associations from bookmark_tags
    await db
      .from('bookmark_tags')
      .delete()
      .eq('tag_id', id)

    // Delete the tag
    const { data, error } = await db
      .from('tags')
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
        message: 'Tag not found'
      })
    }

    res.json({
      message: 'Tag deleted successfully'
    })
  } catch (error) {
    res.status(500).json({
      message: 'Server error deleting tag'
    })
  }
}

export const getBookmarkTags = async (req, res) => {
  try {
    const db = req.supabase || supabase
    const { bookmarkId } = req.params

    // Verify bookmark belongs to the authenticated user
    const { data: bookmark, error: bookmarkError } = await db
      .from('bookmarks')
      .select('id')
      .eq('id', bookmarkId)
      .eq('user_id', req.user.id)
      .maybeSingle()

    if (bookmarkError) {
      return res.status(400).json({
        message: bookmarkError.message
      })
    }

    if (!bookmark) {
      return res.status(404).json({
        message: 'Bookmark not found'
      })
    }

    const { data, error } = await db
      .from('bookmark_tags')
      .select('tag:tags(id, name, color, created_at)')
      .eq('bookmark_id', bookmarkId)

    if (error) {
      return res.status(400).json({
        message: error.message
      })
    }

    const tags = (data || []).map(item => item.tag).filter(Boolean)

    res.json({
      tags
    })
  } catch (error) {
    res.status(500).json({
      message: 'Server error retrieving bookmark tags'
    })
  }
}

export const addTagToBookmark = async (req, res) => {
  try {
    const db = req.supabase || supabase
    const { bookmarkId } = req.params
    const { tagId, tagName, color } = req.body

    // 1. Verify bookmark belongs to authenticated user
    const { data: bookmark, error: bookmarkError } = await db
      .from('bookmarks')
      .select('id')
      .eq('id', bookmarkId)
      .eq('user_id', req.user.id)
      .maybeSingle()

    if (bookmarkError) {
      return res.status(400).json({
        message: bookmarkError.message
      })
    }

    if (!bookmark) {
      return res.status(404).json({
        message: 'Bookmark not found'
      })
    }

    let resolvedTag = null

    // 2. Resolve tag: by tagId or by tagName
    if (tagId) {
      const { data: tag, error: tagError } = await db
        .from('tags')
        .select('*')
        .eq('id', tagId)
        .eq('user_id', req.user.id)
        .maybeSingle()

      if (tagError || !tag) {
        return res.status(404).json({
          message: 'Tag not found'
        })
      }
      resolvedTag = tag
    } else if (tagName && typeof tagName === 'string' && tagName.trim()) {
      const trimmed = tagName.trim()
      // Check if exists
      const { data: existingTag } = await db
        .from('tags')
        .select('*')
        .eq('user_id', req.user.id)
        .ilike('name', trimmed)
        .maybeSingle()

      if (existingTag) {
        resolvedTag = existingTag
      } else {
        // Create new tag
        const { data: newTag, error: createError } = await db
          .from('tags')
          .insert([{ user_id: req.user.id, name: trimmed, color: color || null }])
          .select()
          .single()

        if (createError || !newTag) {
          return res.status(400).json({
            message: createError?.message || 'Could not create tag'
          })
        }
        resolvedTag = newTag
      }
    } else {
      return res.status(400).json({
        message: 'tagId or tagName is required'
      })
    }

    // 3. Check if relationship already exists
    const { data: existingRel } = await db
      .from('bookmark_tags')
      .select('*')
      .eq('bookmark_id', bookmarkId)
      .eq('tag_id', resolvedTag.id)
      .maybeSingle()

    if (existingRel) {
      return res.status(200).json({
        message: 'Tag already attached to bookmark',
        tag: resolvedTag
      })
    }

    // 4. Attach tag
    const { error: attachError } = await db
      .from('bookmark_tags')
      .insert([
        {
          bookmark_id: bookmarkId,
          tag_id: resolvedTag.id
        }
      ])

    if (attachError) {
      return res.status(400).json({
        message: attachError.message
      })
    }

    res.status(201).json({
      message: 'Tag attached to bookmark successfully',
      tag: resolvedTag
    })
  } catch (error) {
    res.status(500).json({
      message: 'Server error attaching tag to bookmark'
    })
  }
}

export const removeTagFromBookmark = async (req, res) => {
  try {
    const db = req.supabase || supabase
    const { bookmarkId, tagId } = req.params

    // 1. Verify bookmark belongs to authenticated user
    const { data: bookmark, error: bookmarkError } = await db
      .from('bookmarks')
      .select('id')
      .eq('id', bookmarkId)
      .eq('user_id', req.user.id)
      .maybeSingle()

    if (bookmarkError || !bookmark) {
      return res.status(404).json({
        message: 'Bookmark not found'
      })
    }

    // 2. Verify tag belongs to authenticated user
    const { data: tag, error: tagError } = await db
      .from('tags')
      .select('id')
      .eq('id', tagId)
      .eq('user_id', req.user.id)
      .maybeSingle()

    if (tagError || !tag) {
      return res.status(404).json({
        message: 'Tag not found'
      })
    }

    // 3. Delete association
    const { error: deleteError } = await db
      .from('bookmark_tags')
      .delete()
      .eq('bookmark_id', bookmarkId)
      .eq('tag_id', tagId)

    if (deleteError) {
      return res.status(400).json({
        message: deleteError.message
      })
    }

    res.json({
      message: 'Tag removed from bookmark successfully'
    })
  } catch (error) {
    res.status(500).json({
      message: 'Server error removing tag from bookmark'
    })
  }
}
