import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '@/api/auth'
import { TOKEN_KEY } from '@/utils/constants'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean

  // Actions
  login:    (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout:   () => void
  fetchMe:  () => Promise<void>
  updateUser: (data: Partial<User>) => void
  setLoading: (v: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        const { data } = await authApi.login({ email, password })
        localStorage.setItem(TOKEN_KEY, data.token)
        set({ user: data.user, token: data.token, isAuthenticated: true })
      },

      register: async (name, email, password) => {
        const { data } = await authApi.register({ name, email, password })
        localStorage.setItem(TOKEN_KEY, data.token)
        set({ user: data.user, token: data.token, isAuthenticated: true })
      },

      logout: () => {
        localStorage.removeItem(TOKEN_KEY)
        set({ user: null, token: null, isAuthenticated: false })
      },

      fetchMe: async () => {
        set({ isLoading: true })
        try {
          const { data } = await authApi.me()
          set({ user: data.user, isAuthenticated: true })
        } catch {
          get().logout()
        } finally {
          set({ isLoading: false })
        }
      },

      updateUser: (data) =>
        set(state => ({ user: state.user ? { ...state.user, ...data } : null })),

      setLoading: (v) => set({ isLoading: v }),
    }),
    {
      name: 'fitai-auth',
      partialize: (s) => ({ token: s.token, user: s.user, isAuthenticated: s.isAuthenticated }),
    }
  )
)
