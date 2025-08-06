package entities

import (
	"ems_backend/internal/domain/member/value_objects"
	"errors"
	"strings"
	"time"
)

// Member - 會員實體
type Member struct {
	ID        value_objects.MemberID
	Name      value_objects.Name
	Email     value_objects.Email
	IsEnable  bool
	CreatedAt time.Time
	UpdatedAt time.Time
}

func (m *Member) UpdateName(name value_objects.Name) error {
	if strings.TrimSpace(name.String()) == "" {
		return errors.New("name cannot be empty")
	}

	if !m.IsEnable {
		return errors.New("cannot update locked account")
	}

	m.Name = name
	m.UpdatedAt = time.Now()
	return nil
}

func (m *Member) UpdateEmail(email value_objects.Email) error {
	if !m.IsEnable {
		return errors.New("cannot update locked account")
	}

	m.Email = email
	m.UpdatedAt = time.Now()
	return nil
}

func (m *Member) LockAccount() {
	m.IsEnable = false
	m.UpdatedAt = time.Now()
}

func (m *Member) validatePassword(password string) bool {
	// 這裡應該實現密碼驗證邏輯
	// 例如：return bcrypt.CompareHashAndPassword([]byte(m.Password), []byte(password)) == nil
	return password == "correct_password" // 簡化示例
}

// GetPublicInfo - 返回公開信息（用於 API 回應）
func (m *Member) GetPublicInfo() *MemberPublicInfo {
	return &MemberPublicInfo{
		ID:   m.ID.String(),
		Name: m.Name.String(),
	}
}
