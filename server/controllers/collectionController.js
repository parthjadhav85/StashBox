import { supabase } from '../config/supabase.js'

export const createCollection = async (req, res) => {
  try {
    const db = req.supabase || supabase
    const { name, description, color, icon, parent_id } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: 'Collection name is required'
      })
    }

    if (parent_id) {
      const { data: parentCollection, error: parentError } = await db
        .from('collections')
        .select('id')
        .eq('id', parent_id)
        .eq('user_id', req.user.id)
        .maybeSingle()

      if (parentError || !parentCollection) {
        return res.status(400).json({
          message: 'Invalid parent collection'
        })
      }
    }

    const { data, error } = await db
      .from('collections')
      .insert([
        {
          name: name.trim(),
          description: description ? description.trim() : null,
          color: color || null,
          icon: icon || null,
          parent_id: parent_id || null,
          user_id: req.user.id
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
      message: 'Collection created successfully',
      collection: data
    })
  } catch (error) {
    res.status(500).json({
      message: 'Server error creating collection'
    })
  }
}

export const getCollections = async (req, res) => {
  try {
    const db = req.supabase || supabase
    const { data, error } = await db
      .from('collections')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: true })

    if (error) {
      return res.status(400).json({
        message: error.message
      })
    }

    res.json({
      collections: data || []
    })
  } catch (error) {
    res.status(500).json({
      message: 'Server error retrieving collections'
    })
  }
}

export const getCollectionById = async (req, res) => {
  try {
    const db = req.supabase || supabase
    const { id } = req.params

    const { data, error } = await db
      .from('collections')
      .select('*')
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
        message: 'Collection not found'
      })
    }

    res.json({
      collection: data
    })
  } catch (error) {
    res.status(500).json({
      message: 'Server error retrieving collection'
    })
  }
}

export const updateCollection = async (req, res) => {
  try {
    const db = req.supabase || supabase
    const { id } = req.params
    const { name, description, color, icon, parent_id } = req.body

    if (name !== undefined && (!name || !name.trim())) {
      return res.status(400).json({
        message: 'Collection name cannot be empty'
      })
    }

    if (parent_id !== undefined && parent_id !== null) {
      if (parent_id === id) {
        return res.status(400).json({
          message: 'A collection cannot be its own parent'
        })
      }

      const { data: parentCollection, error: parentError } = await db
        .from('collections')
        .select('id')
        .eq('id', parent_id)
        .eq('user_id', req.user.id)
        .maybeSingle()

      if (parentError || !parentCollection) {
        return res.status(400).json({
          message: 'Invalid parent collection'
        })
      }
    }

    const updateData = {
      updated_at: new Date().toISOString()
    }
    if (name !== undefined) updateData.name = name.trim()
    if (description !== undefined) updateData.description = description ? description.trim() : null
    if (color !== undefined) updateData.color = color || null
    if (icon !== undefined) updateData.icon = icon || null
    if (parent_id !== undefined) updateData.parent_id = parent_id || null

    const { data, error } = await db
      .from('collections')
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
        message: 'Collection not found'
      })
    }

    res.json({
      message: 'Collection updated successfully',
      collection: data
    })
  } catch (error) {
    res.status(500).json({
      message: 'Server error updating collection'
    })
  }
}

export const deleteCollection = async (req, res) => {
  try {
    const db = req.supabase || supabase
    const { id } = req.params

    const { data, error } = await db
      .from('collections')
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
        message: 'Collection not found'
      })
    }

    res.json({
      message: 'Collection deleted successfully'
    })
  } catch (error) {
    res.status(500).json({
      message: 'Server error deleting collection'
    })
  }
}
