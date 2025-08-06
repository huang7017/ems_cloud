"use client";
import React from "react";

import { useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

// mui imports
import Collapse from "@mui/material/Collapse";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import type { Theme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { styled, useTheme } from "@mui/material/styles";
// custom imports
import NavItem from "../NavItem";
import { isNull } from "lodash";

// plugins
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
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

// FC Component For Dropdown Menu
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

  // 直接使用 menu.icon 而不是作为组件
  const menuIcon = menu?.icon;

  const handleClick = () => {
    setOpen(!open);
  };

  // menu collapse for sub-levels
  React.useEffect(() => {
    setOpen(false);
    menu?.children?.forEach((item: any) => {
      if (item?.href === pathname) {
        setOpen(true);
      }
    });
  }, [pathname, menu.children]);

  // Check if current path matches this menu exactly (not its children)
  const isMenuActive = () => {
    // Only return true if current pathname matches this menu's href exactly
    return pathname === menu.href;
  };

  const ListItemStyled = styled(ListItemButton)(() => ({
    marginBottom: "2px",
    padding: "8px 10px",
    paddingLeft: hideMenu ? "10px" : level > 2 ? `${level * 15}px` : "10px",
    backgroundColor:
      isMenuActive() && level < 2 ? theme.palette.primary.dark : "transparent",
    whiteSpace: "nowrap",
    "&:hover": {
      backgroundColor: isMenuActive()
        ? theme.palette.primary.dark
        : theme.palette.action.hover,
      color: isMenuActive() ? "#ffffff" : theme.palette.primary.main,
    },
    color:
      isMenuActive() && level < 2
        ? "#ffffff"
        : level > 1 && isMenuActive()
        ? theme.palette.primary.main
        : theme.palette.text.secondary,
    borderRadius: `${customizer.borderRadius}px`,
  }));

  // If Menu has Children
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
    } else {
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
    }
  });

  return (
    <>
      <ListItemStyled
        onClick={handleClick}
        selected={isMenuActive()}
        key={menu?.id}
      >
        <ListItemIcon
          sx={{
            minWidth: "36px",
            p: "3px 0",
            color:
              isMenuActive() && level < 2
                ? "#ffffff"
                : theme.palette.text.secondary,
          }}
        >
          {menuIcon}
        </ListItemIcon>
        <ListItemText color="inherit" sx={{ pl: 1 }}>
          {hideMenu ? "" : <>{menu.title}</>}
        </ListItemText>
        {!open ? <FaChevronDown size="1rem" /> : <FaChevronUp size="1rem" />}
      </ListItemStyled>
      <Collapse in={open} timeout="auto">
        {submenus}
      </Collapse>
    </>
  );
}
