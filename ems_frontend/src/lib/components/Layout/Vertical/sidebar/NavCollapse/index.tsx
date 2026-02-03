"use client";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

// mui imports
import Collapse from "@mui/material/Collapse";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import type { Theme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { styled, useTheme, alpha } from "@mui/material/styles";

// custom imports
import NavItem from "../NavItem";
import { isNull } from "lodash";

// icons
import { IoChevronDown, IoChevronForward } from "react-icons/io5";
import type { IState } from "../../../../../../store/reducers";

type NavGroupProps = {
  [x: string]: any;
  navlabel?: boolean;
  subheader?: string;
  title?: string;
  icon?: any;
  href?: any;
};

interface NavCollapseProps {
  lng: string;
  menu: NavGroupProps;
  level: number;
  pathWithoutLastPart: any;
  pathDirect: any;
  hideMenu: any;
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
}

export default function NavCollapse({
  lng,
  menu,
  level,
  pathWithoutLastPart,
  pathDirect,
  hideMenu,
  onClick,
}: NavCollapseProps) {
  const lgDown = useMediaQuery((theme: Theme) => theme.breakpoints.down("lg"));
  const customizer = useSelector((state: IState) => state.customizer);
  const theme = useTheme();
  const { pathname } = useLocation();

  const [open, setOpen] = useState(false);

  const menuIcon = menu?.icon;

  // Check if any child is active
  const hasActiveChild = menu?.children?.some(
    (item: any) =>
      item?.href === pathname ||
      item?.children?.some((child: any) => child?.href === pathname)
  );

  // Check if this menu itself is active
  const isMenuActive = pathname === menu.href;
  const isActive = isMenuActive || hasActiveChild;

  const handleClick = () => {
    setOpen(!open);
  };

  // Auto-expand if child is active
  useEffect(() => {
    if (hasActiveChild) {
      setOpen(true);
    }
  }, [pathname, hasActiveChild]);

  const ListItemStyled = styled(ListItemButton)(() => ({
    position: "relative",
    marginBottom: "4px",
    padding: hideMenu ? "10px" : "12px 16px",
    gap: hideMenu ? "0" : "12px",
    borderRadius: `${customizer.borderRadius}px`,
    backgroundColor: isActive
      ? alpha(theme.palette.primary.main, 0.08)
      : "transparent",
    whiteSpace: "nowrap",
    justifyContent: hideMenu ? "center" : "flex-start",

    // Active/expanded indicator - hide when collapsed
    "&::before": hideMenu ? {} : {
      content: '""',
      position: "absolute",
      left: 0,
      top: "50%",
      transform: "translateY(-50%)",
      width: isActive ? "4px" : "0px",
      height: isActive ? "60%" : "0%",
      backgroundColor: theme.palette.primary.main,
      borderRadius: "0 4px 4px 0",
      transition: "all 0.2s ease-in-out",
    },

    "&:hover": {
      backgroundColor: alpha(theme.palette.primary.main, 0.06),
      color: theme.palette.primary.main,

      "&::before": hideMenu ? {} : {
        width: "4px",
        height: "40%",
      },

      "& .MuiListItemIcon-root": {
        color: theme.palette.primary.main,
        transform: "scale(1.1)",
      },
    },

    color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
  }));

  const iconStyle = {
    minWidth: "auto",
    width: 36,
    height: 36,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: `${customizer.borderRadius}px`,
    backgroundColor: isActive
      ? alpha(theme.palette.primary.main, 0.1)
      : "transparent",
    color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
    transition: "all 0.2s ease-in-out",
    "& svg": {
      fontSize: "1.25rem",
    },
  };

  // Submenu items
  const submenus = menu.children?.map((item: any) => {
    if (item.children) {
      return (
        <NavCollapse
          lng={lng}
          key={item?.id}
          menu={item}
          level={level + 1}
          pathWithoutLastPart={pathWithoutLastPart}
          pathDirect={pathDirect}
          hideMenu={hideMenu}
          onClick={onClick}
        />
      );
    }
    return (
      <NavItem
        lng={lng}
        key={item.id}
        item={item}
        level={level + 1}
        pathDirect={pathDirect}
        hideMenu={hideMenu}
        onClick={lgDown ? onClick : isNull}
      />
    );
  });

  return (
    <Box sx={{ mb: 0.5 }}>
      <ListItemStyled onClick={handleClick} selected={isMenuActive}>
        <ListItemIcon sx={iconStyle}>{menuIcon}</ListItemIcon>
        <ListItemText
          primary={
            hideMenu ? null : (
              <Typography
                variant="body2"
                sx={{
                  fontWeight: isActive ? 600 : 500,
                  fontSize: "0.875rem",
                  letterSpacing: "0.01em",
                }}
              >
                {menu.title}
              </Typography>
            )
          }
        />
        {!hideMenu && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 24,
              height: 24,
              borderRadius: "6px",
              backgroundColor: open
                ? alpha(theme.palette.primary.main, 0.1)
                : alpha(theme.palette.text.secondary, 0.06),
              color: open
                ? theme.palette.primary.main
                : theme.palette.text.secondary,
              transition: "all 0.2s ease-in-out",
              "& svg": {
                transition: "transform 0.2s ease-in-out",
              },
            }}
          >
            {open ? (
              <IoChevronDown size={14} />
            ) : (
              <IoChevronForward size={14} />
            )}
          </Box>
        )}
      </ListItemStyled>

      {!hideMenu && (
        <Collapse in={open} timeout={200} unmountOnExit>
          <Box
            sx={{
              pl: 1,
              ml: 2.5,
              borderLeft: `2px solid ${alpha(theme.palette.primary.main, 0.15)}`,
              position: "relative",
              "&::before": {
                content: '""',
                position: "absolute",
                left: -2,
                top: 0,
                bottom: 0,
                width: 2,
                background: hasActiveChild
                  ? `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.main, 0.3)} 100%)`
                  : "transparent",
                borderRadius: 1,
              },
            }}
          >
            {submenus}
          </Box>
        </Collapse>
      )}
    </Box>
  );
}
