import { describe, it, expect } from 'vitest'
import {
  usersSelector,
  filteredUsersSelector,
  rolesSelector,
  loadingSelector,
  errorSelector,
  activeTabSelector,
  searchTermSelector,
} from './selector'
import type { IState } from '../../../store/reducers'
import type { User, Role, UserManagementState } from './types'

// Helper to create a mock state
const createMockState = (userManagement: Partial<UserManagementState>): IState => ({
  userManagement: {
    users: [],
    roles: [],
    loading: false,
    error: null,
    activeTab: 'users',
    searchTerm: '',
    ...userManagement,
  },
  // Add other required state slices with defaults
} as IState)

describe('UserManagement Selectors', () => {
  describe('usersSelector', () => {
    it('should return all users', () => {
      const users: User[] = [
        {
          id: '1',
          name: '張三',
          email: 'zhangsan@example.com',
          role: '管理員',
          roles: [],
          status: 'enabled',
          lastLogin: '',
          avatar: '張三',
        },
        {
          id: '2',
          name: '李四',
          email: 'lisi@example.com',
          role: '用戶',
          roles: [],
          status: 'enabled',
          lastLogin: '',
          avatar: '李四',
        },
      ]
      const state = createMockState({ users })

      const result = usersSelector(state)

      expect(result).toEqual(users)
      expect(result).toHaveLength(2)
    })

    it('should return empty array when no users', () => {
      const state = createMockState({ users: [] })

      const result = usersSelector(state)

      expect(result).toEqual([])
    })
  })

  describe('filteredUsersSelector', () => {
    const users: User[] = [
      {
        id: '1',
        name: '張三',
        email: 'zhangsan@example.com',
        role: '管理員',
        roles: [],
        status: 'enabled',
        lastLogin: '',
        avatar: '張三',
      },
      {
        id: '2',
        name: '李四',
        email: 'lisi@example.com',
        role: '用戶',
        roles: [],
        status: 'enabled',
        lastLogin: '',
        avatar: '李四',
      },
      {
        id: '3',
        name: '王五',
        email: 'wangwu@test.com',
        role: '管理員',
        roles: [],
        status: 'disabled',
        lastLogin: '',
        avatar: '王五',
      },
    ]

    it('should return all users when no search term', () => {
      const state = createMockState({ users, searchTerm: '' })

      const result = filteredUsersSelector(state)

      expect(result).toEqual(users)
      expect(result).toHaveLength(3)
    })

    it('should filter users by name', () => {
      const state = createMockState({ users, searchTerm: '張三' })

      const result = filteredUsersSelector(state)

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('張三')
    })

    it('should filter users by email', () => {
      const state = createMockState({ users, searchTerm: 'example.com' })

      const result = filteredUsersSelector(state)

      expect(result).toHaveLength(2)
    })

    it('should filter users by role', () => {
      const state = createMockState({ users, searchTerm: '管理員' })

      const result = filteredUsersSelector(state)

      expect(result).toHaveLength(2)
    })

    it('should be case-insensitive', () => {
      const state = createMockState({ users, searchTerm: 'ZHANGSAN' })

      const result = filteredUsersSelector(state)

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('張三')
    })

    it('should return empty array when no matches', () => {
      const state = createMockState({ users, searchTerm: '不存在的用戶' })

      const result = filteredUsersSelector(state)

      expect(result).toHaveLength(0)
    })
  })

  describe('rolesSelector', () => {
    it('should return all roles', () => {
      const roles: Role[] = [
        { id: 1, name: '管理員', permissions: [] },
        { id: 2, name: '用戶', permissions: [] },
      ]
      const state = createMockState({ roles })

      const result = rolesSelector(state)

      expect(result).toEqual(roles)
      expect(result).toHaveLength(2)
    })

    it('should return empty array when no roles', () => {
      const state = createMockState({ roles: [] })

      const result = rolesSelector(state)

      expect(result).toEqual([])
    })
  })

  describe('loadingSelector', () => {
    it('should return true when loading', () => {
      const state = createMockState({ loading: true })

      const result = loadingSelector(state)

      expect(result).toBe(true)
    })

    it('should return false when not loading', () => {
      const state = createMockState({ loading: false })

      const result = loadingSelector(state)

      expect(result).toBe(false)
    })
  })

  describe('errorSelector', () => {
    it('should return error message when error exists', () => {
      const state = createMockState({ error: '發生錯誤' })

      const result = errorSelector(state)

      expect(result).toBe('發生錯誤')
    })

    it('should return null when no error', () => {
      const state = createMockState({ error: null })

      const result = errorSelector(state)

      expect(result).toBeNull()
    })
  })

  describe('activeTabSelector', () => {
    it('should return users tab', () => {
      const state = createMockState({ activeTab: 'users' })

      const result = activeTabSelector(state)

      expect(result).toBe('users')
    })

    it('should return roles tab', () => {
      const state = createMockState({ activeTab: 'roles' })

      const result = activeTabSelector(state)

      expect(result).toBe('roles')
    })

    it('should return access tab', () => {
      const state = createMockState({ activeTab: 'access' })

      const result = activeTabSelector(state)

      expect(result).toBe('access')
    })
  })

  describe('searchTermSelector', () => {
    it('should return search term', () => {
      const state = createMockState({ searchTerm: 'test search' })

      const result = searchTermSelector(state)

      expect(result).toBe('test search')
    })

    it('should return empty string when no search term', () => {
      const state = createMockState({ searchTerm: '' })

      const result = searchTermSelector(state)

      expect(result).toBe('')
    })
  })
})
