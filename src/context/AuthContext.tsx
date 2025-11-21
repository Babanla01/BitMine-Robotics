import { createContext, useReducer, useContext, useEffect } from 'react'
import type { ReactNode } from 'react'

interface User {
  name: string
  email: string
}

interface AuthState {
  isAuthenticated: boolean
  user: User | null
}

type AuthAction =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }

interface AuthContextValue {
  isAuthenticated: boolean
  user: User | null
  login: (user: User) => void
  signup: (user: User) => void
  logout: () => void
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null
}

const STORAGE_KEY = 'bitmine-auth'

const loadState = (): AuthState => {
  if (typeof window === 'undefined') return initialState
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as AuthState
      return parsed
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
        user: action.payload
      }
    case 'LOGOUT':
      return initialState
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (error) {
      console.error('Failed to persist auth state', error)
    }
  }, [state])

  const login = (user: User) => {
    dispatch({ type: 'LOGIN', payload: user })
  }

  const signup = (user: User) => {
    dispatch({ type: 'LOGIN', payload: user })
  }

  const logout = () => {
    dispatch({ type: 'LOGOUT' })
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated: state.isAuthenticated, user: state.user, login, signup, logout }}>
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

