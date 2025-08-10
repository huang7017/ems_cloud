package models

const (
	TableNameMemberRole = "v_member_role"
)

type VMemberRoleModel struct {
	ID         uint
	MemberID   uint
	MemberName string
	RoleID     uint
	RoleTitle  string
}

func (VMemberRoleModel) TableName() string {
	return TableNameMemberRole
}
