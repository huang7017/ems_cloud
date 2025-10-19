package main

import (
	"context"
	app_services "ems_backend/internal/application/services"
	auth_services "ems_backend/internal/domain/auth/services"
	memberRoleDomainService "ems_backend/internal/domain/member_role/services"
	menu_services "ems_backend/internal/domain/menu/services"
	meter_services "ems_backend/internal/domain/meter/services"
	temperature_services "ems_backend/internal/domain/temperature/services"
	"ems_backend/internal/infrastructure/messaging"
	msg_handlers "ems_backend/internal/infrastructure/messaging/handlers"
	repositories "ems_backend/internal/infrastructure/persistence/repositories"
	api_handlers "ems_backend/internal/interface/api/handlers"
	"ems_backend/internal/interface/api/router"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

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
	temperatureRepo := repositories.NewTemperatureRepository(db)
	meterRepo := repositories.NewMeterRepository(db)
	companyRepo := repositories.NewCompanyRepository(db)
	companyDeviceRepo := repositories.NewCompanyDeviceRepository(db)

	// 初始化 Domain Service
	authService := auth_services.NewAuthService(memberRepo, memberHistoryRepo, authRepo, memberRoleRepo, "your-jwt-secret-key", "your-jwt-secret-key")
	menuService := menu_services.NewMenuService(menuRepo)
	memberRoleDomainService := memberRoleDomainService.NewMemberRoleService(memberRoleRepo)
	temperatureDomainService := temperature_services.NewTemperatureService(temperatureRepo)
	meterDomainService := meter_services.NewMeterService(meterRepo)

	// 初始化 Application Service
	authAppService := app_services.NewAuthApplicationService(authService)
	menuAppService := app_services.NewMenuApplicationService(menuService)
	temperatureAppService := app_services.NewTemperatureApplicationService(temperatureDomainService)
	meterAppService := app_services.NewMeterApplicationService(meterDomainService)
	dashboardAppService := app_services.NewDashboardApplicationService(companyRepo, companyDeviceRepo, meterRepo)
	dashboardTempService := app_services.NewDashboardTemperatureService(companyRepo, companyDeviceRepo, temperatureRepo)
	dashboardAreaService := app_services.NewDashboardAreaService(companyRepo, companyDeviceRepo, meterRepo, temperatureRepo)

	// 初始化 API Handler
	authHandler := api_handlers.NewAuthHandler(authAppService)
	menuHandler := api_handlers.NewMenuHandler(menuAppService)
	dashboardHandler := api_handlers.NewDashboardHandler(dashboardAppService, dashboardTempService, dashboardAreaService)

	// 設置 Gin 路由
	ginRouter := gin.Default()

	// 設置 CORS 中間件
	ginRouter.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Role-ID"},
		AllowCredentials: true,
	}))

	// 設置路由
	router.SetupRoutes(ginRouter, authHandler, menuHandler, dashboardHandler, authService, memberRoleDomainService)

	// 初始化 SQS 消息队列监听 (可选功能)
	ctx := context.Background()
	queueManager := initQueueListeners(ctx, db, temperatureAppService, meterAppService)

	// 啟動服務器
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// 创建信号通道用于优雅关闭
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)

	// 在goroutine中启动服务器
	go func() {
		log.Printf("Server starting on port %s", port)
		if err := ginRouter.Run(":" + port); err != nil {
			log.Fatal("Failed to start server:", err)
		}
	}()

	// 等待中断信号
	<-sigChan
	log.Println("Shutting down gracefully...")

	// 停止队列监听
	if queueManager != nil {
		queueManager.StopAll()
	}

	log.Println("Server stopped")
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

	// SQS 队列配置
	if os.Getenv("ENABLE_SQS") == "" {
		os.Setenv("ENABLE_SQS", "true") // 默认启用 SQS 监听
	}
	if os.Getenv("AWS_REGION") == "" {
		os.Setenv("AWS_REGION", "ap-southeast-2")
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

// initQueueListeners 初始化队列监听器 (可选)
// 如果不需要队列监听，可以注释掉这个函数的调用
func initQueueListeners(ctx context.Context, db *gorm.DB, temperatureAppService *app_services.TemperatureApplicationService, meterAppService *app_services.MeterApplicationService) *messaging.QueueManager {
	// 检查是否启用队列监听
	if os.Getenv("ENABLE_SQS") != "true" {
		log.Println("[SQS] Queue listeners are disabled. Set ENABLE_SQS=true to enable.")
		return nil
	}

	// 获取AWS区域
	awsRegion := os.Getenv("AWS_REGION")
	if awsRegion == "" {
		awsRegion = "ap-southeast-2" // 默认区域
	}

	// 创建SQS客户端
	sqsClient, err := messaging.NewSQSClient(ctx, awsRegion)
	if err != nil {
		log.Printf("[SQS] Failed to create SQS client: %v", err)
		return nil
	}

	// 创建队列管理器
	queueManager := messaging.NewQueueManager(sqsClient)

	// ============================================
	// 注册队列处理器
	// 你可以在这里添加更多的队列
	// ============================================

	// 示例1: AC温度队列
	acTempHandler := msg_handlers.NewACTemperatureHandler(temperatureAppService)
	if err := queueManager.RegisterQueue(acTempHandler, messaging.QueueConfig{
		QueueName:         "ac_temperature",
		MaxMessages:       10,
		VisibilityTimeout: 30,
		PollInterval:      2 * time.Second,
	}); err != nil {
		log.Printf("[SQS] Failed to register queue 'ac_temperature': %v", err)
	}

	// 示例2: 电表队列
	meterHandler := msg_handlers.NewMeterHandler(meterAppService)
	if err := queueManager.RegisterQueue(meterHandler, messaging.QueueConfig{
		QueueName:         "meter",
		MaxMessages:       10,
		VisibilityTimeout: 30,
		PollInterval:      2 * time.Second,
	}); err != nil {
		log.Printf("[SQS] Failed to register queue 'meter': %v", err)
	}

	// 启动所有队列监听器
	if err := queueManager.StartAll(ctx); err != nil {
		log.Printf("[SQS] Failed to start queue listeners: %v", err)
		return nil
	}

	log.Printf("[SQS] Queue listeners started successfully. Monitoring queues: %v", queueManager.ListQueues())
	return queueManager
}
