import api from './index'
import { aiApi } from './index'
import type { WorkoutPlan, WorkoutHistory } from '@/types'

export const workoutApi = {
  recommend: () =>
    api.get<WorkoutPlan>('/workouts/recommend'),

  getHistory: (page = 1, limit = 20) =>
    api.get<{ workouts: WorkoutHistory[]; total: number }>(`/workouts?page=${page}&limit=${limit}`),

  save: (data: Partial<WorkoutHistory>) =>
    api.post<{ workout: WorkoutHistory }>('/workouts', data),

  delete: (id: string) =>
    api.delete(`/workouts/${id}`),

  // Direct AI call
  predictFromAI: (payload: object) =>
    aiApi.post<WorkoutPlan>('/predict/workout', payload),
}
