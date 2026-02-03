import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from '../helper/axios'
import {
  fetchAuditLogs,
  fetchAuditLogById,
  fetchAuditLogsByMemberId,
  fetchAuditLogsByResourceType,
  type AuditLogQueryParams,
} from './auditLog'

// Mock axios
vi.mock('../helper/axios', () => ({
  default: {
    get: vi.fn(),
  },
}))

describe('AuditLog API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchAuditLogs', () => {
    it('should fetch audit logs without params', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [
            {
              id: 1,
              member_id: 1,
              role_id: 1,
              action: 'CREATE',
              resource_type: 'MENU',
              status: 'SUCCESS',
              create_time: '2024-01-01T00:00:00Z',
            },
          ],
        },
      }
      vi.mocked(axios.get).mockResolvedValue(mockResponse)

      const result = await fetchAuditLogs()

      expect(axios.get).toHaveBeenCalledWith('/audit-logs', { params: undefined })
      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(1)
    })

    it('should fetch audit logs with query params', async () => {
      const params: AuditLogQueryParams = {
        member_id: 1,
        action: 'CREATE',
        status: 'SUCCESS',
        limit: 10,
        offset: 0,
      }
      const mockResponse = {
        data: {
          success: true,
          data: [
            {
              id: 1,
              member_id: 1,
              action: 'CREATE',
              status: 'SUCCESS',
            },
          ],
        },
      }
      vi.mocked(axios.get).mockResolvedValue(mockResponse)

      const result = await fetchAuditLogs(params)

      expect(axios.get).toHaveBeenCalledWith('/audit-logs', { params })
      expect(result.success).toBe(true)
    })

    it('should handle fetch audit logs error', async () => {
      const error = new Error('Network error')
      vi.mocked(axios.get).mockRejectedValue(error)

      await expect(fetchAuditLogs()).rejects.toThrow('Network error')
    })
  })

  describe('fetchAuditLogById', () => {
    it('should fetch a single audit log by ID', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            id: 1,
            member_id: 1,
            role_id: 1,
            action: 'CREATE',
            resource_type: 'MENU',
            resource_id: 5,
            status: 'SUCCESS',
            create_time: '2024-01-01T00:00:00Z',
          },
        },
      }
      vi.mocked(axios.get).mockResolvedValue(mockResponse)

      const result = await fetchAuditLogById(1)

      expect(axios.get).toHaveBeenCalledWith('/audit-logs/1')
      expect(result.success).toBe(true)
      expect(result.data.id).toBe(1)
    })
  })

  describe('fetchAuditLogsByMemberId', () => {
    it('should fetch audit logs by member ID with default pagination', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [
            { id: 1, member_id: 1, action: 'CREATE' },
            { id: 2, member_id: 1, action: 'UPDATE' },
          ],
        },
      }
      vi.mocked(axios.get).mockResolvedValue(mockResponse)

      const result = await fetchAuditLogsByMemberId(1)

      expect(axios.get).toHaveBeenCalledWith('/audit-logs/member/1', {
        params: { limit: 50, offset: 0 },
      })
      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(2)
    })

    it('should fetch audit logs by member ID with custom pagination', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [{ id: 3, member_id: 1, action: 'DELETE' }],
        },
      }
      vi.mocked(axios.get).mockResolvedValue(mockResponse)

      const result = await fetchAuditLogsByMemberId(1, 10, 20)

      expect(axios.get).toHaveBeenCalledWith('/audit-logs/member/1', {
        params: { limit: 10, offset: 20 },
      })
      expect(result.success).toBe(true)
    })
  })

  describe('fetchAuditLogsByResourceType', () => {
    it('should fetch audit logs by resource type with default pagination', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [
            { id: 1, resource_type: 'MENU', action: 'CREATE' },
            { id: 2, resource_type: 'MENU', action: 'UPDATE' },
          ],
        },
      }
      vi.mocked(axios.get).mockResolvedValue(mockResponse)

      const result = await fetchAuditLogsByResourceType('MENU')

      expect(axios.get).toHaveBeenCalledWith('/audit-logs/resource/MENU', {
        params: { limit: 50, offset: 0 },
      })
      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(2)
    })

    it('should fetch audit logs by resource type with custom pagination', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [{ id: 3, resource_type: 'ROLE', action: 'DELETE' }],
        },
      }
      vi.mocked(axios.get).mockResolvedValue(mockResponse)

      const result = await fetchAuditLogsByResourceType('ROLE', 25, 50)

      expect(axios.get).toHaveBeenCalledWith('/audit-logs/resource/ROLE', {
        params: { limit: 25, offset: 50 },
      })
      expect(result.success).toBe(true)
    })
  })
})
