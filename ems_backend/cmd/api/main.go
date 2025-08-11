package main

import (
	app_services "ems_backend/internal/application/services"
	auth_services "ems_backend/internal/domain/auth/services"
	menu_services "ems_backend/internal/domain/menu/services"
	repositories "ems_backend/internal/infrastructure/persistence/repositories"
	"ems_backend/internal/interface/api/handlers"
	"ems_backend/internal/interface/api/router"
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	// 設置環境變量
	setupEnvironment()

	// 初始化數據庫
	db, err := initDatabase()
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// 初始化 Repository
	memberRepo := repositories.NewMemberRepository(db)
	authRepo := repositories.NewAuthRepository(db)
	memberHistoryRepo := repositories.NewMemberHistoryRepository(db)
	memberRoleRepo := repositories.NewMemberRoleRepository(db)
	menuRepo := repositories.NewMenuRepository(db)

	// 初始化 Domain Service
	authService := auth_services.NewAuthService(memberRepo, memberHistoryRepo, authRepo, memberRoleRepo, "your-jwt-secret-key", "your-jwt-secret-key")
	menuService := menu_services.NewMenuService(menuRepo)
	// 初始化 Application Service
	authAppService := app_services.NewAuthApplicationService(authService)
	menuAppService := app_services.NewMenuApplicationService(menuService)

	// 初始化 Handler
	authHandler := handlers.NewAuthHandler(authAppService)
	menuHandler := handlers.NewMenuHandler(menuAppService)

	// 設置 Gin 路由
	ginRouter := gin.Default()

	// 設置 CORS 中間件
	ginRouter.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		AllowCredentials: true,
	}))

	// 設置路由
	router.SetupRoutes(ginRouter, authHandler, menuHandler, authService)

	// 啟動服務器
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := ginRouter.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

// setupEnvironment 设置环境变量
func setupEnvironment() {
	// 数据库配置
	if os.Getenv("DB_HOST") == "" {
		os.Setenv("DB_HOST", "220.132.191.5")
	}
	if os.Getenv("DB_PORT") == "" {
		os.Setenv("DB_PORT", "9432")
	}
	if os.Getenv("DB_USER") == "" {
		os.Setenv("DB_USER", "ems_user")
	}
	if os.Getenv("DB_CODE") == "" {
		os.Setenv("DB_CODE", "ji394@ems_user")
	}
	if os.Getenv("DB_NAME") == "" {
		os.Setenv("DB_NAME", "ems")
	}

	// 服务器配置
	if os.Getenv("PORT") == "" {
		os.Setenv("PORT", "8080")
	}

	// 设置 Gin 模式
	if os.Getenv("GIN_MODE") == "" {
		os.Setenv("GIN_MODE", "release")
	}
}

// initDatabase 初始化數據庫連接
func initDatabase() (*gorm.DB, error) {
	dsn := "host=" + os.Getenv("DB_HOST") +
		" port=" + os.Getenv("DB_PORT") +
		" user=" + os.Getenv("DB_USER") +
		" password=" + os.Getenv("DB_CODE") +
		" dbname=" + os.Getenv("DB_NAME") +
		" sslmode=disable TimeZone=Asia/Shanghai"

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	// 自動遷移數據庫表
	if err := db.AutoMigrate(); err != nil {
		return nil, err
	}

	return db, nil
}
