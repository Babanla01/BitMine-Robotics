import { createContext, useReducer, useContext, useEffect } from 'react'
import type { ReactNode } from 'react'
import { API, apiCall } from '../config/api'

interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'user'
  profile_completed?: boolean
}

interface AuthState {
  isAuthenticated: boolean
  user: User | null
  loading: boolean
  token: string | null
}

type AuthAction =
  | { type: 'LOGIN'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }

interface AuthContextValue {
  isAuthenticated: boolean
  user: User | null
  loading: boolean
  token: string | null
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  isAdmin: boolean
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  token: null
}

const STORAGE_KEY = 'bitmine-auth'
const TOKEN_KEY = 'bitmine-token'

const loadState = (): AuthState => {
  if (typeof window === 'undefined') return initialState
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    const token = localStorage.getItem(TOKEN_KEY)
    if (stored && token) {
      const parsed = JSON.parse(stored) as AuthState
      return { ...parsed, token }
    }
  } catch (error) {
    console.error('Failed to parse auth state', error)
  }
  return initialState
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN':
      return {
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: false
      }
    case 'LOGOUT':
      return initialState
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_USER':
      return { ...state, user: action.payload }
    default:
      return state
  }
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState, loadState)

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        loading: state.loading,
        token: null // Don't store token in JSON for security
      }))
      if (state.token) {
        localStorage.setItem(TOKEN_KEY, state.token)
      } else {
        localStorage.removeItem(TOKEN_KEY)
      }
    } catch (error) {
      console.error('Failed to persist auth state', error)
    }
  }, [state])

  const login = async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const data = await apiCall(API.login, {
        method: 'POST',
        body: JSON.stringify({ email, password })
      })
      dispatch({
        type: 'LOGIN',
        payload: { user: data.user, token: data.token }
      })
      return data.user
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  const signup = async (name: string, email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const data = await apiCall(API.register, {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
      })
      dispatch({
        type: 'LOGIN',
        payload: { user: data.user, token: data.token }
      })
    } catch (error) {
      console.error('Signup failed:', error)
      throw error
    }
  }

  const logout = () => {
    dispatch({ type: 'LOGOUT' })
  }

  const isAdmin = state.user?.role === 'admin'

  return (
    <AuthContext.Provider value={{ isAuthenticated: state.isAuthenticated, user: state.user, loading: state.loading, token: state.token, login, signup, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

