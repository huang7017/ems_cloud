package router

import (
	"ems_backend/internal/domain/auth/services"
	memberRoleDomainService "ems_backend/internal/domain/member_role/services"
	"ems_backend/internal/interface/api/handlers"
	"ems_backend/internal/interface/api/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine, authHandler *handlers.AuthHandler, menuHandler *handlers.MenuHandler, dashboardHandler *handlers.DashboardHandler, authService *services.AuthService, memberRoleDomainService *memberRoleDomainService.MemberRoleService) {
	authGroup := router.Group("/auth")
	{
		authGroup.POST("/login", authHandler.Login)
		authGroup.POST("/refresh", authHandler.RefreshToken)
		authGroup.POST("/logout", authHandler.Logout)
	}
	menuGroup := router.Group("/menu", middleware.AuthMiddleware(authService, memberRoleDomainService))
	{
		menuGroup.GET("", menuHandler.GetAll)  // 匹配 /menu
		menuGroup.GET("/", menuHandler.GetAll) // 匹配 /menu/
		menuGroup.GET("/sidebar", menuHandler.GetByRoleId)
		menuGroup.POST("", menuHandler.Create)
		menuGroup.PUT("/:id", menuHandler.Update)
		menuGroup.DELETE("/:id", menuHandler.Delete)
	}

	// Dashboard API - 需要認證
	dashboardGroup := router.Group("/dashboard", middleware.AuthMiddleware(authService, memberRoleDomainService))
	{
		dashboardGroup.GET("/companies", dashboardHandler.GetCompanyList)        // 獲取公司列表（用於下拉選單）
		dashboardGroup.GET("/company/areas", dashboardHandler.GetAreaList)       // 獲取指定公司的區域列表（用於下拉選單）
		dashboardGroup.GET("/summary", dashboardHandler.GetDashboardSummary)     // 獲取總覽
		dashboardGroup.GET("/meters", dashboardHandler.GetMeterData)             // 獲取電表數據
		dashboardGroup.GET("/temperatures", dashboardHandler.GetTemperatureData) // 獲取溫度數據
		dashboardGroup.GET("/areas", dashboardHandler.GetAreaOverview)           // 獲取區域完整數據
	}
}
