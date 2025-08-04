import React from "react";
import {
  Box,
  Button,
  Paper,
  Typography,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import type { Role, Permission } from "../types";

interface RolePermissionsTabProps {
  roles: Role[];
  onEditRole: (role: Role) => void;
  onPermissionChange: (
    roleId: string,
    permissionId: string,
    checked: boolean
  ) => void;
}

const RolePermissionsTab: React.FC<RolePermissionsTabProps> = ({
  roles,
  onEditRole,
  onPermissionChange,
}) => {
  const groupPermissionsByCategory = (permissions: Permission[]) => {
    const grouped: Record<string, Permission[]> = {};
    permissions.forEach((permission) => {
      if (!grouped[permission.category]) {
        grouped[permission.category] = [];
      }
      grouped[permission.category].push(permission);
    });
    return grouped;
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Roles List Section */}
      <Box sx={{ flex: 1, overflow: "auto" }}>
        {roles.map((role) => {
          const groupedPermissions = groupPermissionsByCategory(
            role.permissions
          );
          return (
            <Box
              key={role.id}
              sx={{
                mb: 3,
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  justifyContent: "space-between",
                  alignItems: { xs: "stretch", sm: "center" },
                  gap: { xs: 1, sm: 0 },
                  pb: 2,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: { xs: "1.1rem", sm: "1.25rem", md: "1.5rem" },
                    fontWeight: "bold",
                    color: "text.primary",
                  }}
                >
                  {role.name}
                </Typography>
                <Button
                  startIcon={<EditIcon />}
                  onClick={() => onEditRole(role)}
                  size="small"
                  variant="outlined"
                  sx={{
                    minWidth: { xs: "100%", sm: "auto" },
                  }}
                >
                  編輯
                </Button>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  gap: { xs: 3, md: 4 },
                }}
              >
                {Object.entries(groupedPermissions).map(
                  ([category, permissions]) => (
                    <Box
                      key={category}
                      sx={{
                        flex: 1,
                        minWidth: { xs: "100%", md: "auto" },
                        p: { xs: 2, sm: 2 },
                        backgroundColor: "#F8FAFC",
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontSize: {
                            xs: "0.875rem",
                            sm: "1rem",
                            md: "1.125rem",
                          },
                          fontWeight: "bold",
                          mb: 2,
                          color: "text.primary",
                          textAlign: "left",
                        }}
                      >
                        {category}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 1.5,
                          "& .MuiFormControlLabel-root": {
                            fontSize: { xs: "0.875rem", sm: "1rem" },
                            margin: 0,
                            "& .MuiFormControlLabel-label": {
                              fontSize: { xs: "0.875rem", sm: "1rem" },
                              color: "text.secondary",
                            },
                          },
                        }}
                      >
                        {permissions.map((permission) => (
                          <FormControlLabel
                            key={permission.id}
                            control={
                              <Checkbox
                                checked={permission.checked}
                                onChange={(e) =>
                                  onPermissionChange(
                                    role.id,
                                    permission.id,
                                    e.target.checked
                                  )
                                }
                                size="small"
                                sx={{
                                  "& .MuiSvgIcon-root": {
                                    fontSize: { xs: "1rem", sm: "1.25rem" },
                                  },
                                  "&.Mui-checked": {
                                    color: "primary.main",
                                  },
                                }}
                              />
                            }
                            label={permission.name}
                          />
                        ))}
                      </Box>
                    </Box>
                  )
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default RolePermissionsTab;
