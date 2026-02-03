package middleware

import (
	"ems_backend/internal/application/dto"
	"ems_backend/internal/domain/power/services"
	"net/http"

	"github.com/gin-gonic/gin"
)

// PermissionMiddleware 權限檢查中間件
type PermissionMiddleware struct {
	powerService *services.PowerService
}

// NewPermissionMiddleware 創建權限中間件
func NewPermissionMiddleware(powerService *services.PowerService) *PermissionMiddleware {
	return &PermissionMiddleware{
		powerService: powerService,
	}
}

// RequirePermission 檢查單一權限
// 使用示例: router.POST("/menu", permissionMw.RequirePermission("menu:create"), handler.CreateMenu)
func (pm *PermissionMiddleware) RequirePermission(powerCode string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 從上下文獲取當前角色ID
		currentRoleID, exists := c.Get("current_role_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, dto.APIResponse{
				Success: false,
				Error:   "no role selected",
			})
			c.Abort()
			return
		}

		roleID := currentRoleID.(uint)

		// 檢查權限
		hasPermission, err := pm.powerService.CheckPermission(roleID, powerCode)
		if err != nil {
			c.JSON(http.StatusInternalServerError, dto.APIResponse{
				Success: false,
				Error:   "failed to check permission",
			})
			c.Abort()
			return
		}

		if !hasPermission {
			c.JSON(http.StatusForbidden, dto.APIResponse{
				Success: false,
				Error:   "insufficient permissions",
				Data: gin.H{
					"required_permission": powerCode,
				},
			})
			c.Abort()
			return
		}

		// 權限檢查通過，繼續處理請求
		c.Next()
	}
}

// RequireAnyPermission 檢查多個權限（任意一個滿足即可）
// 使用示例: router.GET("/dashboard", permissionMw.RequireAnyPermission([]string{"dashboard:view", "admin:all"}), handler.GetDashboard)
func (pm *PermissionMiddleware) RequireAnyPermission(powerCodes []string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 從上下文獲取當前角色ID
		currentRoleID, exists := c.Get("current_role_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, dto.APIResponse{
				Success: false,
				Error:   "no role selected",
			})
			c.Abort()
			return
		}

		roleID := currentRoleID.(uint)

		// 檢查任意一個權限
		for _, code := range powerCodes {
			hasPermission, err := pm.powerService.CheckPermission(roleID, code)
			if err != nil {
				continue // 跳過錯誤，繼續檢查下一個權限
			}

			if hasPermission {
				// 找到匹配的權限，允許訪問
				c.Next()
				return
			}
		}

		// 沒有任何匹配的權限
		c.JSON(http.StatusForbidden, dto.APIResponse{
			Success: false,
			Error:   "insufficient permissions",
			Data: gin.H{
				"required_permissions": powerCodes,
			},
		})
		c.Abort()
	}
}

// RequireAllPermissions 檢查多個權限（全部滿足才允許）
// 使用示例: router.DELETE("/critical-data", permissionMw.RequireAllPermissions([]string{"data:delete", "admin:approve"}), handler.DeleteCritical)
func (pm *PermissionMiddleware) RequireAllPermissions(powerCodes []string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 從上下文獲取當前角色ID
		currentRoleID, exists := c.Get("current_role_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, dto.APIResponse{
				Success: false,
				Error:   "no role selected",
			})
			c.Abort()
			return
		}

		roleID := currentRoleID.(uint)

		// 檢查所有權限
		missingPermissions := []string{}
		for _, code := range powerCodes {
			hasPermission, err := pm.powerService.CheckPermission(roleID, code)
			if err != nil || !hasPermission {
				missingPermissions = append(missingPermissions, code)
			}
		}

		if len(missingPermissions) > 0 {
			c.JSON(http.StatusForbidden, dto.APIResponse{
				Success: false,
				Error:   "insufficient permissions",
				Data: gin.H{
					"missing_permissions": missingPermissions,
				},
			})
			c.Abort()
			return
		}

		// 所有權限檢查通過
		c.Next()
	}
}
