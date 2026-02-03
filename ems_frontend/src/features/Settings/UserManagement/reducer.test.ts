import { describe, it, expect } from 'vitest'
import { reducer, actions } from './reducer'
import type { UserManagementState, User, Role, Permission } from './types'

describe('UserManagement Reducer', () => {
  const initialState: UserManagementState = {
    users: [],
    roles: [],
    loading: false,
    error: null,
    activeTab: 'users',
    searchTerm: '',
  }

  describe('User Actions', () => {
    it('should handle fetchUsers', () => {
      const state = reducer(initialState, actions.fetchUsers())
      expect(state.loading).toBe(true)
      expect(state.error).toBeNull()
    })

    it('should handle fetchUsersSuccess', () => {
      const users: User[] = [
        {
          id: '1',
          name: '張三',
          email: 'zhangsan@example.com',
          role: '管理員',
          roles: [{ id: 1, name: '管理員' }],
          status: 'enabled',
          lastLogin: '2024-01-01',
          avatar: '張三',
        },
      ]
      const state = reducer(
        { ...initialState, loading: true },
        actions.fetchUsersSuccess(users)
      )
      expect(state.loading).toBe(false)
      expect(state.users).toEqual(users)
    })

    it('should handle fetchUsersFailure', () => {
      const errorMessage = '載入用戶失敗'
      const state = reducer(
        { ...initialState, loading: true },
        actions.fetchUsersFailure(errorMessage)
      )
      expect(state.loading).toBe(false)
      expect(state.error).toBe(errorMessage)
    })

    it('should handle createUser', () => {
      const newUser = {
        name: '李四',
        email: 'lisi@example.com',
        role: '用戶',
        roles: [],
        status: 'enabled' as const,
      }
      const state = reducer(initialState, actions.createUser(newUser))
      expect(state.loading).toBe(true)
      expect(state.error).toBeNull()
    })

    it('should handle createUserSuccess', () => {
      const newUser: User = {
        id: '2',
        name: '李四',
        email: 'lisi@example.com',
        role: '用戶',
        roles: [],
        status: 'enabled',
        lastLogin: '',
        avatar: '李四',
      }
      const state = reducer(
        { ...initialState, loading: true },
        actions.createUserSuccess(newUser)
      )
      expect(state.loading).toBe(false)
      expect(state.users).toContainEqual(newUser)
    })

    it('should handle updateUser', () => {
      const existingUser: User = {
        id: '1',
        name: '張三',
        email: 'zhangsan@example.com',
        role: '管理員',
        roles: [],
        status: 'enabled',
        lastLogin: '',
        avatar: '張三',
      }
      const state = reducer(initialState, actions.updateUser(existingUser))
      expect(state.loading).toBe(true)
      expect(state.error).toBeNull()
    })

    it('should handle updateUserSuccess', () => {
      const existingUser: User = {
        id: '1',
        name: '張三',
        email: 'zhangsan@example.com',
        role: '管理員',
        roles: [],
        status: 'enabled',
        lastLogin: '',
        avatar: '張三',
      }
      const updatedUser: User = {
        ...existingUser,
        name: '張三更新',
      }
      const stateWithUser = { ...initialState, users: [existingUser], loading: true }
      const state = reducer(stateWithUser, actions.updateUserSuccess(updatedUser))
      expect(state.loading).toBe(false)
      expect(state.users[0].name).toBe('張三更新')
    })

    it('should handle deleteUser', () => {
      const state = reducer(initialState, actions.deleteUser('1'))
      expect(state.loading).toBe(true)
      expect(state.error).toBeNull()
    })

    it('should handle deleteUserSuccess', () => {
      const existingUser: User = {
        id: '1',
        name: '張三',
        email: 'zhangsan@example.com',
        role: '管理員',
        roles: [],
        status: 'enabled',
        lastLogin: '',
        avatar: '張三',
      }
      const stateWithUser = { ...initialState, users: [existingUser], loading: true }
      const state = reducer(stateWithUser, actions.deleteUserSuccess('1'))
      expect(state.loading).toBe(false)
      expect(state.users).toHaveLength(0)
    })
  })

  describe('Role Actions', () => {
    it('should handle fetchRoles', () => {
      const state = reducer(initialState, actions.fetchRoles())
      expect(state.loading).toBe(true)
      expect(state.error).toBeNull()
    })

    it('should handle fetchRolesSuccess', () => {
      const roles: Role[] = [
        { id: 1, name: '管理員', permissions: [] },
        { id: 2, name: '用戶', permissions: [] },
      ]
      const state = reducer(
        { ...initialState, loading: true },
        actions.fetchRolesSuccess(roles)
      )
      expect(state.loading).toBe(false)
      expect(state.roles).toEqual(roles)
    })

    it('should handle fetchRolesFailure', () => {
      const errorMessage = '載入角色失敗'
      const state = reducer(
        { ...initialState, loading: true },
        actions.fetchRolesFailure(errorMessage)
      )
      expect(state.loading).toBe(false)
      expect(state.error).toBe(errorMessage)
    })

    it('should handle createRole', () => {
      const newRole = { name: '新角色', permissions: [] }
      const state = reducer(initialState, actions.createRole(newRole))
      expect(state.loading).toBe(true)
      expect(state.error).toBeNull()
    })

    it('should handle createRoleSuccess', () => {
      const newRole: Role = { id: 3, name: '新角色', permissions: [] }
      const state = reducer(
        { ...initialState, loading: true },
        actions.createRoleSuccess(newRole)
      )
      expect(state.loading).toBe(false)
      expect(state.roles).toContainEqual(newRole)
    })

    it('should handle updateRole', () => {
      const existingRole: Role = { id: 1, name: '管理員', permissions: [] }
      const state = reducer(initialState, actions.updateRole(existingRole))
      expect(state.loading).toBe(true)
      expect(state.error).toBeNull()
    })

    it('should handle updateRoleSuccess', () => {
      const existingRole: Role = { id: 1, name: '管理員', permissions: [] }
      const updatedRole: Role = { ...existingRole, name: '超級管理員' }
      const stateWithRole = { ...initialState, roles: [existingRole], loading: true }
      const state = reducer(stateWithRole, actions.updateRoleSuccess(updatedRole))
      expect(state.loading).toBe(false)
      expect(state.roles[0].name).toBe('超級管理員')
    })

    it('should handle deleteRole', () => {
      const state = reducer(initialState, actions.deleteRole(1))
      expect(state.loading).toBe(true)
      expect(state.error).toBeNull()
    })

    it('should handle deleteRoleSuccess', () => {
      const existingRole: Role = { id: 1, name: '管理員', permissions: [] }
      const stateWithRole = { ...initialState, roles: [existingRole], loading: true }
      const state = reducer(stateWithRole, actions.deleteRoleSuccess(1))
      expect(state.loading).toBe(false)
      expect(state.roles).toHaveLength(0)
    })
  })

  describe('UI Actions', () => {
    it('should handle setActiveTab', () => {
      const state = reducer(initialState, actions.setActiveTab('roles'))
      expect(state.activeTab).toBe('roles')
    })

    it('should handle setSearchTerm', () => {
      const state = reducer(initialState, actions.setSearchTerm('test'))
      expect(state.searchTerm).toBe('test')
    })

    it('should handle setLoading', () => {
      const state = reducer(initialState, actions.setLoading(true))
      expect(state.loading).toBe(true)
    })

    it('should handle setError', () => {
      const state = reducer(initialState, actions.setError('測試錯誤'))
      expect(state.error).toBe('測試錯誤')
    })
  })

  describe('Permission Actions', () => {
    it('should handle updatePermission - check permission', () => {
      const permission: Permission = {
        id: 'perm1',
        category: '菜單',
        name: '創建菜單',
        description: '允許創建新菜單',
        checked: false,
      }
      const role: Role = { id: 1, name: '管理員', permissions: [permission] }
      const stateWithRole = { ...initialState, roles: [role] }

      const state = reducer(
        stateWithRole,
        actions.updatePermission({ roleId: 1, permissionId: 'perm1', checked: true })
      )

      expect(state.roles[0].permissions[0].checked).toBe(true)
    })

    it('should handle updatePermission - uncheck permission', () => {
      const permission: Permission = {
        id: 'perm1',
        category: '菜單',
        name: '創建菜單',
        description: '允許創建新菜單',
        checked: true,
      }
      const role: Role = { id: 1, name: '管理員', permissions: [permission] }
      const stateWithRole = { ...initialState, roles: [role] }

      const state = reducer(
        stateWithRole,
        actions.updatePermission({ roleId: 1, permissionId: 'perm1', checked: false })
      )

      expect(state.roles[0].permissions[0].checked).toBe(false)
    })

    it('should not affect other roles when updating permission', () => {
      const permission1: Permission = {
        id: 'perm1',
        category: '菜單',
        name: '創建菜單',
        description: '允許創建新菜單',
        checked: false,
      }
      const permission2: Permission = {
        id: 'perm1',
        category: '菜單',
        name: '創建菜單',
        description: '允許創建新菜單',
        checked: false,
      }
      const role1: Role = { id: 1, name: '管理員', permissions: [permission1] }
      const role2: Role = { id: 2, name: '用戶', permissions: [permission2] }
      const stateWithRoles = { ...initialState, roles: [role1, role2] }

      const state = reducer(
        stateWithRoles,
        actions.updatePermission({ roleId: 1, permissionId: 'perm1', checked: true })
      )

      expect(state.roles[0].permissions[0].checked).toBe(true)
      expect(state.roles[1].permissions[0].checked).toBe(false)
    })
  })
})
