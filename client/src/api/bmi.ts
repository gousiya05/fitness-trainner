import api from './index'
import { aiApi } from './index'
import type { BMIResult, BMIHistory } from '@/types'

export interface BMIPayload {
  weight: number
  height: number
  age: number
  gender: string
}

export const bmiApi = {
  predict: (payload: BMIPayload) =>
    aiApi.post<BMIResult>('/predict/bmi', payload),

  getHistory: () =>
    api.get<{ metrics: BMIHistory[] }>('/metrics'),

  save: (data: BMIPayload & { bmi: number; bmiCategory: string }) =>
    api.post<{ metric: BMIHistory }>('/metrics', data),
}
