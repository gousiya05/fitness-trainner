import api from './index'
import { aiApi } from './index'
import type { DashboardStats } from '@/types'

export const dashboardApi = {
  getStats: () =>
    api.get<DashboardStats>('/dashboard/stats'),
}
