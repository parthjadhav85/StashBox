const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const TOKEN_KEY = 'stashbox_token'

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export const setToken = (token) => {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token)
    } else {
      localStorage.removeItem(TOKEN_KEY)
    }
  } catch (err) {
    console.error('Failed to set token:', err)
  }
}

export const clearToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch (err) {
    console.error('Failed to clear token:', err)
  }
}

export async function request(endpoint, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  }

  const config = {
    ...options,
    headers
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config)
    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      const error = new Error(data.message || `Request failed with status ${response.status}`)
      error.status = response.status
      error.data = data
      throw error
    }

    return data
  } catch (err) {
    if (err.status === 401 && !endpoint.startsWith('/auth/login') && !endpoint.startsWith('/auth/signup')) {
      clearToken()
    }
    throw err
  }
}

export const api = {
  auth: {
    signup: (body) => request('/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
    login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    getMe: () => request('/auth/me'),
    updateProfile: (body) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),
    logout: () => request('/auth/logout', { method: 'POST' })
  },
  collections: {
    getAll: () => request('/collections'),
    getById: (id) => request(`/collections/${id}`),
    create: (body) => request('/collections', { method: 'POST', body: JSON.stringify(body) }),
    update: (id, body) => request(`/collections/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id) => request(`/collections/${id}`, { method: 'DELETE' })
  },
  bookmarks: {
    getAll: (params = '') => request(`/bookmarks${params ? `?${params}` : ''}`),
    getById: (id) => request(`/bookmarks/${id}`),
    create: (body) => request('/bookmarks', { method: 'POST', body: JSON.stringify(body) }),
    update: (id, body) => request(`/bookmarks/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id) => request(`/bookmarks/${id}`, { method: 'DELETE' }),
    toggleFavorite: (id, body = {}) => request(`/bookmarks/${id}/favorite`, { method: 'PATCH', body: JSON.stringify(body) }),
    toggleArchive: (id, body = {}) => request(`/bookmarks/${id}/archive`, { method: 'PATCH', body: JSON.stringify(body) }),
    refreshMetadata: (id) => request(`/bookmarks/${id}/refresh`, { method: 'POST' })
  }
}

