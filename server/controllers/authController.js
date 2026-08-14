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