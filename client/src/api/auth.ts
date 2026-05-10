import api from './index'
import type { User } from '@/types'

export interface LoginPayload    { email: string; password: string }
export interface RegisterPayload { name: string; email: string; password: string }
export interface AuthResponse    { token: string; user: User }

export const authApi = {
  login: (payload: LoginPayload) =>
    api.post<AuthResponse>('/auth/login', payload),

  register: (payload: RegisterPayload) =>
    api.post<AuthResponse>('/auth/register', payload),

  me: () =>
    api.get<{ user: User }>('/auth/me'),

  updateProfile: (data: Partial<User>) =>
    api.put<{ user: User }>('/users/profile', data),
}
