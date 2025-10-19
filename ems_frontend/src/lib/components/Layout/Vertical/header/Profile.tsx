import React, { useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Typography,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { actions } from "../../../../../features/Login/reducer";
import { userSelector } from "../../../../../features/Login/selector";
import { clearMenus } from "../../../../../features/Menu";

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const user = useSelector(userSelector);

  const handleMenu = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleLogout = useCallback(() => {
    handleClose();
    dispatch(actions.logout());
    dispatch(clearMenus());
    navigate("/public/login");
  }, [dispatch, navigate, handleClose]);

  const handleProfile = useCallback(() => {
    handleClose();
    // Navigate to profile page if needed
  }, [handleClose]);

  const open = Boolean(anchorEl);

  // Memoize member name from user object
  const memberName = useMemo(() => {
    return user?.member?.name || "";
  }, [user]);

  // Memoize the avatar content to prevent unnecessary re-renders
  const avatarContent = useMemo(() => {
    return memberName ? memberName.charAt(0).toUpperCase() : "U";
  }, [memberName]);


  return (
    <Box>
      <IconButton
        size="large"
        aria-label="account of current user"
        aria-controls="menu-appbar"
        aria-haspopup="true"
        onClick={handleMenu}
        color="inherit"
      >
        <Avatar
          sx={{
            width: 35,
            height: 35,
            bgcolor: "primary.main",
          }}
        >
          {avatarContent}
        </Avatar>
      </IconButton>
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={open}
        onClose={handleClose}
      >
        <MenuItem onClick={handleProfile}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar sx={{ width: 24, height: 24, bgcolor: "primary.main" }}>
              {avatarContent}
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {memberName || "User"}
              </Typography>
            </Box>
          </Box>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <Typography color="error">登出</Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Profile;
