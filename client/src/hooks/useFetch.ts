import { useState, useCallback } from 'react'

interface FetchState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useFetch<T>() {
  const [state, setState] = useState<FetchState<T>>({ data: null, loading: false, error: null })

  const execute = useCallback(async (fn: () => Promise<{ data: T }>) => {
    setState(s => ({ ...s, loading: true, error: null }))
    try {
      const res = await fn()
      setState({ data: res.data, loading: false, error: null })
      return res.data
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Something went wrong'
      setState({ data: null, loading: false, error: msg })
      throw err
    }
  }, [])

  const reset = useCallback(() => setState({ data: null, loading: false, error: null }), [])

  return { ...state, execute, reset }
}
