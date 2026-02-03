import React, { useState, useEffect } from "react";
import {
  Box,
  MenuItem,
  Select,
  FormControl,
  Typography,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import Cookies from "js-cookie";
import { useDispatch } from "react-redux";
import { fetchMenusStart } from "../../../features/Menu";

interface Role {
  id: string;
  name: string;
}

const RoleSwitch: React.FC = () => {
  const dispatch = useDispatch();
  const [roles, setRoles] = useState<Role[]>([]);
  const [currentRoleId, setCurrentRoleId] = useState<string>("");

  useEffect(() => {
    // 從 Cookie 讀取所有角色
    const rolesStr = Cookies.get("roles");
    const roleId = Cookies.get("roleId");

    if (rolesStr) {
      try {
        const parsedRoles = JSON.parse(rolesStr);
        setRoles(parsedRoles);
      } catch (error) {
        console.error("Failed to parse roles from cookie:", error);
      }
    }

    if (roleId) {
      setCurrentRoleId(roleId);
    }
  }, []);

  const handleRoleChange = (event: SelectChangeEvent<string>) => {
    const newRoleId = event.target.value;

    // 更新 Cookie
    Cookies.set("roleId", newRoleId);
    setCurrentRoleId(newRoleId);

    // 重新獲取菜單（因為不同角色可能有不同的菜單權限）
    dispatch(fetchMenusStart());

    // 刷新頁面以確保所有權限都更新
    window.location.reload();
  };

  // 如果只有一個角色或沒有角色，不顯示切換器
  if (roles.length <= 1) {
    return null;
  }

  return (
    <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
      <Typography
        variant="body2"
        sx={{ mr: 1, color: "text.secondary", fontSize: "0.875rem" }}
      >
        角色:
      </Typography>
      <FormControl size="small" variant="outlined" sx={{ minWidth: 120 }}>
        <Select
          value={currentRoleId}
          onChange={handleRoleChange}
          displayEmpty
          sx={{
            fontSize: "0.875rem",
            "& .MuiSelect-select": {
              py: 0.75,
              px: 1.5,
            },
          }}
        >
          {roles.map((role) => (
            <MenuItem key={role.id} value={role.id}>
              {role.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default RoleSwitch;
