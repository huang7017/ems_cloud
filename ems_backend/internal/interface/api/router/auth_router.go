package router

import (
	"ems_backend/internal/domain/auth/services"
	memberRoleDomainService "ems_backend/internal/domain/member_role/services"
	"ems_backend/internal/interface/api/handlers"
	"ems_backend/internal/interface/api/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(
	router *gin.Engine,
	authHandler *handlers.AuthHandler,
	menuHandler *handlers.MenuHandler,
	dashboardHandler *handlers.DashboardHandler,
	roleHandler *handlers.RoleHandler,
	powerHandler *handlers.PowerHandler,
	auditLogHandler *handlers.AuditLogHandler,
	memberHandler *handlers.MemberHandler,
	deviceHandler *handlers.DeviceHandler,
	companyHandler *handlers.CompanyHandler,
	scheduleHandler *handlers.ScheduleHandler,
	sseHandler *handlers.SSEHandler,
	wsHandler *handlers.WebSocketHandler,
	authService *services.AuthService,
	memberRoleDomainService *memberRoleDomainService.MemberRoleService,
	permissionMw *middleware.PermissionMiddleware,
	auditMw *middleware.AuditMiddleware,
) {
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
		menuGroup.POST("", permissionMw.RequirePermission("menu:create"), auditMw.AuditLog("CREATE", "MENU"), menuHandler.Create)
		menuGroup.PUT("/:id", permissionMw.RequirePermission("menu:update"), auditMw.AuditLogWithResourceID("UPDATE", "MENU", "id"), menuHandler.Update)
		menuGroup.DELETE("/:id", permissionMw.RequirePermission("menu:delete"), auditMw.AuditLogWithResourceID("DELETE", "MENU", "id"), menuHandler.Delete)
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

	// Role API - 角色管理
	roleGroup := router.Group("/roles", middleware.AuthMiddleware(authService, memberRoleDomainService))
	{
		roleGroup.GET("", roleHandler.GetAll)                     // 獲取所有角色
		roleGroup.GET("/:id", roleHandler.GetByID)                // 獲取單個角色
		roleGroup.POST("", permissionMw.RequirePermission("role:create"), auditMw.AuditLog("CREATE", "ROLE"), roleHandler.Create) // 創建角色
		roleGroup.PUT("/:id", permissionMw.RequirePermission("role:update"), auditMw.AuditLogWithResourceID("UPDATE", "ROLE", "id"), roleHandler.Update) // 更新角色
		roleGroup.DELETE("/:id", permissionMw.RequirePermission("role:delete"), auditMw.AuditLogWithResourceID("DELETE", "ROLE", "id"), roleHandler.Delete) // 刪除角色

		// 角色權限管理
		roleGroup.GET("/:id/powers", roleHandler.GetRolePowers)                 // 獲取角色權限
		roleGroup.POST("/:id/powers", permissionMw.RequirePermission("role:assign_powers"), auditMw.AuditLog("ASSIGN_POWERS", "ROLE"), roleHandler.AssignPowers)   // 分配權限
		roleGroup.DELETE("/:id/powers", permissionMw.RequirePermission("role:remove_powers"), auditMw.AuditLog("REMOVE_POWERS", "ROLE"), roleHandler.RemovePowers) // 移除權限

		// 角色成員管理
		roleGroup.GET("/:id/members", roleHandler.GetRoleMembers)               // 獲取角色成員
		roleGroup.POST("/:id/members", permissionMw.RequirePermission("role:assign_members"), auditMw.AuditLog("ASSIGN_MEMBERS", "ROLE"), roleHandler.AssignMembers)   // 分配成員
		roleGroup.DELETE("/:id/members", permissionMw.RequirePermission("role:remove_members"), auditMw.AuditLog("REMOVE_MEMBERS", "ROLE"), roleHandler.RemoveMembers) // 移除成員
	}

	// Power API - 權限管理
	powerGroup := router.Group("/powers", middleware.AuthMiddleware(authService, memberRoleDomainService))
	{
		powerGroup.GET("", powerHandler.GetAll)                                           // 獲取所有權限
		powerGroup.GET("/:id", powerHandler.GetByID)                                      // 獲取單個權限
		powerGroup.GET("/menu", powerHandler.GetByMenuID)                                 // 根據菜單ID獲取權限
		powerGroup.GET("/role", powerHandler.GetByRoleID)                                 // 根據角色ID獲取權限
		powerGroup.POST("", permissionMw.RequirePermission("power:create"), auditMw.AuditLog("CREATE", "POWER"), powerHandler.Create)     // 創建權限
		powerGroup.PUT("/:id", permissionMw.RequirePermission("power:update"), auditMw.AuditLogWithResourceID("UPDATE", "POWER", "id"), powerHandler.Update) // 更新權限
		powerGroup.DELETE("/:id", permissionMw.RequirePermission("power:delete"), auditMw.AuditLogWithResourceID("DELETE", "POWER", "id"), powerHandler.Delete) // 刪除權限
	}

	// Audit Log API - 審計日誌查詢
	auditLogGroup := router.Group("/audit-logs", middleware.AuthMiddleware(authService, memberRoleDomainService))
	{
		auditLogGroup.GET("", auditLogHandler.Query)                              // 查詢審計日誌
		auditLogGroup.GET("/:id", auditLogHandler.GetByID)                        // 獲取單個日誌
		auditLogGroup.GET("/member/:memberId", auditLogHandler.GetByMemberID)     // 根據成員ID獲取日誌
		auditLogGroup.GET("/resource/:resourceType", auditLogHandler.GetByResourceType) // 根據資源類型獲取日誌
	}

	// Member API - 成員管理
	memberGroup := router.Group("/members", middleware.AuthMiddleware(authService, memberRoleDomainService))
	{
		memberGroup.GET("", memberHandler.GetAll)                                                                                                                                   // 獲取所有成員
		memberGroup.GET("/:id", memberHandler.GetByID)                                                                                                                              // 獲取單個成員
		memberGroup.POST("", permissionMw.RequirePermission("member:create"), auditMw.AuditLog("CREATE", "MEMBER"), memberHandler.Create)                                           // 創建成員
		memberGroup.PUT("/:id", permissionMw.RequirePermission("member:update"), auditMw.AuditLogWithResourceID("UPDATE", "MEMBER", "id"), memberHandler.Update)                    // 更新成員
		memberGroup.PUT("/:id/status", permissionMw.RequirePermission("member:update_status"), auditMw.AuditLogWithResourceID("UPDATE_STATUS", "MEMBER", "id"), memberHandler.UpdateStatus) // 更新成員狀態
	}

	// Device API - 設備管理 (僅限 system 角色)
	deviceGroup := router.Group("/devices", middleware.AuthMiddleware(authService, memberRoleDomainService))
	{
		deviceGroup.GET("", permissionMw.RequirePermission("device:read"), deviceHandler.GetAllDevices)                                                                  // 獲取所有設備
		deviceGroup.GET("/unassigned", permissionMw.RequirePermission("device:read"), deviceHandler.GetUnassignedDevices)                                                // 獲取未綁定設備
		deviceGroup.GET("/:id", permissionMw.RequirePermission("device:read"), deviceHandler.GetDeviceByID)                                                              // 獲取單個設備
		deviceGroup.POST("", permissionMw.RequirePermission("device:create"), auditMw.AuditLog("CREATE", "DEVICE"), deviceHandler.CreateDevice)                          // 創建設備
		deviceGroup.PUT("/:id", permissionMw.RequirePermission("device:update"), auditMw.AuditLogWithResourceID("UPDATE", "DEVICE", "id"), deviceHandler.UpdateDevice)   // 更新設備
		deviceGroup.DELETE("/:id", permissionMw.RequirePermission("device:delete"), auditMw.AuditLogWithResourceID("DELETE", "DEVICE", "id"), deviceHandler.DeleteDevice) // 刪除設備
	}

	// Company API - 公司管理
	companyGroup := router.Group("/companies", middleware.AuthMiddleware(authService, memberRoleDomainService))
	{
		companyGroup.GET("", companyHandler.GetAll)                                                                                                                        // 獲取公司列表（根據角色過濾）
		companyGroup.GET("/:id", companyHandler.GetByID)                                                                                                                   // 獲取公司詳情
		companyGroup.POST("", permissionMw.RequirePermission("company:create"), auditMw.AuditLog("CREATE", "COMPANY"), companyHandler.Create)                              // 創建公司（SystemAdmin）
		companyGroup.PUT("/:id", permissionMw.RequirePermission("company:update"), auditMw.AuditLogWithResourceID("UPDATE", "COMPANY", "id"), companyHandler.Update)       // 更新公司
		companyGroup.DELETE("/:id", permissionMw.RequirePermission("company:delete"), auditMw.AuditLogWithResourceID("DELETE", "COMPANY", "id"), companyHandler.Delete)    // 刪除公司（SystemAdmin）

		// 公司樹結構
		companyGroup.GET("/:id/tree", companyHandler.GetTree) // 獲取公司樹結構

		// 創建公司管理員/用戶
		companyGroup.POST("/:id/manager", permissionMw.RequirePermission("company:create_manager"), auditMw.AuditLog("CREATE_MANAGER", "COMPANY"), companyHandler.CreateManager) // 創建管理員（SystemAdmin）
		companyGroup.POST("/:id/user", permissionMw.RequirePermission("company:manage_members"), auditMw.AuditLog("CREATE_USER", "COMPANY"), companyHandler.CreateUser)          // 創建用戶

		// 公司成員管理
		companyGroup.GET("/:id/members", companyHandler.GetMembers)                                                                                                                                       // 獲取公司成員
		companyGroup.POST("/:id/members", permissionMw.RequirePermission("company:manage_members"), auditMw.AuditLog("ADD_MEMBER", "COMPANY"), companyHandler.AddMember)                                  // 添加成員
		companyGroup.DELETE("/:id/members/:memberId", permissionMw.RequirePermission("company:manage_members"), auditMw.AuditLog("REMOVE_MEMBER", "COMPANY"), companyHandler.RemoveMember)                // 移除成員

		// 公司設備管理
		companyGroup.GET("/:id/devices", permissionMw.RequirePermission("company:view_devices"), companyHandler.GetDevices)                                                                               // 獲取公司設備
		companyGroup.POST("/:id/devices", permissionMw.RequirePermission("company:assign_devices"), auditMw.AuditLog("ASSIGN_DEVICE", "COMPANY"), companyHandler.AssignDevice)                            // 分配設備（SystemAdmin）
		companyGroup.DELETE("/:id/devices/:deviceId", permissionMw.RequirePermission("company:assign_devices"), auditMw.AuditLog("REMOVE_DEVICE", "COMPANY"), companyHandler.RemoveDevice)                // 移除設備（SystemAdmin）
		companyGroup.POST("/:id/devices/:deviceId/sync", permissionMw.RequirePermission("schedule:sync"), companyHandler.SyncDeviceSchedule)                                                              // 同步設備排程 (MQTT)
		companyGroup.POST("/:id/devices/:deviceId/info", permissionMw.RequirePermission("company:view_devices"), companyHandler.QueryDeviceInfo)                                                          // 查詢設備資訊 (MQTT)
	}

	// Schedule API - 排程管理
	scheduleGroup := router.Group("/schedules", middleware.AuthMiddleware(authService, memberRoleDomainService))
	{
		scheduleGroup.GET("", permissionMw.RequirePermission("schedule:read"), scheduleHandler.GetAll)                                                                                    // 獲取排程列表
		scheduleGroup.GET("/:id", permissionMw.RequirePermission("schedule:read"), scheduleHandler.GetByID)                                                                               // 獲取單個排程
		scheduleGroup.POST("", permissionMw.RequirePermission("schedule:create"), auditMw.AuditLog("CREATE", "SCHEDULE"), scheduleHandler.Create)                                         // 創建排程
		scheduleGroup.PUT("/:id", permissionMw.RequirePermission("schedule:update"), auditMw.AuditLogWithResourceID("UPDATE", "SCHEDULE", "id"), scheduleHandler.Update)                  // 更新排程
		scheduleGroup.DELETE("/:id", permissionMw.RequirePermission("schedule:delete"), auditMw.AuditLogWithResourceID("DELETE", "SCHEDULE", "id"), scheduleHandler.Delete)               // 刪除排程
		scheduleGroup.POST("/:id/sync", permissionMw.RequirePermission("schedule:sync"), scheduleHandler.Sync)                                                                            // 同步排程到設備 (MQTT)
		scheduleGroup.POST("/:id/query", permissionMw.RequirePermission("schedule:read"), scheduleHandler.QuerySchedule)                                                                  // 從設備獲取排程 (MQTT getSchedule)
	}

	// SSE API - Server-Sent Events for real-time updates
	// SSE uses token in query param since EventSource doesn't support headers
	sseGroup := router.Group("/sse", middleware.SSEAuthMiddleware(authService, memberRoleDomainService))
	{
		sseGroup.GET("/devices", sseHandler.DeviceUpdates)   // 設備更新即時通知 (MQTT)
		sseGroup.GET("/dashboard", sseHandler.Dashboard)     // Dashboard 即時更新 (AC 狀態、溫度、電表)
	}

	// WebSocket 路由已在 main.go 中直接設置（在 CORS middleware 之前，避免 CORS 阻擋）
}
