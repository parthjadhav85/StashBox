import { supabase } from '../config/supabase.js'

export const signup = async (req, res) => {
  try {
    const { email, password, displayName } = req.body

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required'
      })
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName || ''
        }
      }
    })

    if (error) {
      return res.status(400).json({
        message: error.message
      })
    }

    res.status(201).json({
      message: 'Account created successfully',
      user: data.user,
      session: data.session
    })
  } catch (error) {
    res.status(500).json({
      message: 'Server error'
    })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required'
      })
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return res.status(401).json({
        message: error.message
      })
    }

    res.json({
      message: 'Login successful',
      user: data.user,
      session: data.session
    })
  } catch (error) {
    res.status(500).json({
      message: 'Server error'
    })
  }
}

export const getMe = async (req, res) => {
  try {
    const user = req.user

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    res.json({
      user,
      profile: profile || null
    })
  } catch (error) {
    res.status(500).json({
      message: 'Server error'
    })
  }
}

export const updateProfile = async (req, res) => {
  try {
    const { displayName } = req.body

    if (!displayName || !displayName.trim()) {
      return res.status(400).json({
        message: 'Display name is required'
      })
    }

    const trimmedName = displayName.trim()

    const db = req.supabase || supabase

    // Update in profiles table
    const { data: profile, error } = await db
      .from('profiles')
      .update({ display_name: trimmedName, updated_at: new Date().toISOString() })
      .eq('id', req.user.id)
      .select()
      .maybeSingle()

    // Also update auth user metadata if req.supabase is available
    if (req.supabase) {
      await req.supabase.auth.updateUser({
        data: { display_name: trimmedName }
      }).catch(() => {})
    }

    res.json({
      message: 'Profile updated successfully',
      profile: profile || { id: req.user.id, display_name: trimmedName }
    })
  } catch (error) {
    res.status(500).json({
      message: 'Server error'
    })
  }
}

export const logout = async (req, res) => {
  try {
    res.json({
      message: 'Logged out successfully'
    })
  } catch (error) {
    res.status(500).json({
      message: 'Server error'
    })
  }
}