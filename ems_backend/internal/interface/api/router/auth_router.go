package router

import (
	"ems_backend/internal/domain/auth/services"
	"ems_backend/internal/interface/api/handlers"
	"ems_backend/internal/interface/api/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine, authHandler *handlers.AuthHandler, menuHandler *handlers.MenuHandler, authService *services.AuthService) {
	authGroup := router.Group("/auth")
	{
		authGroup.POST("/login", authHandler.Login)
		authGroup.POST("/refresh", authHandler.RefreshToken)
		authGroup.POST("/logout", authHandler.Logout)
	}
	menuGroup := router.Group("/menu", middleware.AuthMiddleware(authService))
	{
		menuGroup.GET("/", menuHandler.GetAll)
		menuGroup.POST("/", menuHandler.Create)
		menuGroup.PUT("/:id", menuHandler.Update)
		menuGroup.DELETE("/:id", menuHandler.Delete)
	}
}
