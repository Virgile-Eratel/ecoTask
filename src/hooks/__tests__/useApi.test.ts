import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useApiCall, useApiList, useApiMutation, useApiData } from '../useApi'

// Mock du store
const mockSetError = vi.fn()
vi.mock('../../store/useStore', () => ({
  useStore: () => ({
    setError: mockSetError
  })
}))

describe('useApi hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useApiCall', () => {
    it('should handle successful API call', async () => {
      const { result } = renderHook(() => useApiCall<string>())

      const mockApiCall = vi.fn().mockResolvedValue({
        success: true,
        data: 'test data'
      })

      let resultData: string | null = null
      await act(async () => {
        resultData = await result.current.execute(mockApiCall)
      })

      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(null)
      expect(result.current.data).toBe('test data')
      expect(resultData).toBe('test data')
      expect(mockSetError).toHaveBeenCalledWith(null)
    })

    it('should handle API call error', async () => {
      const { result } = renderHook(() => useApiCall<string>())

      const mockApiCall = vi.fn().mockResolvedValue({
        success: false,
        error: { message: 'API Error' }
      })

      await act(async () => {
        await result.current.execute(mockApiCall)
      })

      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe('API Error')
      expect(result.current.data).toBe(null)
      expect(mockSetError).toHaveBeenCalledWith('API Error')
    })

    it('should handle network error', async () => {
      const { result } = renderHook(() => useApiCall<string>())

      const mockApiCall = vi.fn().mockRejectedValue(new Error('Network Error'))

      await act(async () => {
        await result.current.execute(mockApiCall)
      })

      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe('Network Error')
      expect(result.current.data).toBe(null)
    })

    it('should reset state correctly', () => {
      const { result } = renderHook(() => useApiCall<string>())

      act(() => {
        result.current.reset()
      })

      expect(result.current.data).toBe(null)
      expect(result.current.error).toBe(null)
      expect(result.current.loading).toBe(false)
    })
  })

  describe('useApiList', () => {
    it('should fetch items successfully', async () => {
      const { result } = renderHook(() => useApiList<{ id: string; name: string }>())

      const mockApiCall = vi.fn().mockResolvedValue({
        success: true,
        data: {
          items: [{ id: '1', name: 'Item 1' }],
          pagination: { page: 1, limit: 10, total: 1, pages: 1 }
        }
      })

      await act(async () => {
        await result.current.fetchItems(mockApiCall)
      })

      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(null)
      expect(result.current.items).toEqual([{ id: '1', name: 'Item 1' }])
      expect(result.current.pagination.total).toBe(1)
    })

    it('should add item to list', () => {
      const { result } = renderHook(() => useApiList<{ id: string; name: string }>())

      const newItem = { id: '2', name: 'Item 2' }

      act(() => {
        result.current.addItem(newItem)
      })

      expect(result.current.items).toContain(newItem)
    })

    it('should update item in list', () => {
      const { result } = renderHook(() => useApiList<{ id: string; name: string }>())

      const initialItem = { id: '1', name: 'Item 1' }
      const updatedItem = { id: '1', name: 'Updated Item 1' }

      act(() => {
        result.current.addItem(initialItem)
      })

      act(() => {
        result.current.updateItem('1', updatedItem)
      })

      expect(result.current.items[0]).toEqual(updatedItem)
    })

    it('should remove item from list', () => {
      const { result } = renderHook(() => useApiList<{ id: string; name: string }>())

      const item = { id: '1', name: 'Item 1' }

      act(() => {
        result.current.addItem(item)
      })

      act(() => {
        result.current.removeItem('1')
      })

      expect(result.current.items).toHaveLength(0)
    })
  })

  describe('useApiMutation', () => {
    it('should handle successful mutation', async () => {
      const { result } = renderHook(() => useApiMutation<string>())

      const mockApiCall = vi.fn().mockResolvedValue({
        success: true,
        data: 'mutation result'
      })

      const onSuccess = vi.fn()

      let resultData: string | null = null
      await act(async () => {
        resultData = await result.current.mutate(mockApiCall, onSuccess)
      })

      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(null)
      expect(resultData).toBe('mutation result')
      expect(onSuccess).toHaveBeenCalledWith('mutation result')
    })

    it('should handle mutation error', async () => {
      const { result } = renderHook(() => useApiMutation<string>())

      const mockApiCall = vi.fn().mockResolvedValue({
        success: false,
        error: { message: 'Mutation Error' }
      })

      const onError = vi.fn()

      await act(async () => {
        await result.current.mutate(mockApiCall, undefined, onError)
      })

      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe('Mutation Error')
      expect(onError).toHaveBeenCalledWith('Mutation Error')
    })
  })

  describe('useApiData', () => {
    it('should fetch data on mount', async () => {
      const mockApiCall = vi.fn().mockResolvedValue({
        success: true,
        data: 'fetched data'
      })

      const { result } = renderHook(() => useApiData(mockApiCall))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.data).toBe('fetched data')
      expect(result.current.error).toBe(null)
      expect(mockApiCall).toHaveBeenCalledTimes(1)
    })

    it('should handle fetch error on mount', async () => {
      const mockApiCall = vi.fn().mockResolvedValue({
        success: false,
        error: { message: 'Fetch Error' }
      })

      const { result } = renderHook(() => useApiData(mockApiCall))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.data).toBe(null)
      expect(result.current.error).toBe('Fetch Error')
    })

    it('should refetch data when refetch is called', async () => {
      const mockApiCall = vi.fn()
        .mockResolvedValueOnce({
          success: true,
          data: 'initial data'
        })
        .mockResolvedValueOnce({
          success: true,
          data: 'refetched data'
        })

      const { result } = renderHook(() => useApiData(mockApiCall))

      await waitFor(() => {
        expect(result.current.data).toBe('initial data')
      })

      await act(async () => {
        await result.current.refetch()
      })

      expect(result.current.data).toBe('refetched data')
      expect(mockApiCall).toHaveBeenCalledTimes(2)
    })
  })
})
