package middleware

import (
	"ems_backend/internal/application/dto"
	"ems_backend/internal/domain/auth/services"
	memberRoleDomainService "ems_backend/internal/domain/member_role/services"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware(authService *services.AuthService, memberRoleDomainService *memberRoleDomainService.MemberRoleService) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"error":   "authorization header required",
			})
			c.Abort()
			return
		}

		// 檢查 Bearer token
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"error":   "invalid authorization header format",
			})
			c.Abort()
			return
		}

		token := parts[1]
		claims, err := authService.ValidateToken(token)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"error":   "invalid token",
			})
			c.Abort()
			return
		}

		// 從 claims 中獲取 member_id
		memberIDStr := claims.MemberID
		if memberIDStr == "" {
			c.JSON(http.StatusUnauthorized, dto.APIResponse{Success: false, Error: "invalid token claims"})
			c.Abort()
			return
		}

		memberIDUint64, err := strconv.ParseUint(memberIDStr, 10, 64)
		if err != nil {
			c.JSON(http.StatusInternalServerError, dto.APIResponse{Success: false, Error: "Invalid member ID format"})
			c.Abort()
			return
		}

		fmt.Println("=== Auth Middleware ===")
		fmt.Printf("Member ID: %d\n", memberIDUint64)

		// 將會員信息存儲到上下文中（轉換為 uint 以保持一致性）
		c.Set("member_id", uint(memberIDUint64))

		memberRoles, err := memberRoleDomainService.GetByMemberID(uint(memberIDUint64))
		if err != nil {
			c.JSON(http.StatusUnauthorized, dto.APIResponse{Success: false, Error: "failed to get member roles"})
			c.Abort()
			return
		}

		// 打印會員角色
		if rolesJSON, err := json.MarshalIndent(memberRoles, "", "  "); err == nil {
			fmt.Println("Member Roles:")
			fmt.Println(string(rolesJSON))
		}
		// 從 header 中獲取 roleid
		roleIDHeader := c.GetHeader("X-Role-ID")
		if roleIDHeader != "" {
			fmt.Printf("Requested Role ID: %s\n", roleIDHeader)

			roleID, err := strconv.ParseUint(roleIDHeader, 10, 64)
			if err != nil {
				c.JSON(http.StatusBadRequest, dto.APIResponse{Success: false, Error: "invalid role ID format"})
				c.Abort()
				return
			}

			// 檢查 roleid 是否在用戶的角色列表中
			hasRole := false
			for _, memberRole := range memberRoles {
				if memberRole.RoleID == uint(roleID) {
					hasRole = true
					fmt.Printf("✓ Role ID %d found - Access Granted\n", roleID)
					break
				}
			}

			if !hasRole {
				fmt.Printf("✗ Role ID %d NOT found - Access Denied\n", roleID)
				c.JSON(http.StatusForbidden, dto.APIResponse{Success: false, Error: "role not authorized"})
				c.Abort()
				return
			}

			// 將當前角色 ID 存儲到上下文中
			c.Set("current_role_id", uint(roleID))
		}

		fmt.Println("======================")

		c.Set("member_roles", memberRoles)
		c.Next()
	}
}
