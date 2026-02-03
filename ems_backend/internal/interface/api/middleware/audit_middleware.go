package middleware

import (
	"ems_backend/internal/domain/audit_log/services"

	"github.com/gin-gonic/gin"
)

// AuditMiddleware 審計日誌中間件
type AuditMiddleware struct {
	auditLogService *services.AuditLogService
}

// NewAuditMiddleware 創建審計中間件
func NewAuditMiddleware(auditLogService *services.AuditLogService) *AuditMiddleware {
	return &AuditMiddleware{
		auditLogService: auditLogService,
	}
}

// AuditLog 記錄審計日誌
// 使用示例: router.POST("/menu", auditMw.AuditLog("CREATE", "MENU"), handler.CreateMenu)
func (am *AuditMiddleware) AuditLog(action, resourceType string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 先執行請求處理
		c.Next()

		// 從上下文獲取必要信息
		memberID, exists := c.Get("member_id")
		if !exists {
			// 如果沒有member_id，可能是未認證的請求，不記錄
			return
		}

		currentRoleID, exists := c.Get("current_role_id")
		if !exists {
			// 如果沒有current_role_id，使用0或跳過
			return
		}

		// 獲取請求的IP地址
		ipAddress := c.ClientIP()

		// 獲取User-Agent
		userAgent := c.GetHeader("User-Agent")

		// 檢查響應狀態碼來判斷是否成功
		statusCode := c.Writer.Status()
		var status string
		var errorMessage string

		if statusCode >= 200 && statusCode < 300 {
			status = "SUCCESS"
		} else {
			status = "FAILURE"
			// 可以從響應中獲取錯誤信息，但這需要額外的處理
			errorMessage = c.Errors.String()
		}

		// 獲取資源ID（如果有）
		var resourceID *uint
		if resourceIDValue, exists := c.Get("resource_id"); exists {
			if id, ok := resourceIDValue.(uint); ok {
				resourceID = &id
			}
		}

		// 獲取額外詳情（如果有）
		details := make(map[string]interface{})
		if detailsValue, exists := c.Get("audit_details"); exists {
			if d, ok := detailsValue.(map[string]interface{}); ok {
				details = d
			}
		}

		// 添加請求路徑和方法到詳情
		details["path"] = c.Request.URL.Path
		details["method"] = c.Request.Method

		// 記錄審計日誌（異步，不影響響應）
		go func() {
			if status == "SUCCESS" {
				_ = am.auditLogService.LogSuccess(
					memberID.(uint),
					currentRoleID.(uint),
					action,
					resourceType,
					resourceID,
					details,
					ipAddress,
					userAgent,
				)
			} else {
				_ = am.auditLogService.LogFailure(
					memberID.(uint),
					currentRoleID.(uint),
					action,
					resourceType,
					resourceID,
					details,
					ipAddress,
					userAgent,
					errorMessage,
				)
			}
		}()
	}
}

// AuditLogWithResourceID 記錄審計日誌並自動從路徑參數獲取資源ID
// 使用示例: router.PUT("/menu/:id", auditMw.AuditLogWithResourceID("UPDATE", "MENU", "id"), handler.UpdateMenu)
func (am *AuditMiddleware) AuditLogWithResourceID(action, resourceType, idParam string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 從路徑參數獲取資源ID
		if id := c.Param(idParam); id != "" {
			// 嘗試轉換為uint
			var resourceID uint
			if _, err := parseUint(id); err == nil {
				resourceID = uint(parseUintValue(id))
				c.Set("resource_id", resourceID)
			}
		}

		// 調用標準的審計日誌中間件
		am.AuditLog(action, resourceType)(c)
	}
}

// 輔助函數：解析uint
func parseUint(s string) (uint64, error) {
	var result uint64
	_, err := parseUint64(s, &result)
	return result, err
}

func parseUint64(s string, result *uint64) (int, error) {
	// 簡單的字符串轉uint實現
	*result = 0
	for i, c := range s {
		if c < '0' || c > '9' {
			return i, nil
		}
		*result = *result*10 + uint64(c-'0')
	}
	return len(s), nil
}

func parseUintValue(s string) uint {
	var result uint64
	parseUint64(s, &result)
	return uint(result)
}
