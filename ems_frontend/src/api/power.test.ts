import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from '../helper/axios'
import {
  fetchPowers,
  createPower,
  updatePower,
  deletePower,
  fetchPowersByMenuId,
  fetchPowersByRoleId,
  type PowerRequest,
} from './power'

// Mock axios
vi.mock('../helper/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('Power API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchPowers', () => {
    it('should fetch all powers successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [
            { id: 1, menu_id: 1, title: '創建菜單', code: 'menu:create', description: '允許創建菜單', sort: 1, is_enable: true },
            { id: 2, menu_id: 1, title: '刪除菜單', code: 'menu:delete', description: '允許刪除菜單', sort: 2, is_enable: true },
          ],
        },
      }
      vi.mocked(axios.get).mockResolvedValue(mockResponse)

      const result = await fetchPowers()

      expect(axios.get).toHaveBeenCalledWith('/powers')
      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(2)
    })

    it('should handle fetch powers error', async () => {
      const error = new Error('Network error')
      vi.mocked(axios.get).mockRejectedValue(error)

      await expect(fetchPowers()).rejects.toThrow('Network error')
    })
  })

  describe('createPower', () => {
    it('should create a new power successfully', async () => {
      const newPower: PowerRequest = {
        menu_id: 1,
        title: '新權限',
        code: 'menu:new',
        description: '新權限描述',
        sort: 3,
        is_enable: true,
      }
      const mockResponse = {
        data: {
          success: true,
          data: { id: 3, ...newPower },
        },
      }
      vi.mocked(axios.post).mockResolvedValue(mockResponse)

      const result = await createPower(newPower)

      expect(axios.post).toHaveBeenCalledWith('/powers', newPower)
      expect(result.success).toBe(true)
      expect(result.data.id).toBe(3)
    })
  })

  describe('updatePower', () => {
    it('should update an existing power successfully', async () => {
      const updatedPower: PowerRequest = {
        id: 1,
        menu_id: 1,
        title: '更新的權限',
        code: 'menu:updated',
        description: '更新的描述',
        sort: 1,
        is_enable: true,
      }
      const mockResponse = {
        data: {
          success: true,
          data: updatedPower,
        },
      }
      vi.mocked(axios.put).mockResolvedValue(mockResponse)

      const result = await updatePower(updatedPower)

      expect(axios.put).toHaveBeenCalledWith('/powers/1', updatedPower)
      expect(result.success).toBe(true)
    })
  })

  describe('deletePower', () => {
    it('should delete a power successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: '權限已刪除',
        },
      }
      vi.mocked(axios.delete).mockResolvedValue(mockResponse)

      const result = await deletePower(1)

      expect(axios.delete).toHaveBeenCalledWith('/powers/1')
      expect(result.success).toBe(true)
    })
  })

  describe('fetchPowersByMenuId', () => {
    it('should fetch powers by menu ID successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [
            { id: 1, menu_id: 1, title: '創建菜單', code: 'menu:create' },
            { id: 2, menu_id: 1, title: '刪除菜單', code: 'menu:delete' },
          ],
        },
      }
      vi.mocked(axios.get).mockResolvedValue(mockResponse)

      const result = await fetchPowersByMenuId(1)

      expect(axios.get).toHaveBeenCalledWith('/powers/menu?menu_id=1')
      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(2)
    })
  })

  describe('fetchPowersByRoleId', () => {
    it('should fetch powers by role ID successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [
            { id: 1, title: '創建菜單', code: 'menu:create' },
            { id: 3, title: '創建用戶', code: 'user:create' },
          ],
        },
      }
      vi.mocked(axios.get).mockResolvedValue(mockResponse)

      const result = await fetchPowersByRoleId(1)

      expect(axios.get).toHaveBeenCalledWith('/powers/role?role_id=1')
      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(2)
    })
  })
})
