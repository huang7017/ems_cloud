import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from '../helper/axios'
import {
  fetchRoles,
  createRole,
  updateRole,
  deleteRole,
  fetchRolePowers,
  assignPowers,
  removePowers,
  fetchRoleMembers,
  assignMembers,
  removeMembers,
  type RoleRequest,
  type AssignPowersRequest,
  type AssignMembersRequest,
} from './role'

// Mock axios
vi.mock('../helper/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('Role API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchRoles', () => {
    it('should fetch all roles successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [
            { id: 1, title: '管理員', description: '系統管理員', sort: 1, is_enable: true },
            { id: 2, title: '用戶', description: '普通用戶', sort: 2, is_enable: true },
          ],
        },
      }
      vi.mocked(axios.get).mockResolvedValue(mockResponse)

      const result = await fetchRoles()

      expect(axios.get).toHaveBeenCalledWith('/roles')
      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(2)
    })

    it('should handle fetch roles error', async () => {
      const error = new Error('Network error')
      vi.mocked(axios.get).mockRejectedValue(error)

      await expect(fetchRoles()).rejects.toThrow('Network error')
    })
  })

  describe('createRole', () => {
    it('should create a new role successfully', async () => {
      const newRole: RoleRequest = {
        title: '新角色',
        description: '新角色描述',
        sort: 3,
        is_enable: true,
      }
      const mockResponse = {
        data: {
          success: true,
          data: { id: 3, ...newRole },
        },
      }
      vi.mocked(axios.post).mockResolvedValue(mockResponse)

      const result = await createRole(newRole)

      expect(axios.post).toHaveBeenCalledWith('/roles', newRole)
      expect(result.success).toBe(true)
      expect(result.data.id).toBe(3)
    })
  })

  describe('updateRole', () => {
    it('should update an existing role successfully', async () => {
      const updatedRole: RoleRequest = {
        id: 1,
        title: '更新的角色',
        description: '更新的描述',
        sort: 1,
        is_enable: true,
      }
      const mockResponse = {
        data: {
          success: true,
          data: updatedRole,
        },
      }
      vi.mocked(axios.put).mockResolvedValue(mockResponse)

      const result = await updateRole(updatedRole)

      expect(axios.put).toHaveBeenCalledWith('/roles/1', updatedRole)
      expect(result.success).toBe(true)
    })
  })

  describe('deleteRole', () => {
    it('should delete a role successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: '角色已刪除',
        },
      }
      vi.mocked(axios.delete).mockResolvedValue(mockResponse)

      const result = await deleteRole(1)

      expect(axios.delete).toHaveBeenCalledWith('/roles/1')
      expect(result.success).toBe(true)
    })
  })

  describe('fetchRolePowers', () => {
    it('should fetch role powers successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [
            { id: 1, title: '創建菜單', code: 'menu:create' },
            { id: 2, title: '刪除菜單', code: 'menu:delete' },
          ],
        },
      }
      vi.mocked(axios.get).mockResolvedValue(mockResponse)

      const result = await fetchRolePowers(1)

      expect(axios.get).toHaveBeenCalledWith('/roles/1/powers')
      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(2)
    })
  })

  describe('assignPowers', () => {
    it('should assign powers to role successfully', async () => {
      const request: AssignPowersRequest = { power_ids: [1, 2, 3] }
      const mockResponse = {
        data: {
          success: true,
          message: '權限分配成功',
        },
      }
      vi.mocked(axios.post).mockResolvedValue(mockResponse)

      const result = await assignPowers(1, request)

      expect(axios.post).toHaveBeenCalledWith('/roles/1/powers', request)
      expect(result.success).toBe(true)
    })
  })

  describe('removePowers', () => {
    it('should remove powers from role successfully', async () => {
      const request: AssignPowersRequest = { power_ids: [1, 2] }
      const mockResponse = {
        data: {
          success: true,
          message: '權限已移除',
        },
      }
      vi.mocked(axios.delete).mockResolvedValue(mockResponse)

      const result = await removePowers(1, request)

      expect(axios.delete).toHaveBeenCalledWith('/roles/1/powers', { data: request })
      expect(result.success).toBe(true)
    })
  })

  describe('fetchRoleMembers', () => {
    it('should fetch role members successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [1, 2, 3],
        },
      }
      vi.mocked(axios.get).mockResolvedValue(mockResponse)

      const result = await fetchRoleMembers(1)

      expect(axios.get).toHaveBeenCalledWith('/roles/1/members')
      expect(result.success).toBe(true)
      expect(result.data).toEqual([1, 2, 3])
    })
  })

  describe('assignMembers', () => {
    it('should assign members to role successfully', async () => {
      const request: AssignMembersRequest = { member_ids: [1, 2, 3] }
      const mockResponse = {
        data: {
          success: true,
          message: '成員分配成功',
        },
      }
      vi.mocked(axios.post).mockResolvedValue(mockResponse)

      const result = await assignMembers(1, request)

      expect(axios.post).toHaveBeenCalledWith('/roles/1/members', request)
      expect(result.success).toBe(true)
    })
  })

  describe('removeMembers', () => {
    it('should remove members from role successfully', async () => {
      const request: AssignMembersRequest = { member_ids: [1, 2] }
      const mockResponse = {
        data: {
          success: true,
          message: '成員已移除',
        },
      }
      vi.mocked(axios.delete).mockResolvedValue(mockResponse)

      const result = await removeMembers(1, request)

      expect(axios.delete).toHaveBeenCalledWith('/roles/1/members', { data: request })
      expect(result.success).toBe(true)
    })
  })
})
