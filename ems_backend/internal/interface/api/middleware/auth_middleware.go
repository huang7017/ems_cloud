package middleware

import (
	"ems_backend/internal/domain/auth/services"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware(authService *services.AuthService) gin.HandlerFunc {
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

		// 將會員信息存儲到上下文中
		c.Set("member_id", claims.MemberID)

		c.Next()
	}
}
