package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/joho/godotenv"

	app_services "ems_backend/internal/application/services"
	audit_log_services "ems_backend/internal/domain/audit_log/services"
	auth_services "ems_backend/internal/domain/auth/services"
	memberRoleDomainService "ems_backend/internal/domain/member_role/services"
	menu_services "ems_backend/internal/domain/menu/services"
	meter_services "ems_backend/internal/domain/meter/services"
	power_services "ems_backend/internal/domain/power/services"
	role_services "ems_backend/internal/domain/role/services"
	temperature_services "ems_backend/internal/domain/temperature/services"
	companyDeviceRepoInterface "ems_backend/internal/domain/company_device/repositories"
	"ems_backend/internal/infrastructure/cache"
	"ems_backend/internal/infrastructure/messaging"
	msg_handlers "ems_backend/internal/infrastructure/messaging/handlers"
	"ems_backend/internal/infrastructure/mqtt"
	repositories "ems_backend/internal/infrastructure/persistence/repositories"
	api_handlers "ems_backend/internal/interface/api/handlers"
	"ems_backend/internal/interface/api/middleware"
	"ems_backend/internal/interface/api/router"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	// 載入 .env 檔案 (如果存在)
	if err := godotenv.Load(); err != nil {
		log.Println("[ENV] No .env file found, using system environment variables")
	} else {
		log.Println("[ENV] Loaded .env file")
	}

	// 設置環境變量 (設定預設值)
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
	companyMemberRepo := repositories.NewCompanyMemberRepository(db)
	companyDeviceRepo := repositories.NewCompanyDeviceRepository(db)
	powerRepo := repositories.NewPowerRepository(db)
	roleRepo := repositories.NewRoleRepository(db)
	auditLogRepo := repositories.NewAuditLogRepository(db)
	deviceRepo := repositories.NewDeviceRepository(db)
	scheduleRepo := repositories.NewScheduleRepository(db)

	// 初始化設備快取
	deviceCache := cache.NewDeviceCache(companyDeviceRepo)
	if err := deviceCache.Initialize(); err != nil {
		log.Printf("[Cache] Failed to initialize device cache: %v", err)
	}

	// 初始化 Domain Service
	jwtAccessSecret := os.Getenv("JWT_ACCESS_SECRET")
	jwtRefreshSecret := os.Getenv("JWT_REFRESH_SECRET")
	authService := auth_services.NewAuthService(memberRepo, memberHistoryRepo, authRepo, memberRoleRepo, jwtAccessSecret, jwtRefreshSecret)
	menuService := menu_services.NewMenuService(menuRepo)
	memberRoleDomainService := memberRoleDomainService.NewMemberRoleService(memberRoleRepo)
	powerService := power_services.NewPowerService(powerRepo)
	roleService := role_services.NewRoleService(roleRepo, powerRepo)
	auditLogService := audit_log_services.NewAuditLogService(auditLogRepo)
	temperatureDomainService := temperature_services.NewTemperatureService(temperatureRepo)
	meterDomainService := meter_services.NewMeterService(meterRepo)

	// 初始化 Application Service
	authAppService := app_services.NewAuthApplicationService(authService)
	menuAppService := app_services.NewMenuApplicationService(menuService)
	roleAppService := app_services.NewRoleApplicationService(roleService)
	powerAppService := app_services.NewPowerApplicationService(powerService)
	auditLogAppService := app_services.NewAuditLogApplicationService(auditLogService)
	memberAppService := app_services.NewMemberApplicationService(memberRepo, memberRoleRepo, memberHistoryRepo, roleService)
	deviceAppService := app_services.NewDeviceApplicationService(deviceRepo)
	companyAppService := app_services.NewCompanyApplicationService(
		companyRepo, companyMemberRepo, companyDeviceRepo, deviceRepo,
		memberRepo, memberHistoryRepo, roleRepo, roleService,
	)
	temperatureAppService := app_services.NewTemperatureApplicationService(temperatureDomainService)
	meterAppService := app_services.NewMeterApplicationService(meterDomainService)
	dashboardAppService := app_services.NewDashboardApplicationService(companyRepo, companyDeviceRepo, meterRepo)
	dashboardTempService := app_services.NewDashboardTemperatureService(companyRepo, companyDeviceRepo, temperatureRepo)
	dashboardAreaService := app_services.NewDashboardAreaService(companyRepo, companyDeviceRepo, meterRepo, temperatureRepo)
	scheduleAppService := app_services.NewScheduleApplicationService(scheduleRepo, companyDeviceRepo)
	scheduleAppService.SetDeviceRepository(deviceRepo) // 設置設備倉儲以獲取設備 SN

	// 初始化 MQTT 客戶端 (可選)
	var mqttClient *mqtt.Client
	if os.Getenv("ENABLE_MQTT") == "true" {
		mqttClient, err = initMQTTClient()
		if err != nil {
			log.Printf("[MQTT] Failed to initialize MQTT client: %v", err)
		} else {
			// Set MQTT publisher for schedule service
			schedulePublisher := mqtt.NewSchedulePublisher(mqttClient)
			scheduleAppService.SetMQTTPublisher(schedulePublisher)
			log.Println("[MQTT] MQTT publisher configured for schedule service")

			// Start device response handler to receive and process device responses
			deviceResponseHandler := mqtt.NewDeviceResponseHandler(mqttClient, companyDeviceRepo, deviceRepo)
			deviceResponseHandler.SetScheduleRepository(scheduleRepo) // Enable saving schedule from device
			if err := deviceResponseHandler.Start(); err != nil {
				log.Printf("[MQTT] Failed to start device response handler: %v", err)
			} else {
				log.Println("[MQTT] Device response handler started, listening on ac/return/+")
			}
		}
	}

	// 初始化 API Handler
	authHandler := api_handlers.NewAuthHandler(authAppService)
	menuHandler := api_handlers.NewMenuHandler(menuAppService)
	dashboardHandler := api_handlers.NewDashboardHandler(dashboardAppService, dashboardTempService, dashboardAreaService)
	roleHandler := api_handlers.NewRoleHandler(roleAppService)
	powerHandler := api_handlers.NewPowerHandler(powerAppService)
	auditLogHandler := api_handlers.NewAuditLogHandler(auditLogAppService)
	memberHandler := api_handlers.NewMemberHandler(memberAppService)
	deviceHandler := api_handlers.NewDeviceHandler(deviceAppService)
	companyHandler := api_handlers.NewCompanyHandler(companyAppService, scheduleAppService)
	scheduleHandler := api_handlers.NewScheduleHandler(scheduleAppService)
	sseHandler := api_handlers.NewSSEHandler()
	wsHandler := api_handlers.NewWebSocketHandler()

	// 初始化 Middleware
	permissionMw := middleware.NewPermissionMiddleware(powerService)
	auditMw := middleware.NewAuditMiddleware(auditLogService)

	// 設置 Gin 路由
	ginRouter := gin.Default()

	// WebSocket 路由 - 在 CORS 之前設置，避免 CORS 阻擋 WebSocket 升級請求
	wsGroup := ginRouter.Group("/ws", middleware.SSEAuthMiddleware(authService, memberRoleDomainService))
	{
		wsGroup.GET("/dashboard", wsHandler.Dashboard)
	}

	// 設置 CORS 中間件 (僅適用於後續路由)
	ginRouter.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:3000", "https://kaiems.com"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Role-ID"},
		AllowCredentials: true,
	}))

	// 設置路由
	router.SetupRoutes(
		ginRouter,
		authHandler,
		menuHandler,
		dashboardHandler,
		roleHandler,
		powerHandler,
		auditLogHandler,
		memberHandler,
		deviceHandler,
		companyHandler,
		scheduleHandler,
		sseHandler,
		wsHandler,
		authService,
		memberRoleDomainService,
		permissionMw,
		auditMw,
	)

	// 初始化 SQS 消息队列监听 (可选功能)
	ctx := context.Background()
	queueManager := initQueueListeners(ctx, db, temperatureAppService, meterAppService, companyDeviceRepo, deviceCache)

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

	// 斷開 MQTT 連接
	if mqttClient != nil {
		mqttClient.Disconnect()
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

	// JWT 配置
	if os.Getenv("JWT_ACCESS_SECRET") == "" {
		os.Setenv("JWT_ACCESS_SECRET", "default-access-secret-change-in-production")
	}
	if os.Getenv("JWT_REFRESH_SECRET") == "" {
		os.Setenv("JWT_REFRESH_SECRET", "default-refresh-secret-change-in-production")
	}
	if os.Getenv("JWT_ACCESS_EXPIRY") == "" {
		os.Setenv("JWT_ACCESS_EXPIRY", "24h") // 24 hours
	}
	if os.Getenv("JWT_REFRESH_EXPIRY") == "" {
		os.Setenv("JWT_REFRESH_EXPIRY", "168h") // 7 days
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

	// MQTT 配置 (AWS IoT Core)
	// MQTT_ENDPOINT: AWS IoT Core endpoint (e.g., "xxxxx.iot.ap-northeast-1.amazonaws.com:8883")
	// MQTT_CA_CERT: Path to AmazonRootCA1.pem
	// MQTT_CLIENT_CERT: Path to xxx-certificate.pem.crt
	// MQTT_PRIVATE_KEY: Path to xxx-private.pem.key
	if os.Getenv("ENABLE_MQTT") == "" {
		os.Setenv("ENABLE_MQTT", "false") // 默認不啟用 MQTT
	}
}

// initDatabase 初始化數據庫連接
func initDatabase() (*gorm.DB, error) {
	sslMode := os.Getenv("DB_SSLMODE")
	if sslMode == "" {
		sslMode = "require" // 預設使用 SSL (RDS 需要)
	}

	dsn := "host=" + os.Getenv("DB_HOST") +
		" port=" + os.Getenv("DB_PORT") +
		" user=" + os.Getenv("DB_USER") +
		" password=" + os.Getenv("DB_CODE") +
		" dbname=" + os.Getenv("DB_NAME") +
		" sslmode=" + sslMode + " TimeZone=UTC"

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
func initQueueListeners(ctx context.Context, db *gorm.DB, temperatureAppService *app_services.TemperatureApplicationService, meterAppService *app_services.MeterApplicationService, companyDeviceRepo companyDeviceRepoInterface.CompanyDeviceRepository, deviceCache *cache.DeviceCache) *messaging.QueueManager {
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

	// AC 狀態隊列（統一處理 package_ac_status 和 vrf_status，根據 type 欄位區分）
	acStatusHandler := msg_handlers.NewACStatusHandler(companyDeviceRepo, deviceCache)
	if err := queueManager.RegisterQueue(acStatusHandler, messaging.QueueConfig{
		QueueName:         "ac_status",
		MaxMessages:       10,
		VisibilityTimeout: 30,
		PollInterval:      2 * time.Second,
	}); err != nil {
		log.Printf("[SQS] Failed to register queue 'ac_status': %v", err)
	}

	// 启动所有队列监听器
	if err := queueManager.StartAll(ctx); err != nil {
		log.Printf("[SQS] Failed to start queue listeners: %v", err)
		return nil
	}

	log.Printf("[SQS] Queue listeners started successfully. Monitoring queues: %v", queueManager.ListQueues())
	return queueManager
}

// initMQTTClient 初始化 MQTT 客戶端 (AWS IoT Core)
func initMQTTClient() (*mqtt.Client, error) {
	endpoint := os.Getenv("MQTT_ENDPOINT")
	if endpoint == "" {
		return nil, fmt.Errorf("MQTT_ENDPOINT is required for AWS IoT Core")
	}

	clientID := os.Getenv("MQTT_CLIENT_ID")
	if clientID == "" {
		clientID = "ems-backend-" + time.Now().Format("20060102150405")
	}

	caCertPath := os.Getenv("MQTT_CA_CERT")
	clientCertPath := os.Getenv("MQTT_CLIENT_CERT")
	privateKeyPath := os.Getenv("MQTT_PRIVATE_KEY")

	if caCertPath == "" || clientCertPath == "" || privateKeyPath == "" {
		return nil, fmt.Errorf("MQTT certificate paths are required: MQTT_CA_CERT, MQTT_CLIENT_CERT, MQTT_PRIVATE_KEY")
	}

	cfg := mqtt.Config{
		Endpoint:       endpoint,
		ClientID:       clientID,
		CACertPath:     caCertPath,
		ClientCertPath: clientCertPath,
		PrivateKeyPath: privateKeyPath,
	}

	client, err := mqtt.NewClient(cfg)
	if err != nil {
		return nil, err
	}

	if err := client.Connect(); err != nil {
		return nil, err
	}

	log.Printf("[MQTT] Connected to AWS IoT Core: %s", endpoint)
	return client, nil
}
