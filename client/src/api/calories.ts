import api from './index'
import { aiApi } from './index'
import type { CaloriePrediction, CalorieLog, Meal } from '@/types'

export interface CaloriePayload {
  weight: number; height: number; age: number; gender: string
  exercise_type: string; duration_minutes: number; intensity: string
}

export const caloriesApi = {
  predict: (payload: CaloriePayload) =>
    aiApi.post<CaloriePrediction>('/predict/calories', payload),

  getLogs: (days = 7) =>
    api.get<{ logs: CalorieLog[] }>(`/calories?days=${days}`),

  logMeal: (meal: Meal) =>
    api.post<{ log: CalorieLog }>('/calories/log', { meal }),

  logBurned: (burned: number) =>
    api.post<{ log: CalorieLog }>('/calories/log', { burned }),

  logWater: (water: number) =>
    api.post<{ log: CalorieLog }>('/calories/log', { water }),
}
