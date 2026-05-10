import { useAuthStore } from '@/store/authStore'

/** Convenience hook that re-exports the auth store */
export const useAuth = () => useAuthStore()
