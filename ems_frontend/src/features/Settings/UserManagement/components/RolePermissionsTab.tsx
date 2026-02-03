import React from "react";
import PermissionMatrix from "./PermissionMatrix";

interface RolePermissionsTabProps {
  roles?: any[];
  onEditRole?: (role: any) => void;
  onPermissionChange?: (
    roleId: number,
    permissionId: string,
    checked: boolean
  ) => void;
}

const RolePermissionsTab: React.FC<RolePermissionsTabProps> = () => {
  // 使用新的權限矩陣組件，自動載入所有數據
  return <PermissionMatrix />;
};

export default RolePermissionsTab;
