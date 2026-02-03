"use client";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme, alpha } from "@mui/material/styles";
import { useDispatch, useSelector } from "react-redux";
import SidebarItems from "./SidebarItems";
import Logo from "../../../Shared/logo/Logo";
import { Typography, Divider } from "@mui/material";

import { actions } from "../../../../../store/Customizer/reducer";
import Scrollbar from "../../../CustomScroll/Scrollbar";
import type { IState } from "../../../../../store/reducers";
import type { MenuitemsType } from "./types";

const Sidebar = ({
  menuitems,
  lng,
}: {
  menuitems: MenuitemsType[];
  lng: string;
}) => {
  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up("lg"));
  const customizer = useSelector((state: IState) => state.customizer);
  const dispatch = useDispatch();
  const theme = useTheme();
  const toggleWidth =
    customizer.isCollapse && !customizer.isSidebarHover
      ? customizer.MiniSidebarWidth
      : customizer.SidebarWidth;

  const onHoverEnter = () => {
    if (customizer.isCollapse) {
      dispatch(actions.hoverSidebar(true));
    }
  };

  const onHoverLeave = () => {
    dispatch(actions.hoverSidebar(false));
  };

  // Sidebar styles
  const sidebarBg = theme.palette.mode === 'dark'
    ? `linear-gradient(180deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.dark, 0.05)} 100%)`
    : `linear-gradient(180deg, #ffffff 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`;

  if (lgUp) {
    return (
      <Box
        sx={{
          zIndex: 100,
          width: toggleWidth,
          flexShrink: 0,
          ...(customizer.isCollapse && {
            position: "absolute",
          }),
        }}
      >
        <Drawer
          anchor="left"
          open
          onMouseEnter={onHoverEnter}
          onMouseLeave={onHoverLeave}
          variant="permanent"
          PaperProps={{
            sx: {
              transition: theme.transitions.create(["width", "box-shadow"], {
                duration: theme.transitions.duration.shorter,
              }),
              width: toggleWidth,
              boxSizing: "border-box",
              background: sidebarBg,
              borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              boxShadow: `4px 0 24px ${alpha(theme.palette.common.black, 0.04)}`,
            },
          }}
        >
          <Box
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Logo Section */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                py: 2.5,
                px: 2,
                minHeight: 70,
              }}
            >
              <Logo />
            </Box>

            <Divider sx={{ opacity: 0.6, mx: 2 }} />

            {/* Navigation Section */}
            <Scrollbar
              sx={{
                height: customizer.isCollapse && !customizer.isSidebarHover
                  ? "calc(100% - 80px)"
                  : "calc(100% - 120px)",
                "& .simplebar-content": {
                  height: "100%",
                },
              }}
            >
              <Box sx={{ py: 1 }}>
                <SidebarItems menuitems={menuitems} lng={lng} />
              </Box>
            </Scrollbar>

            {/* Footer Section - hide when collapsed */}
            {!(customizer.isCollapse && !customizer.isSidebarHover) && (
              <Box
                sx={{
                  mt: "auto",
                  p: 2,
                  borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: "block",
                    textAlign: "center",
                    opacity: 0.7,
                  }}
                >
                  EMS Cloud v1.0
                </Typography>
              </Box>
            )}
          </Box>
        </Drawer>
      </Box>
    );
  }

  return (
    <Drawer
      anchor="left"
      open={customizer.isMobileSidebar}
      onClose={() => dispatch(actions.toggleMobileSidebar())}
      variant="temporary"
      PaperProps={{
        sx: {
          width: customizer.SidebarWidth,
          background: sidebarBg,
          border: "0 !important",
          boxShadow: theme.shadows[16],
        },
      }}
    >
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Logo */}
        <Box sx={{ py: 2.5, px: 2 }}>
          <Logo />
        </Box>

        <Divider sx={{ opacity: 0.6, mx: 2 }} />

        {/* Sidebar Items */}
        <Box sx={{ flex: 1, overflow: "auto", py: 1 }}>
          <SidebarItems menuitems={menuitems} lng={lng} />
        </Box>

        {/* Footer */}
        <Box
          sx={{
            p: 2,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", textAlign: "center", opacity: 0.7 }}
          >
            EMS Cloud v1.0
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
